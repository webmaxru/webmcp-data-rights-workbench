import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { headlineInput } from "./fixtures";
import { privacyWorkbench } from "./domain/privacyWorkbench";
import type {
  ConsentId,
  PlanGroup,
  PrivacyPlan,
  WorkbenchState,
} from "./types";
import {
  registerWebMcpTools,
  type WebMcpStatus,
} from "./webmcp/tools";
import "./styles.css";

const formatBytes = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

function useWorkbenchState() {
  const [state, setState] = useState<WorkbenchState>(
    privacyWorkbench.getState(),
  );
  useEffect(
    () =>
      privacyWorkbench.subscribe(() => {
        flushSync(() => setState(privacyWorkbench.getState()));
      }),
    [],
  );
  return state;
}

function StatusPill({ status }: { status: WebMcpStatus }) {
  return (
    <div className={`status-pill status-${status.state}`} role="status">
      <span className="status-dot" aria-hidden="true" />
      <span>
        <strong>
          {status.state === "ready"
            ? "WebMCP ready"
            : status.state === "unavailable"
              ? "WebMCP unavailable"
              : status.state === "error"
                ? "WebMCP needs attention"
                : "Connecting WebMCP"}
        </strong>
        <small>{status.detail}</small>
      </span>
    </div>
  );
}

function CategoryCard({
  item,
  group,
}: {
  item: WorkbenchState["categories"][number] & { reason?: string };
  group: PlanGroup | "inventory";
}) {
  return (
    <article className={`category-card group-${group} status-${item.status}`}>
      <div className="category-topline">
        <span className="category-icon" aria-hidden="true">
          {item.icon}
        </span>
        <span className="category-size">
          {item.status === "erased" ? "Erased" : formatBytes(item.bytes)}
        </span>
      </div>
      <h4>{item.name}</h4>
      <p>{item.description}</p>
      {item.reason && <span className="category-reason">{item.reason}</span>}
    </article>
  );
}

function DataMap({ state }: { state: WorkbenchState }) {
  if (!state.plan) {
    return (
      <div className="inventory-grid">
        {state.categories.map((category) => (
          <CategoryCard key={category.id} item={category} group="inventory" />
        ))}
      </div>
    );
  }
  const plannedDeleteCount = state.plan.items.filter(
    (item) => item.group === "delete",
  ).length;
  const groups: Array<{
    id: PlanGroup;
    title: string;
    hint: string;
  }> = [
    {
      id: "delete",
      title:
        plannedDeleteCount === 0
          ? "No erasure selected"
          : state.receipt?.erasure
            ? "Erased"
            : state.receipt
              ? "Planned, not committed"
              : "Delete",
      hint:
        plannedDeleteCount === 0
          ? "Explicitly empty delete group"
          : state.receipt?.erasure
            ? "Committed result"
            : state.receipt
              ? "No erasure action was confirmed"
              : "If confirmed through the visible control",
    },
    { id: "retained", title: "Retained by rule", hint: "Time-limited exceptions" },
    { id: "keep", title: "Kept by choice", hint: "Your stated intent" },
  ];
  return (
    <div className="plan-groups">
      {groups.map((group) => {
        const items = state.plan!.items.filter((item) => item.group === group.id);
        return (
          <section className={`plan-group plan-${group.id}`} key={group.id}>
            <header>
              <div>
                <span className="eyebrow">{group.hint}</span>
                <h3>{group.title}</h3>
              </div>
              <span className="count-badge">{items.length}</span>
            </header>
            <div className="group-grid">
              {items.map((item) => (
                <CategoryCard key={item.id} item={item} group={group.id} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ReviewPanel({
  state,
  onConfirm,
  onCancel,
}: {
  state: WorkbenchState;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const plan = state.plan;
  if (!plan) {
    return (
      <aside className="review-panel empty-review">
        <span className="review-orbit" aria-hidden="true">14</span>
        <h2>Your review will appear here</h2>
        <p>
          Inspect the account with WebMCP, or run the deterministic rehearsal to
          build a reversible plan.
        </p>
        <ul>
          <li>No network requests</li>
          <li>No hidden account changes</li>
          <li>No consequential commit tool is exposed</li>
          <li>Final commitment uses a visible page control</li>
        </ul>
      </aside>
    );
  }

  const stagedConsentEntries = Object.entries(
    state.stagedConsent?.changes ?? {},
  );
  const plannedConsentEntries = Object.entries(plan.consentChanges);
  const receiptConsentEntries = Object.entries(
    state.receipt?.consentChanges ?? {},
  );
  const consentName = (id: string) =>
    state.consents.find((consent) => consent.id === id)?.name ??
    id.replaceAll("_", " ");
  const hasStagedAction = Boolean(
    state.stagedErasure || state.stagedConsent || state.stagedExport,
  );
  const plannedDeleteCount = plan.items.filter(
    (item) => item.group === "delete",
  ).length;
  const canConfirm =
    hasStagedAction &&
    (plannedDeleteCount === 0 || Boolean(state.stagedErasure)) &&
    (plannedConsentEntries.length === 0 || Boolean(state.stagedConsent));
  const stagedRows = [
    {
      label: "Erase",
      value:
        plannedDeleteCount === 0
          ? "No erasure planned"
          : state.stagedErasure
        ? `${state.stagedErasure.categoryIds.length} categories staged`
        : "Not staged",
      ready: plannedDeleteCount === 0 || Boolean(state.stagedErasure),
    },
    {
      label: "Retain",
      value: `${plan.items.filter((item) => item.group === "retained").length} constrained`,
      ready: true,
    },
    {
      label: "Keep",
      value: `${plan.items.filter((item) => item.group === "keep").length} by choice`,
      ready: true,
    },
    ...plannedConsentEntries.map(([id, enabled]) => ({
      label: "Consent",
      value: `${consentName(id)}: ${enabled ? "On" : "Off"}${state.stagedConsent ? "" : " · not staged"}`,
      ready: Boolean(
        stagedConsentEntries.find(
          ([stagedId, stagedValue]) =>
            stagedId === id && stagedValue === enabled,
        ),
      ),
    })),
    {
      label: "Export",
      value: state.stagedExport
        ? `${state.stagedExport.format.toUpperCase()} · ${state.stagedExport.scope.replaceAll("_", " ")}`
        : "Not staged",
      ready: Boolean(state.stagedExport),
    },
  ];
  const confirmedRows = [
    ...(state.receipt?.erasure
      ? [
          {
            label: "Erasure",
            value: `${state.receipt.erasure.erasedCategoryIds.length} categories confirmed`,
            ready: true,
          },
        ]
      : []),
    ...receiptConsentEntries.map(([id, enabled]) => ({
      label: "Consent",
      value: `${consentName(id)}: ${enabled ? "On" : "Off"}`,
      ready: true,
    })),
    ...(state.receipt?.exportRequest
      ? [
          {
            label: "Export",
            value: `${state.receipt.exportRequest.format.toUpperCase()} · ${state.receipt.exportRequest.scope.replaceAll("_", " ")}`,
            ready: true,
          },
        ]
      : []),
  ];
  const rows = state.receipt ? confirmedRows : stagedRows;

  return (
    <aside className="review-panel">
      <span className="eyebrow">
        {state.receipt ? "Committed result" : "Commit checkpoint"}
      </span>
      <h2>{state.receipt ? "Actions confirmed" : "Review staged request"}</h2>
      <p className="review-intro">
        {state.receipt
          ? "The receipt is immutable for this synthetic session, and committed state is reflected throughout the page."
          : "No consequential commit tool is exposed through WebMCP. Final commitment uses this normal visible control and remains subject to browser and agent safety confirmation."}
      </p>
      <div className="review-matrix">
        {rows.map((row) => (
          <div className="review-row" key={row.label}>
            <span className={row.ready ? "row-check ready" : "row-check"}>
              {row.ready ? "✓" : "—"}
            </span>
            <span>
              <small>{row.label}</small>
              <strong>{row.value}</strong>
            </span>
          </div>
        ))}
      </div>
      {!state.receipt && (
        <div className="safety-note">
          <span aria-hidden="true">◎</span>
          <p>
            <strong>Staged, not committed.</strong> Data and consent remain
            unchanged until the visible confirmation control is actuated.
          </p>
        </div>
      )}
      <button
        className="confirm-button"
        onClick={onConfirm}
        disabled={!canConfirm || Boolean(state.receipt)}
      >
        {state.receipt ? "Actions confirmed" : "Confirm staged actions"}
      </button>
      {!state.receipt && (
        <button className="text-button" onClick={onCancel}>
          Cancel staged plan
        </button>
      )}
    </aside>
  );
}

function PlanSummary({
  plan,
  confirmed,
}: {
  plan: PrivacyPlan;
  confirmed: boolean;
}) {
  return (
    <section className="impact-strip" aria-label="Plan impact summary">
      <div className="impact-score">
        <span className="score-number">{plan.reductionPercent}%</span>
        <span>
          {confirmed ? "demo bytes erased" : "demo bytes selected for deletion"}
        </span>
      </div>
      <div className="impact-bar" aria-hidden="true">
        <span style={{ width: `${plan.reductionPercent}%` }} />
      </div>
      <div className="impact-detail">
        <strong>{formatBytes(plan.deleteBytes)}</strong>
        <span>of {formatBytes(plan.totalBytes)}</span>
      </div>
    </section>
  );
}

export default function App() {
  const state = useWorkbenchState();
  const [webMcpStatus, setWebMcpStatus] = useState<WebMcpStatus>({
    state: "registering",
    detail: "Checking browser support…",
  });
  const [rehearsing, setRehearsing] = useState(false);

  useEffect(() => {
    const registration = registerWebMcpTools(
      privacyWorkbench,
      setWebMcpStatus,
    );
    void registration.ready.catch(() => undefined);
    return registration.dispose;
  }, []);

  const stagedConsentChanges = state.stagedConsent?.changes ?? {};
  const stagedConsentLabel = useMemo(() => {
    const entries = Object.entries(stagedConsentChanges);
    if (!entries.length) return "No consent changes staged";
    return entries
      .map(([id, enabled]) => `${id.replaceAll("_", " ")}: ${enabled ? "on" : "off"}`)
      .join(", ");
  }, [stagedConsentChanges]);

  const runRehearsal = async () => {
    setRehearsing(true);
    privacyWorkbench.reset();
    await new Promise((resolve) => setTimeout(resolve, 250));
    const plan = privacyWorkbench.simulatePlan(headlineInput);
    await new Promise((resolve) => setTimeout(resolve, 500));
    privacyWorkbench.stageConsentChanges(
      plan.id,
      headlineInput.consentChanges as Partial<Record<ConsentId, boolean>>,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    privacyWorkbench.stageErasureRequest(
      plan.id,
      plan.items.filter((item) => item.group === "delete").map((item) => item.id),
    );
    setRehearsing(false);
  };

  const confirm = () => {
    privacyWorkbench.confirmStagedActions();
  };

  const availableBytes = state.categories
    .filter((category) => category.status !== "erased")
    .reduce((sum, category) => sum + category.bytes, 0);
  const erasedCount = state.categories.filter(
    (category) => category.status === "erased",
  ).length;
  const receiptSummary = state.receipt
    ? [
        state.receipt.erasure
          ? `${state.receipt.erasure.erasedCategoryIds.length} categories erased, ${state.receipt.erasure.retainedCategoryIds.length} retained by rule, and ${state.receipt.erasure.keptCategoryIds.length} kept by choice`
          : null,
        Object.keys(state.receipt.consentChanges).length
          ? `${Object.keys(state.receipt.consentChanges).length} consent change confirmed`
          : null,
        state.receipt.exportRequest
          ? `${state.receipt.exportRequest.format.toUpperCase()} export confirmed`
          : null,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#top"
          aria-label="Personal Data Rights Workbench home"
        >
          <span className="brand-mark" aria-hidden="true">PR</span>
          <span>
            <strong>Personal Data Rights</strong>
            <small>Workbench</small>
          </span>
        </a>
        <div className="top-actions">
          <StatusPill status={webMcpStatus} />
          <button
            className="rehearsal-button"
            onClick={runRehearsal}
            disabled={rehearsing}
          >
            <span aria-hidden="true">▶</span>
            {rehearsing ? "Running rehearsal…" : "Run guided rehearsal"}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div>
            <span className="eyebrow">Synthetic account · no credentials</span>
            <h1>Make your data footprint <em>legible.</em></h1>
            <p>
              Inspect, reason about, and safely stage personal-data choices.
              WebMCP handles the structured work; you retain the final say.
            </p>
          </div>
          <div className="account-chip">
            <span className="avatar">AR</span>
            <span>
              <strong>Alex Rivera</strong>
              <small>Demo account · {formatBytes(availableBytes)} available</small>
            </span>
          </div>
        </section>

        <section className="workspace">
          <div className="map-column">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  {state.plan ? "Reorganized by outcome" : "Current footprint"}
                </span>
                <h2>{state.plan ? "Your privacy plan" : "Your personal data map"}</h2>
              </div>
              <span className="inventory-count">
                {state.receipt
                  ? `${state.categories.length - erasedCount} available · ${erasedCount} erased`
                  : `${state.categories.length} categories`}
              </span>
            </div>
            {state.plan && (
              <PlanSummary
                plan={state.plan}
                confirmed={Boolean(state.receipt?.erasure)}
              />
            )}
            <DataMap state={state} />
          </div>
          <ReviewPanel
            state={state}
            onConfirm={confirm}
            onCancel={() =>
              state.plan && privacyWorkbench.cancelStagedPlan(state.plan.id)
            }
          />
        </section>

        {state.plan && (
          <section className="effects-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Plain-language consequences</span>
                <h2>{state.receipt ? "What changed for you" : "What changes for you"}</h2>
              </div>
              <span className="inventory-count">{state.plan.effects.length} dependencies</span>
            </div>
            <div className="effects-grid">
              {state.plan.effects.map((effect) => (
                <article className="effect-card" key={effect.id}>
                  <span className="effect-icon" aria-hidden="true">
                    {effect.severity === "warning" ? "↘" : "≈"}
                  </span>
                  <div>
                    <h3>{effect.title}</h3>
                    <p>{effect.explanation}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="lower-grid">
          <section className="consent-card">
            <div className="section-heading compact">
              <div>
                <span className="eyebrow">Four current choices</span>
                <h2>Consent signals</h2>
              </div>
            </div>
            <div className="consent-list">
              {state.consents.map((consent) => {
                const staged = stagedConsentChanges[consent.id];
                const displayValue = staged ?? consent.enabled;
                return (
                  <div className="consent-row" key={consent.id}>
                    <span>
                      <strong>{consent.name}</strong>
                      <small>{consent.description}</small>
                    </span>
                    <span className={`toggle ${displayValue ? "on" : "off"}`} aria-label={`${consent.name}: ${displayValue ? "on" : "off"}`}>
                      <span />
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="staged-label">{stagedConsentLabel}</p>
          </section>

          <section className="timeline-card">
            <div className="section-heading compact">
              <div>
                <span className="eyebrow">Visible audit trail</span>
                <h2>Activity timeline</h2>
              </div>
            </div>
            <ol className="timeline">
              {state.timeline.map((event) => (
                <li key={event.id} className={`timeline-${event.tone}`}>
                  <span className="timeline-dot" />
                  <div>
                    <strong>{event.label}</strong>
                    <p>{event.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </section>

        {state.receipt && (
          <section className="receipt-card" aria-live="polite">
            <div className="receipt-seal" aria-hidden="true">✓</div>
            <div>
              <span className="eyebrow">Read-only receipt</span>
              <h2>{state.receipt.id}</h2>
              <p>
                Confirmed through the normal visible page control: {receiptSummary}.
              </p>
            </div>
            <code>{state.receipt.confirmedAt}</code>
          </section>
        )}
      </main>

      <footer>
        <span>Personal Data Rights Workbench is a deterministic challenge demo.</span>
        <span>No real person, account, legal determination, or network service.</span>
      </footer>
    </div>
  );
}
