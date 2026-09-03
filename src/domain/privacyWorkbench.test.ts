import { beforeEach, describe, expect, it } from "vitest";
import { headlineInput } from "../fixtures";
import type { SimulationInput } from "../types";
import { PrivacyWorkbench } from "./privacyWorkbench";

const allErasableIds = [
  ...headlineInput.deleteCategoryIds,
  ...headlineInput.keepCategoryIds,
];

const allKeepInput = (
  consentChanges: SimulationInput["consentChanges"] = {},
): SimulationInput => ({
  deleteCategoryIds: [],
  keepCategoryIds: allErasableIds,
  consentChanges,
});

describe("PrivacyWorkbench", () => {
  let service: PrivacyWorkbench;

  beforeEach(() => {
    service = new PrivacyWorkbench();
  });

  it("provides the deterministic fixture and headline 9/2/3 plan", () => {
    expect(service.getInventory()).toHaveLength(14);
    expect(service.getConsentState()).toHaveLength(4);
    expect(service.getRetentionConstraints()).toHaveLength(2);

    const plan = service.simulatePlan(headlineInput);
    expect(plan.items.filter((item) => item.group === "delete")).toHaveLength(9);
    expect(plan.items.filter((item) => item.group === "retained")).toHaveLength(2);
    expect(plan.items.filter((item) => item.group === "keep")).toHaveLength(3);
    expect(plan.effects).toHaveLength(2);
    expect(plan.reductionPercent).toBe(92.6);
  });

  it("requires an explicit, non-overlapping partition without retained IDs", () => {
    expect(() =>
      service.simulatePlan({
        deleteCategoryIds: ["location_history"],
        keepCategoryIds: ["location_history"],
      }),
    ).toThrow("cannot be both deleted and kept");

    expect(() =>
      service.simulatePlan({
        deleteCategoryIds: ["location_history"],
        keepCategoryIds: [],
      }),
    ).toThrow("Every non-retained category must be explicitly deleted or kept");

    expect(() =>
      service.simulatePlan({
        deleteCategoryIds: [],
        keepCategoryIds: [...allErasableIds, "account_profile"],
      }),
    ).toThrow("exactly once");

    expect(() =>
      service.simulatePlan({
        deleteCategoryIds: [],
        keepCategoryIds: [
          ...allErasableIds,
          "payment_transaction_records",
        ],
      }),
    ).toThrow("must not appear in delete or keep");
  });

  it("versions plans uniquely and invalidates staging on a new simulation", () => {
    const first = service.simulatePlan(headlineInput);
    service.stageConsentChanges(first.id, { sale_or_sharing: false });
    service.stageErasureRequest(first.id, headlineInput.deleteCategoryIds);

    const second = service.simulatePlan(headlineInput);
    expect(second.id).not.toBe(first.id);
    expect(service.getState().stagedConsent).toBeNull();
    expect(service.getState().stagedErasure).toBeNull();
    expect(() =>
      service.stageErasureRequest(first.id, headlineInput.deleteCategoryIds),
    ).toThrow("does not match the visible plan");
  });

  it("preserves an optional human-readable cancellation note", () => {
    const plan = service.simulatePlan(headlineInput);
    service.cancelStagedPlan(plan.id, "Changed my mind");
    expect(service.getState().timeline.at(-1)?.detail).toContain(
      "Changed my mind",
    );
  });

  it("never reuses a plan identity after resetting the synthetic state", () => {
    const first = service.simulatePlan(headlineInput);
    service.reset();
    const second = service.simulatePlan(headlineInput);

    expect(second.id).not.toBe(first.id);
    expect(() =>
      service.stageErasureRequest(first.id, headlineInput.deleteCategoryIds),
    ).toThrow("does not match the visible plan");
  });

  it("treats personalized-ads opt-out as a direct contextual-ads effect", () => {
    const plan = service.simulatePlan(
      allKeepInput({ personalized_ads: false }),
    );
    expect(plan.effects.map((effect) => effect.id)).toEqual(["contextual-ads"]);
  });

  it("binds staged consent and export to the exact plan", () => {
    const plan = service.simulatePlan(headlineInput);
    expect(() =>
      service.stageConsentChanges(plan.id, { personalized_ads: false }),
    ).toThrow("must exactly match");
    expect(() =>
      service.stageConsentChanges("plan-stale", { sale_or_sharing: false }),
    ).toThrow("does not match the visible plan");
    expect(() =>
      service.stagePortabilityExport("plan-stale", "json", "all_data"),
    ).toThrow("does not match the visible plan");

    expect(
      service.stageConsentChanges(plan.id, { sale_or_sharing: false }).planId,
    ).toBe(plan.id);
    expect(
      service.stagePortabilityExport(plan.id, "json", "all_data").planId,
    ).toBe(plan.id);
  });

  it("does not durably mutate account state before visible confirmation", () => {
    const before = service.getConsentState();
    const plan = service.simulatePlan(headlineInput);
    service.stageConsentChanges(plan.id, { sale_or_sharing: false });
    service.stageErasureRequest(plan.id, headlineInput.deleteCategoryIds);

    expect(service.getConsentState()).toEqual(before);
    expect(service.getInventory().some((item) => item.status === "erased")).toBe(
      false,
    );
    expect(service.getReceipt()).toBeNull();
  });

  it("requires staged actions to remain coherent with the simulated plan", () => {
    const plan = service.simulatePlan(headlineInput);
    service.stageErasureRequest(plan.id, headlineInput.deleteCategoryIds);
    expect(() => service.confirmStagedActions()).toThrow(
      "consent changes that must be staged",
    );

    service.simulatePlan(headlineInput);
    const current = service.getState().plan!;
    service.stageConsentChanges(current.id, { sale_or_sharing: false });
    expect(() => service.confirmStagedActions()).toThrow(
      "erasure selections that must be staged",
    );
  });

  it("confirms erasure truthfully and prevents confirmed-state regression", () => {
    const plan = service.simulatePlan(headlineInput);
    expect(() =>
      service.stageErasureRequest(plan.id, ["location_history"]),
    ).toThrow("must exactly match");
    service.stageConsentChanges(plan.id, { sale_or_sharing: false });
    service.stageErasureRequest(plan.id, headlineInput.deleteCategoryIds);

    const receipt = service.confirmStagedActions();
    expect(receipt.erasure?.erasedCategoryIds).toHaveLength(9);
    expect(receipt.erasure?.retainedCategoryIds).toHaveLength(2);
    expect(receipt.erasure?.keptCategoryIds).toHaveLength(3);
    expect(service.getInventory().filter((item) => item.status === "erased")).toHaveLength(9);
    expect(service.getState().stagedErasure).toBeNull();
    expect(service.getState().stagedConsent).toBeNull();
    expect(
      service.getConsentState().find((choice) => choice.id === "sale_or_sharing")
        ?.enabled,
    ).toBe(false);

    expect(() => service.cancelStagedPlan(plan.id)).toThrow(
      "confirmed receipt cannot be cancelled",
    );
    expect(service.getReceipt()).toEqual(receipt);
    expect(() => service.simulatePlan(headlineInput)).toThrow(
      "confirmed receipt is immutable",
    );
  });

  it("rejects every staging path after confirmation without mutating receipt state", () => {
    const plan = service.simulatePlan(headlineInput);
    service.stageConsentChanges(plan.id, { sale_or_sharing: false });
    service.stageErasureRequest(plan.id, headlineInput.deleteCategoryIds);
    const receipt = service.confirmStagedActions();
    const confirmedState = service.getState();

    expect(() =>
      service.stageConsentChanges(plan.id, { sale_or_sharing: false }),
    ).toThrow("no additional actions can be staged");
    expect(() =>
      service.stageErasureRequest(plan.id, headlineInput.deleteCategoryIds),
    ).toThrow("no additional actions can be staged");
    expect(() =>
      service.stagePortabilityExport(plan.id, "json", "all_data"),
    ).toThrow("no additional actions can be staged");

    const afterRejectedStaging = service.getState();
    expect(afterRejectedStaging.receipt).toEqual(receipt);
    expect(afterRejectedStaging.stagedConsent).toBeNull();
    expect(afterRejectedStaging.stagedErasure).toBeNull();
    expect(afterRejectedStaging.stagedExport).toBeNull();
    expect(afterRejectedStaging.timeline).toEqual(confirmedState.timeline);
  });

  it("supports consent-only confirmation without fabricating erasure intent", () => {
    const plan = service.simulatePlan(
      allKeepInput({ sale_or_sharing: false }),
    );
    service.stageConsentChanges(plan.id, { sale_or_sharing: false });
    const receipt = service.confirmStagedActions();

    expect(receipt.erasure).toBeNull();
    expect(receipt.exportRequest).toBeNull();
    expect(receipt.consentChanges).toEqual({ sale_or_sharing: false });
    expect(service.getInventory().filter((item) => item.status === "erased")).toHaveLength(0);
  });

  it("supports export-only confirmation with independent receipt fields", () => {
    const plan = service.simulatePlan(allKeepInput());
    service.stagePortabilityExport(plan.id, "csv", "all_data");
    const receipt = service.confirmStagedActions();

    expect(receipt.erasure).toBeNull();
    expect(receipt.consentChanges).toEqual({});
    expect(receipt.exportRequest).toEqual({
      planId: plan.id,
      format: "csv",
      scope: "all_data",
    });
  });
});
