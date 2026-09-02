import { describe, expect, it, vi } from "vitest";
import { headlineInput } from "../fixtures";
import { PrivacyWorkbench } from "../domain/privacyWorkbench";
import { createWebMcpTools, registerWebMcpTools } from "./tools";

const activeSignal = new AbortController().signal;

function deferred() {
  let resolve!: () => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("WebMCP tools", () => {
  it("exposes nine accurate imperative tool contracts with plan-bound staging", () => {
    const tools = createWebMcpTools(new PrivacyWorkbench());
    expect(tools.map((tool) => tool.name)).toEqual([
      "get_data_inventory",
      "get_consent_state",
      "get_retention_constraints",
      "simulate_privacy_plan",
      "stage_consent_changes",
      "stage_erasure_request",
      "stage_portability_export",
      "cancel_staged_privacy_plan",
      "get_privacy_receipt",
    ]);
    expect(
      tools.find((tool) => tool.name === "get_data_inventory")?.annotations
        ?.readOnlyHint,
    ).toBe(true);
    expect(
      tools.find((tool) => tool.name === "stage_erasure_request")?.annotations
        ?.readOnlyHint,
    ).toBe(false);
    for (const name of [
      "stage_consent_changes",
      "stage_erasure_request",
      "stage_portability_export",
      "cancel_staged_privacy_plan",
    ]) {
      const schema = tools.find((tool) => tool.name === name)
        ?.inputSchema as { required?: string[] };
      expect(schema.required).toContain("plan_id");
    }
  });

  it("synchronizes visible state before the mutating callback returns", () => {
    const service = new PrivacyWorkbench();
    let synchronized = false;
    const tools = createWebMcpTools(service, () => {
      synchronized = true;
    });
    const simulate = tools.find(
      (tool) => tool.name === "simulate_privacy_plan",
    )!;
    const result = simulate.execute(
      {
        delete_category_ids: headlineInput.deleteCategoryIds,
        keep_category_ids: headlineInput.keepCategoryIds,
        consent_changes: headlineInput.consentChanges,
      },
      { signal: activeSignal },
    ) as { groups: { delete: unknown[] }; committed: boolean };
    expect(synchronized).toBe(true);
    expect(result).not.toBeInstanceOf(Promise);
    expect(result.groups.delete).toHaveLength(9);
    expect(result.committed).toBe(false);
  });

  it("supports older callers that omit execute callback options", () => {
    const service = new PrivacyWorkbench();
    const simulate = createWebMcpTools(service).find(
      (tool) => tool.name === "simulate_privacy_plan",
    )!;

    const result = simulate.execute({
      delete_category_ids: headlineInput.deleteCategoryIds,
      keep_category_ids: headlineInput.keepCategoryIds,
      consent_changes: headlineInput.consentChanges,
    }) as { plan_id: string };

    expect(result.plan_id).toBe(service.getState().plan?.id);
  });

  it("rejects an already-aborted invocation before mutation", () => {
    const service = new PrivacyWorkbench();
    const tools = createWebMcpTools(service);
    const controller = new AbortController();
    controller.abort(new DOMException("Cancelled", "AbortError"));

    expect(() =>
      tools.find((tool) => tool.name === "simulate_privacy_plan")!.execute(
        {
          delete_category_ids: headlineInput.deleteCategoryIds,
          keep_category_ids: headlineInput.keepCategoryIds,
          consent_changes: headlineInput.consentChanges,
        },
        { signal: controller.signal },
      ),
    ).toThrow("Cancelled");
    expect(service.getState().plan).toBeNull();
  });

  it("does not await a deferred UI hook or reject after a late abort", () => {
    const service = new PrivacyWorkbench();
    const controller = new AbortController();
    let releaseHook!: () => void;
    const heldHook = new Promise<void>((resolve) => {
      releaseHook = resolve;
    });
    let visiblePlanId: string | undefined;
    const tools = createWebMcpTools(service, () => {
      visiblePlanId = service.getState().plan?.id;
      controller.abort(new DOMException("Late cancellation", "AbortError"));
      return heldHook;
    });

    const result = tools
      .find((tool) => tool.name === "simulate_privacy_plan")!
      .execute(
        {
          delete_category_ids: headlineInput.deleteCategoryIds,
          keep_category_ids: headlineInput.keepCategoryIds,
          consent_changes: headlineInput.consentChanges,
        },
        { signal: controller.signal },
      ) as { plan_id: string };

    expect(result).not.toBeInstanceOf(Promise);
    expect(result.plan_id).toBe(service.getState().plan?.id);
    expect(visiblePlanId).toBe(result.plan_id);
    expect(controller.signal.aborted).toBe(true);
    releaseHook();
  });

  it("keeps plan-bound staging non-destructive until visible confirmation", async () => {
    const service = new PrivacyWorkbench();
    const tools = createWebMcpTools(service);
    const byName = new Map(tools.map((tool) => [tool.name, tool]));
    const simulated = (await byName.get("simulate_privacy_plan")!.execute(
      {
        delete_category_ids: headlineInput.deleteCategoryIds,
        keep_category_ids: headlineInput.keepCategoryIds,
        consent_changes: headlineInput.consentChanges,
      },
      { signal: activeSignal },
    )) as { plan_id: string };
    await byName.get("stage_consent_changes")!.execute(
      {
        plan_id: simulated.plan_id,
        changes: { sale_or_sharing: false },
      },
      { signal: activeSignal },
    );
    await byName.get("stage_erasure_request")!.execute(
      {
        plan_id: simulated.plan_id,
        category_ids: headlineInput.deleteCategoryIds,
      },
      { signal: activeSignal },
    );
    expect(service.getReceipt()).toBeNull();
    expect(
      service.getConsentState().find((choice) => choice.id === "sale_or_sharing")
        ?.enabled,
    ).toBe(true);
  });

  it("awaits successful registration and aborts lifecycle on dispose", async () => {
    const registered: Array<{ tool: WebMcpTool; signal?: AbortSignal }> = [];
    const context: WebModelContext = {
      registerTool: vi.fn(async (tool, options) => {
        registered.push({ tool, signal: options?.signal });
      }),
    };
    const statuses: string[] = [];
    const registration = registerWebMcpTools(
      new PrivacyWorkbench(),
      (status) => statuses.push(status.state),
      context,
    );
    await registration.ready;
    expect(registered).toHaveLength(9);
    expect(statuses).toEqual(["registering", "ready"]);
    expect(registered[0].signal?.aborted).toBe(false);
    registration.dispose();
    expect(registered[0].signal?.aborted).toBe(true);
  });

  it("initiates every registration before awaiting any settlement", async () => {
    const registrations = Array.from({ length: 9 }, () => deferred());
    const calls: string[] = [];
    const context: WebModelContext = {
      registerTool: vi.fn((tool) => {
        calls.push(tool.name);
        return registrations[calls.length - 1].promise;
      }),
    };
    const statuses: string[] = [];
    const registration = registerWebMcpTools(
      new PrivacyWorkbench(),
      (status) => statuses.push(status.state),
      context,
    );

    expect(calls).toHaveLength(9);
    expect(statuses).toEqual(["registering"]);
    registrations.forEach(({ resolve }) => resolve());
    await registration.ready;
    expect(statuses).toEqual(["registering", "ready"]);
    registration.dispose();
  });

  it("cleans every attempted name when one asynchronous registration fails", async () => {
    const registrations = Array.from({ length: 9 }, () => deferred());
    const calls: Array<{ name: string; signal?: AbortSignal }> = [];
    const unregisterTool = vi.fn();
    const failure = new Error("registration failed");
    const context: WebModelContext = {
      registerTool: vi.fn((tool, options) => {
        calls.push({ name: tool.name, signal: options?.signal });
        return registrations[calls.length - 1].promise;
      }),
      unregisterTool,
    };
    const statuses: string[] = [];
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const registration = registerWebMcpTools(
      new PrivacyWorkbench(),
      (status) => statuses.push(status.state),
      context,
    );

    expect(calls).toHaveLength(9);
    registrations.forEach((registrationPromise, index) => {
      if (index === 3) registrationPromise.reject(failure);
      else registrationPromise.resolve();
    });
    await expect(registration.ready).rejects.toBe(failure);
    expect(statuses).toEqual(["registering", "error"]);
    expect(statuses).not.toContain("ready");
    expect(unregisterTool.mock.calls.map(([name]) => name)).toEqual(
      calls.map(({ name }) => name).reverse(),
    );
    expect(calls[0].signal?.aborted).toBe(true);
    registration.dispose();
    expect(unregisterTool).toHaveBeenCalledTimes(9);
    errorLog.mockRestore();
  });

  it("cleans attempted names immediately when registration throws synchronously", async () => {
    const registrations = Array.from({ length: 3 }, () => deferred());
    const calls: Array<{ name: string; signal?: AbortSignal }> = [];
    const unregisterTool = vi.fn();
    const failure = new Error("synchronous registration failure");
    const context: WebModelContext = {
      registerTool: vi.fn((tool, options) => {
        calls.push({ name: tool.name, signal: options?.signal });
        if (calls.length === 4) throw failure;
        return registrations[calls.length - 1].promise;
      }),
      unregisterTool,
    };
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const registration = registerWebMcpTools(
      new PrivacyWorkbench(),
      undefined,
      context,
    );

    expect(calls).toHaveLength(4);
    expect(unregisterTool.mock.calls.map(([name]) => name)).toEqual(
      calls.map(({ name }) => name).reverse(),
    );
    expect(calls[0].signal?.aborted).toBe(true);
    registrations.forEach(({ resolve }) => resolve());
    await expect(registration.ready).rejects.toBe(failure);
    errorLog.mockRestore();
  });

  it("disposes safely while all registrations are still pending", async () => {
    const registrations = Array.from({ length: 9 }, () => deferred());
    const signals: AbortSignal[] = [];
    const unregisterTool = vi.fn();
    const context: WebModelContext = {
      registerTool: vi.fn((_tool, options) => {
        signals.push(options!.signal!);
        return registrations[signals.length - 1].promise;
      }),
      unregisterTool,
    };
    const statuses: string[] = [];
    const registration = registerWebMcpTools(
      new PrivacyWorkbench(),
      (status) => statuses.push(status.state),
      context,
    );

    expect(signals).toHaveLength(9);
    registration.dispose();
    expect(signals.every((signal) => signal.aborted)).toBe(true);
    expect(unregisterTool).toHaveBeenCalledTimes(9);
    registrations.forEach(({ resolve }) => resolve());
    await expect(registration.ready).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(statuses).toEqual(["registering"]);
  });
});
