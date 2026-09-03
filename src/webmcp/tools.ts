import type { PrivacyWorkbench } from "../domain/privacyWorkbench";
import type { ConsentId, SimulationInput } from "../types";

export type WebMcpStatus =
  | { state: "unavailable"; detail: string }
  | { state: "registering"; detail: string }
  | { state: "ready"; detail: string }
  | { state: "error"; detail: string };

type Tool = WebMcpTool;

const noInputSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;

function ensureObject(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Tool input must be an object.");
  }
  return input as Record<string, unknown>;
}

function toolInput(
  input: unknown,
  allowedKeys: readonly string[],
): Record<string, unknown> {
  const object = ensureObject(input);
  const unexpected = Object.keys(object).filter(
    (key) => !allowedKeys.includes(key),
  );
  if (unexpected.length > 0) {
    throw new Error(`Unexpected tool input fields: ${unexpected.join(", ")}.`);
  }
  return object;
}

function stringArray(value: unknown, name: string): string[] {
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "string" || item.length === 0)
  ) {
    throw new Error(`${name} must be an array of category ID strings.`);
  }
  return value;
}

function planId(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("plan_id must be a non-empty string.");
  }
  return value;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Tool execution cancelled.", "AbortError");
  }
}

function synchronizeCommittedUi(synchronizeUi: () => void) {
  try {
    synchronizeUi();
  } catch (error) {
    console.warn("Visible UI synchronization failed at the commit point:", error);
  }
}

export function createWebMcpTools(
  service: PrivacyWorkbench,
  synchronizeUi: () => void = () => undefined,
): Tool[] {
  const readOnly = { readOnlyHint: true, untrustedContentHint: false };
  const mutating = { readOnlyHint: false, untrustedContentHint: false };
  return [
    {
      name: "get_data_inventory",
      title: "Read data inventory",
      description:
        "Read the signed-in synthetic account's 14 personal-data records, sizes, and current erasable, retained, or erased state. Use before planning deletion.",
      inputSchema: noInputSchema,
      annotations: readOnly,
      execute: async (input, options) => {
        toolInput(input, []);
        throwIfAborted(options?.signal);
        return { categories: service.getInventory() };
      },
    },
    {
      name: "get_consent_state",
      title: "Read consent choices",
      description:
        "Read all four current synthetic consent choices before proposing opt-in or opt-out changes.",
      inputSchema: noInputSchema,
      annotations: readOnly,
      execute: async (input, options) => {
        toolInput(input, []);
        throwIfAborted(options?.signal);
        return { consents: service.getConsentState() };
      },
    },
    {
      name: "get_retention_constraints",
      title: "Read retention rules",
      description:
        "Read explicit retention constraints that prevent immediate erasure and explain their synthetic rule and end date.",
      inputSchema: noInputSchema,
      annotations: readOnly,
      execute: async (input, options) => {
        toolInput(input, []);
        throwIfAborted(options?.signal);
        return { constraints: service.getRetentionConstraints() };
      },
    },
    {
      name: "simulate_privacy_plan",
      title: "Simulate privacy plan",
      description:
        "Simulate a reversible privacy plan, reorganize the visible data map, and calculate feature effects. This does not erase data or change consent.",
      inputSchema: {
        type: "object",
        properties: {
          delete_category_ids: {
            type: "array",
            items: { type: "string" },
            description: "Known category IDs requested for deletion.",
          },
          keep_category_ids: {
            type: "array",
            items: { type: "string" },
            description:
              "Known category IDs explicitly kept by user choice; include account_profile to keep the account active.",
          },
          consent_changes: {
            type: "object",
            description: "Proposed boolean values keyed by a known consent ID.",
            additionalProperties: { type: "boolean" },
          },
        },
        required: ["delete_category_ids", "keep_category_ids"],
        additionalProperties: false,
      },
      annotations: mutating,
      execute: (raw, options) => {
        const input = toolInput(raw, [
          "delete_category_ids",
          "keep_category_ids",
          "consent_changes",
        ]);
        throwIfAborted(options?.signal);
        const planInput: SimulationInput = {
          deleteCategoryIds: stringArray(
            input.delete_category_ids,
            "delete_category_ids",
          ),
          keepCategoryIds: stringArray(
            input.keep_category_ids,
            "keep_category_ids",
          ),
          consentChanges: (input.consent_changes ?? {}) as Partial<
            Record<ConsentId, boolean>
          >,
        };
        const plan = service.simulatePlan(planInput);
        synchronizeCommittedUi(synchronizeUi);
        return {
          plan_id: plan.id,
          groups: {
            delete: plan.items.filter((item) => item.group === "delete"),
            retained_by_rule: plan.items.filter(
              (item) => item.group === "retained",
            ),
            kept_by_choice: plan.items.filter((item) => item.group === "keep"),
          },
          reduction_percent: plan.reductionPercent,
          feature_effects: plan.effects,
          committed: false,
        };
      },
    },
    {
      name: "stage_consent_changes",
      title: "Stage consent changes",
      description:
        "Stage consent choices from the exact current plan in the visible workbench. No consequential commit tool is exposed; commitment uses the normal visible page control and remains subject to browser and agent safety confirmation.",
      inputSchema: {
        type: "object",
        properties: {
          plan_id: {
            type: "string",
            description: "The exact current simulated plan ID.",
          },
          changes: {
            type: "object",
            additionalProperties: { type: "boolean" },
            description: "Boolean values keyed by known consent IDs.",
          },
        },
        required: ["plan_id", "changes"],
        additionalProperties: false,
      },
      annotations: mutating,
      execute: (raw, options) => {
        const input = toolInput(raw, ["plan_id", "changes"]);
        throwIfAborted(options?.signal);
        const staged = service.stageConsentChanges(
          planId(input.plan_id),
          input.changes as Partial<Record<ConsentId, boolean>>,
        );
        synchronizeCommittedUi(synchronizeUi);
        return { staged, committed: false, visible_confirmation_required: true };
      },
    },
    {
      name: "stage_erasure_request",
      title: "Stage erasure request",
      description:
        "Stage the exact deletable categories from the current visible plan for review. No consequential commit tool is exposed; commitment uses the normal visible page control.",
      inputSchema: {
        type: "object",
        properties: {
          plan_id: { type: "string" },
          category_ids: { type: "array", items: { type: "string" } },
        },
        required: ["plan_id", "category_ids"],
        additionalProperties: false,
      },
      annotations: mutating,
      execute: (raw, options) => {
        const input = toolInput(raw, ["plan_id", "category_ids"]);
        throwIfAborted(options?.signal);
        const staged = service.stageErasureRequest(
          planId(input.plan_id),
          stringArray(input.category_ids, "category_ids"),
        );
        synchronizeCommittedUi(synchronizeUi);
        return { staged, committed: false, visible_confirmation_required: true };
      },
    },
    {
      name: "stage_portability_export",
      title: "Stage portability export",
      description:
        "Stage a synthetic JSON or CSV portability export against the exact current plan. No consequential commit tool is exposed; commitment uses the normal visible page control.",
      inputSchema: {
        type: "object",
        properties: {
          plan_id: {
            type: "string",
            description: "The exact current simulated plan ID.",
          },
          format: { type: "string", enum: ["json", "csv"] },
          scope: { type: "string", enum: ["all_data", "current_plan"] },
        },
        required: ["plan_id", "format", "scope"],
        additionalProperties: false,
      },
      annotations: mutating,
      execute: (raw, options) => {
        const input = toolInput(raw, ["plan_id", "format", "scope"]);
        throwIfAborted(options?.signal);
        if (input.format !== "json" && input.format !== "csv") {
          throw new Error("format must be json or csv.");
        }
        if (input.scope !== "all_data" && input.scope !== "current_plan") {
          throw new Error("scope must be all_data or current_plan.");
        }
        const staged = service.stagePortabilityExport(
          planId(input.plan_id),
          input.format,
          input.scope,
        );
        synchronizeCommittedUi(synchronizeUi);
        return { staged, committed: false, visible_confirmation_required: true };
      },
    },
    {
      name: "cancel_staged_privacy_plan",
      title: "Cancel staged plan",
      description:
        "Cancel the exact current reversible plan before confirmation, leaving account data and consent unchanged. Confirmed receipts cannot be cancelled.",
      inputSchema: {
        type: "object",
        properties: {
          plan_id: {
            type: "string",
            description: "The exact current simulated plan ID.",
          },
          reason: {
            type: "string",
            maxLength: 200,
            description: "Optional cancellation note.",
          },
        },
        required: ["plan_id"],
        additionalProperties: false,
      },
      annotations: mutating,
      execute: (raw, options) => {
        const input = toolInput(raw, ["plan_id", "reason"]);
        throwIfAborted(options?.signal);
        if (
          input.reason !== undefined &&
          (typeof input.reason !== "string" || input.reason.length > 200)
        ) {
          throw new Error("reason must be a string of at most 200 characters.");
        }
        const result = service.cancelStagedPlan(
          planId(input.plan_id),
          input.reason,
        );
        synchronizeCommittedUi(synchronizeUi);
        return { ...result, durable_account_change: false };
      },
    },
    {
      name: "get_privacy_receipt",
      title: "Read privacy receipt",
      description:
        "Read the immutable synthetic receipt after staged actions were committed through the normal visible page control.",
      inputSchema: noInputSchema,
      annotations: readOnly,
      execute: async (input, options) => {
        toolInput(input, []);
        throwIfAborted(options?.signal);
        const receipt = service.getReceipt();
        return receipt
          ? { available: true, receipt }
          : {
              available: false,
              message:
                "No receipt exists. Staged actions must be committed through the normal visible page control, subject to browser and agent safety confirmation.",
            };
      },
    },
  ];
}

export function registerWebMcpTools(
  service: PrivacyWorkbench,
  onStatus?: (status: WebMcpStatus) => void,
  contextOverride?: WebModelContext,
) {
  const browserContext =
    (typeof document !== "undefined" && document.modelContext) ||
    (typeof navigator !== "undefined" && navigator.modelContext) ||
    undefined;
  const modelContext = contextOverride || browserContext;

  if (!modelContext) {
    onStatus?.({
      state: "unavailable",
      detail: "Native WebMCP not detected — rehearsal remains available.",
    });
    return { ready: Promise.resolve(), dispose: () => undefined };
  }

  const controller = new AbortController();
  const attemptedNames: string[] = [];
  let cleanedUp = false;
  let disposed = false;
  const cleanup = (reason?: unknown) => {
    if (cleanedUp) return;
    cleanedUp = true;
    for (const name of attemptedNames.splice(0).reverse()) {
      try {
        modelContext.unregisterTool?.(name);
      } catch {
        // Transitional cleanup for Chrome previews before AbortSignal lifecycle.
      }
    }
    controller.abort(
      reason ?? new DOMException("Tool registration ended.", "AbortError"),
    );
  };
  onStatus?.({ state: "registering", detail: "Registering page tools…" });
  const tools = createWebMcpTools(service);
  const ready = (async () => {
    const pendingRegistrations: Promise<void>[] = [];
    try {
      for (const tool of tools) {
        attemptedNames.push(tool.name);
        try {
          const registration = modelContext.registerTool(tool, {
            signal: controller.signal,
          });
          pendingRegistrations.push(Promise.resolve(registration));
        } catch (error) {
          void Promise.allSettled(pendingRegistrations);
          throw error;
        }
      }

      await Promise.all(pendingRegistrations);
      if (controller.signal.aborted) {
        throw controller.signal.reason;
      }
      onStatus?.({
        state: "ready",
        detail: `${tools.length} native WebMCP tools ready.`,
      });
    } catch (error) {
      cleanup(error);
      if (!disposed) {
        onStatus?.({
          state: "error",
          detail:
            error instanceof Error ? error.message : "Tool registration failed.",
        });
        console.error("WebMCP registration failed:", error);
      }
      throw error;
    }
  })();
  void ready.catch(() => undefined);

  return {
    ready,
    dispose() {
      disposed = true;
      cleanup();
    },
  };
}
