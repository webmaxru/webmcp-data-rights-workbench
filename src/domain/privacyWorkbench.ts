import {
  categories as fixtureCategories,
  consents as fixtureConsents,
  constraints as fixtureConstraints,
} from "../fixtures";
import type {
  ConsentId,
  PrivacyPlan,
  PrivacyReceipt,
  SimulationInput,
  StagedConsent,
  StagedExport,
  TimelineEvent,
  WorkbenchState,
} from "../types";

const VALID_CONSENT_IDS = new Set<ConsentId>([
  "personalized_ads",
  "sale_or_sharing",
  "location_personalization",
  "product_analytics",
]);

const copyState = (state: WorkbenchState): WorkbenchState =>
  structuredClone(state);

function initialTimeline(): TimelineEvent[] {
  return [
    {
      id: "ready",
      label: "Synthetic account loaded",
      detail: "14 categories and four consent choices are ready to inspect.",
      tone: "neutral",
    },
  ];
}

export class PrivacyWorkbench {
  private listeners = new Set<() => void>();
  private planCounter = 0;
  private state: WorkbenchState = {
    categories: structuredClone(fixtureCategories),
    consents: structuredClone(fixtureConsents),
    constraints: structuredClone(fixtureConstraints),
    plan: null,
    stagedErasure: null,
    stagedConsent: null,
    stagedExport: null,
    receipt: null,
    timeline: initialTimeline(),
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getState = () => copyState(this.state);

  reset() {
    this.state = {
      categories: structuredClone(fixtureCategories),
      consents: structuredClone(fixtureConsents),
      constraints: structuredClone(fixtureConstraints),
      plan: null,
      stagedErasure: null,
      stagedConsent: null,
      stagedExport: null,
      receipt: null,
      timeline: initialTimeline(),
    };
    this.emit();
  }

  getInventory() {
    return structuredClone(this.state.categories);
  }

  getConsentState() {
    return structuredClone(this.state.consents);
  }

  getRetentionConstraints() {
    return structuredClone(this.state.constraints);
  }

  simulatePlan(input: SimulationInput): PrivacyPlan {
    if (this.state.receipt) {
      throw new Error(
        "The confirmed receipt is immutable. Reset the synthetic demo before creating another plan.",
      );
    }
    this.validateSimulation(input);
    const deleteSet = new Set(input.deleteCategoryIds);
    const retainedById = new Map(
      this.state.constraints.map((constraint) => [
        constraint.categoryId,
        constraint,
      ]),
    );

    const items = this.state.categories.map((category) => {
      const constraint = retainedById.get(category.id);
      if (constraint) {
        return {
          ...category,
          group: "retained" as const,
          reason: `${constraint.rule} until ${constraint.until}`,
        };
      }
      if (deleteSet.has(category.id)) {
        return {
          ...category,
          group: "delete" as const,
          reason: "Selected for erasure if confirmed through the visible control",
        };
      }
      return {
        ...category,
        group: "keep" as const,
        reason: "Kept by explicit user choice",
      };
    });

    const totalBytes = items.reduce((sum, item) => sum + item.bytes, 0);
    const deleteBytes = items
      .filter((item) => item.group === "delete")
      .reduce((sum, item) => sum + item.bytes, 0);
    const effects = [];
    if (
      deleteSet.has("location_history") ||
      input.consentChanges?.location_personalization === false
    ) {
      effects.push({
        id: "nearby-shortcuts",
        title: "Nearby shortcuts become less familiar",
        explanation:
          "The product can still use an address you enter, but it will stop learning frequently visited places.",
        severity: "warning" as const,
      });
    }
    if (
      deleteSet.has("advertising_profiles") ||
      input.consentChanges?.sale_or_sharing === false ||
      input.consentChanges?.personalized_ads === false
    ) {
      effects.push({
        id: "contextual-ads",
        title: "Ads become contextual, not personalized",
        explanation:
          "You may still see ads, but audience profiles and cross-context sharing will no longer shape them.",
        severity: "notice" as const,
      });
    }

    const plan: PrivacyPlan = {
      id: `plan-${String(++this.planCounter).padStart(3, "0")}`,
      items,
      consentChanges: { ...(input.consentChanges ?? {}) },
      effects,
      deleteBytes,
      totalBytes,
      reductionPercent: Number(((deleteBytes / totalBytes) * 100).toFixed(1)),
    };

    this.state.plan = plan;
    this.state.stagedErasure = null;
    this.state.stagedConsent = null;
    this.state.stagedExport = null;
    this.state.timeline = this.state.timeline.filter(
      (event) => event.id === "ready",
    );
    this.addTimeline(
      "plan",
      "Privacy plan simulated",
      `${items.filter((item) => item.group === "delete").length} categories can be erased; ${effects.length} feature effects identified.`,
      "active",
    );
    this.emit();
    return structuredClone(plan);
  }

  stageConsentChanges(
    planId: string,
    changes: Partial<Record<ConsentId, boolean>>,
  ): StagedConsent {
    const plan = this.requireUnconfirmedPlan(planId);
    this.validateConsentChanges(changes);
    if (Object.keys(changes).length === 0) {
      throw new Error("At least one consent change is required for staging.");
    }
    if (!this.consentChangesMatch(plan.consentChanges, changes)) {
      throw new Error(
        "Staged consent changes must exactly match the current simulated plan.",
      );
    }
    this.state.stagedConsent = { planId, changes: { ...changes } };
    this.addTimeline(
      "consent",
      "Consent changes staged",
      `${Object.keys(changes).length} consent choice is ready for visible confirmation.`,
      "active",
    );
    this.emit();
    return structuredClone(this.state.stagedConsent);
  }

  stageErasureRequest(planId: string, categoryIds: string[]) {
    const plan = this.requireUnconfirmedPlan(planId);
    const planned = plan.items
      .filter((item) => item.group === "delete")
      .map((item) => item.id);
    const submitted = [...new Set(categoryIds)];
    if (planned.length === 0) {
      throw new Error("The current plan contains no erasure action to stage.");
    }
    if (
      submitted.length !== categoryIds.length ||
      submitted.length !== planned.length ||
      submitted.some((id) => !planned.includes(id))
    ) {
      throw new Error(
        "The erasure request must exactly match the simulated deletable category IDs.",
      );
    }
    this.state.stagedErasure = { planId, categoryIds: submitted };
    this.addTimeline(
      "erasure",
      "Erasure request staged",
      `${submitted.length} categories are queued for visible review, not yet deleted.`,
      "active",
    );
    this.emit();
    return structuredClone(this.state.stagedErasure);
  }

  stagePortabilityExport(
    planId: string,
    format: "json" | "csv",
    scope: "all_data" | "current_plan",
  ) {
    this.requireUnconfirmedPlan(planId);
    const exportRequest: StagedExport = { planId, format, scope };
    this.state.stagedExport = exportRequest;
    this.addTimeline(
      "export",
      "Portability export staged",
      `${format.toUpperCase()} export is ready for visible confirmation.`,
      "active",
    );
    this.emit();
    return structuredClone(exportRequest);
  }

  cancelStagedPlan(planId: string, reason?: string) {
    if (this.state.receipt) {
      throw new Error("A confirmed receipt cannot be cancelled or removed.");
    }
    this.requirePlan(planId);
    this.state.plan = null;
    this.state.stagedErasure = null;
    this.state.stagedConsent = null;
    this.state.stagedExport = null;
    this.addTimeline(
      "cancel",
      "Staged plan cancelled",
      reason
        ? `No account data or consent choice was changed. Note: ${reason}`
        : "No account data or consent choice was changed.",
      "neutral",
    );
    this.emit();
    return { cancelled: true };
  }

  confirmStagedActions(): PrivacyReceipt {
    const plan = this.state.plan;
    if (!plan) {
      throw new Error("There is no visible plan to confirm.");
    }
    if (this.state.receipt) {
      throw new Error("This plan has already been confirmed.");
    }
    if (
      !this.state.stagedErasure &&
      !this.state.stagedConsent &&
      !this.state.stagedExport
    ) {
      throw new Error(
        "Stage at least one supported action before using the visible confirmation control.",
      );
    }
    const plannedDeleteCount = plan.items.filter(
      (item) => item.group === "delete",
    ).length;
    if (plannedDeleteCount > 0 && !this.state.stagedErasure) {
      throw new Error(
        "The current plan includes erasure selections that must be staged before confirmation.",
      );
    }
    if (
      Object.keys(plan.consentChanges).length > 0 &&
      !this.state.stagedConsent
    ) {
      throw new Error(
        "The current plan includes consent changes that must be staged before confirmation.",
      );
    }
    for (const stagedPlanId of [
      this.state.stagedErasure?.planId,
      this.state.stagedConsent?.planId,
      this.state.stagedExport?.planId,
    ]) {
      if (stagedPlanId && stagedPlanId !== plan.id) {
        throw new Error("A staged action does not match the current visible plan.");
      }
    }
    if (this.state.stagedConsent) {
      this.state.consents = this.state.consents.map((consent) => ({
        ...consent,
        enabled:
          this.state.stagedConsent!.changes[consent.id] ?? consent.enabled,
      }));
    }
    if (this.state.stagedErasure) {
      const erased = new Set(this.state.stagedErasure.categoryIds);
      this.state.categories = this.state.categories.map((category) =>
        erased.has(category.id) ? { ...category, status: "erased" } : category,
      );
      plan.items = plan.items.map((item) =>
        erased.has(item.id)
          ? {
              ...item,
              status: "erased",
              reason: "Erased after confirmation through the visible control",
            }
          : item,
      );
    }

    const receipt: PrivacyReceipt = {
      id: `PDR-2026-0902-${String(this.planCounter).padStart(3, "0")}`,
      planId: plan.id,
      confirmedAt: "2026-09-02T08:00:00.000Z",
      erasure: this.state.stagedErasure
        ? {
            erasedCategoryIds: [...this.state.stagedErasure.categoryIds],
            retainedCategoryIds: plan.items
              .filter((item) => item.group === "retained")
              .map((item) => item.id),
            keptCategoryIds: plan.items
              .filter((item) => item.group === "keep")
              .map((item) => item.id),
          }
        : null,
      consentChanges: { ...(this.state.stagedConsent?.changes ?? {}) },
      exportRequest: this.state.stagedExport
        ? { ...this.state.stagedExport }
        : null,
      status: "confirmed",
    };
    this.state.receipt = receipt;
    this.state.stagedErasure = null;
    this.state.stagedConsent = null;
    this.state.stagedExport = null;
    this.addTimeline(
      "confirmed",
      "Staged actions confirmed",
      `Receipt ${receipt.id} is now available as a read-only record.`,
      "success",
    );
    this.emit();
    return structuredClone(receipt);
  }

  getReceipt() {
    return this.state.receipt ? structuredClone(this.state.receipt) : null;
  }

  private validateSimulation(input: SimulationInput) {
    if (
      !Array.isArray(input.deleteCategoryIds) ||
      !Array.isArray(input.keepCategoryIds)
    ) {
      throw new Error("deleteCategoryIds and keepCategoryIds must be arrays.");
    }
    const knownIds = new Set(this.state.categories.map((category) => category.id));
    const allIds = [...input.deleteCategoryIds, ...input.keepCategoryIds];
    const invalid = allIds.filter(
      (id) => typeof id !== "string" || !knownIds.has(id),
    );
    if (invalid.length > 0) {
      throw new Error(`Unknown category IDs: ${invalid.join(", ")}.`);
    }
    const duplicateDelete = input.deleteCategoryIds.filter(
      (id, index) => input.deleteCategoryIds.indexOf(id) !== index,
    );
    const duplicateKeep = input.keepCategoryIds.filter(
      (id, index) => input.keepCategoryIds.indexOf(id) !== index,
    );
    if (duplicateDelete.length > 0 || duplicateKeep.length > 0) {
      throw new Error("Each category must appear exactly once in the plan.");
    }
    const overlap = input.deleteCategoryIds.filter((id) =>
      input.keepCategoryIds.includes(id),
    );
    if (overlap.length > 0) {
      throw new Error(
        `A category cannot be both deleted and kept: ${overlap.join(", ")}.`,
      );
    }
    const retainedIds = new Set(
      this.state.constraints.map((constraint) => constraint.categoryId),
    );
    const retained = allIds.filter((id) => retainedIds.has(id));
    if (retained.length > 0) {
      throw new Error(
        `Retained categories are classified automatically and must not appear in delete or keep: ${retained.join(", ")}.`,
      );
    }
    const partitioned = new Set(allIds);
    const missing = this.state.categories
      .filter((category) => !retainedIds.has(category.id))
      .map((category) => category.id)
      .filter((id) => !partitioned.has(id));
    if (missing.length > 0) {
      throw new Error(
        `Every non-retained category must be explicitly deleted or kept. Missing: ${missing.join(", ")}.`,
      );
    }
    this.validateConsentChanges(input.consentChanges ?? {});
  }

  private consentChangesMatch(
    expected: Partial<Record<ConsentId, boolean>>,
    actual: Partial<Record<ConsentId, boolean>>,
  ) {
    const expectedEntries = Object.entries(expected).sort();
    const actualEntries = Object.entries(actual).sort();
    return (
      expectedEntries.length === actualEntries.length &&
      expectedEntries.every(
        ([id, value], index) =>
          actualEntries[index]?.[0] === id &&
          actualEntries[index]?.[1] === value,
      )
    );
  }

  private validateConsentChanges(
    changes: Partial<Record<ConsentId, boolean>>,
  ) {
    if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
      throw new Error("Consent changes must be an object.");
    }
    for (const [id, value] of Object.entries(changes)) {
      if (!VALID_CONSENT_IDS.has(id as ConsentId)) {
        throw new Error(`Unknown consent choice: ${id}.`);
      }
      if (typeof value !== "boolean") {
        throw new Error(`Consent value for ${id} must be true or false.`);
      }
    }
  }

  private requirePlan(planId: string) {
    if (!this.state.plan || this.state.plan.id !== planId) {
      throw new Error("The plan ID is missing or does not match the visible plan.");
    }
    return this.state.plan;
  }

  private requireUnconfirmedPlan(planId: string) {
    if (this.state.receipt) {
      throw new Error(
        "The confirmed receipt is immutable; no additional actions can be staged.",
      );
    }
    return this.requirePlan(planId);
  }

  private addTimeline(
    id: string,
    label: string,
    detail: string,
    tone: TimelineEvent["tone"],
  ) {
    this.state.timeline = [
      ...this.state.timeline.filter((event) => event.id !== id),
      { id, label, detail, tone },
    ];
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }
}

export const privacyWorkbench = new PrivacyWorkbench();
