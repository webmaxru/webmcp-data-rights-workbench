# Personal Data Rights Workbench

A polished, deterministic WebMCP Challenge demo for inspecting a synthetic
account, understanding retention constraints, simulating a data-minimization
plan, staging consent, erasure, or portability actions, and committing staged
actions through a normal visible page control.

The headline scenario partitions exactly **14 categories** into **9 selected
for deletion**, **2 retained by explicit synthetic rules**, and **3 explicitly
kept by user choice**. The fixture selects 1,119 MB of 1,209 MB for deletion: an
honest **92.6% demo-byte reduction**.

> Synthetic-data disclaimer: no real person, account, personal data, legal
> determination, compliance workflow, or external service is used. This project
> is an interaction prototype, not legal advice or a compliance product.

## Live demo and source

- **Live HTTPS demo:** https://webmaxru.github.io/webmcp-data-rights-workbench/
- **Challenge gallery:** https://webmaxru.github.io/webmcp-challenge/
- **Source repository:** https://github.com/webmaxru/webmcp-data-rights-workbench
  (private by instruction; it must be made public before Devpost submission)
- **Narrated rehearsal storyboard:** `submission-assets/demo-draft.mp4`
  (watermarked draft, not the required real Codex capture)

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL in a supported secure browser context. The visible **Run
guided rehearsal** control uses the same domain service as WebMCP and is clearly
labelled as a rehearsal, not a WebMCP replacement.

Validation:

```bash
npm test
npm run typecheck
npm run build
```

## Architecture and state guarantees

- `src/fixtures.ts` — immutable synthetic 14-category, four-consent fixture.
- `src/domain/privacyWorkbench.ts` — framework-independent state machine and
  business validation.
- `src/webmcp/tools.ts` — nine top-level imperative WebMCP tools registered via
  `document.modelContext`, with a deprecated `navigator.modelContext` fallback.
- `src/App.tsx` — responsive data map, grouped plan, dependency explanations,
  review matrix, visible confirmation control, receipt, timeline, and rehearsal.
- `src/**/*.test.ts` — deterministic domain, cancellation, plan-versioning, and
  atomic registration regression tests.

Every non-retained category must be explicitly included exactly once in either
`delete_category_ids` or `keep_category_ids`. Omitted categories are rejected,
so the plan and receipt never fabricate user intent.

Each simulation receives a unique lifetime plan ID, including after a synthetic
state reset. Consent, erasure, export, and
cancellation calls must provide the exact current `plan_id`. A new simulation
invalidates prior staging, stale calls are rejected, and staged consent must
exactly match the consent changes used to calculate the visible plan.

Staging does not mutate durable synthetic inventory or consent. Commitment
updates consent, marks confirmed erasure categories as `erased`, clears staging,
and creates an immutable receipt. Consent-only and export-only receipts do not
invent an erasure result. Confirmed state cannot be cancelled or silently
replaced without resetting the synthetic demo, and all three staging paths
reject after a receipt exists without changing receipt, staging, or timeline.

There is no iframe, backend, runtime secret, analytics, external API, or
persistent storage. The app is static-hostable.

## WebMCP tools

All tools are imperative JavaScript tools registered by the top-level page.
Input schemas guide routing; every input is validated again in application code.
Outputs contain deterministic author-controlled fixture data, so
`untrustedContentHint` is `false`.

| Tool | Required input | Purpose | Read-only | Consequential commit exposed? |
|---|---|---|---:|---:|
| `get_data_inventory` | `{}` | Read all 14 category records and current `erasable`, `retained`, or `erased` state | Yes | No |
| `get_consent_state` | `{}` | Read four current consent choices | Yes | No |
| `get_retention_constraints` | `{}` | Read two explicit synthetic retention rules | Yes | No |
| `simulate_privacy_plan` | explicit delete/keep partition; optional consent changes | Create a uniquely versioned reversible plan and feature effects | No | No |
| `stage_consent_changes` | `plan_id`, exact planned `changes` | Stage validated consent changes | No | No |
| `stage_erasure_request` | `plan_id`, exact planned delete IDs | Stage erasure | No | No |
| `stage_portability_export` | `plan_id`, `format`, `scope` | Stage a JSON or CSV portability export | No | No |
| `cancel_staged_privacy_plan` | `plan_id`, optional reason | Cancel the current unconfirmed plan | No | No |
| `get_privacy_receipt` | `{}` | Read the immutable receipt after visible commitment | Yes | No |

No consequential commit tool is exposed through WebMCP. Final commitment uses
the normal visible page control and remains subject to Codex/browser safety
confirmation; ordinary browser actuation can still reach visible controls.

Callbacks accept the current `execute(input, { signal })` shape and also tolerate
older preview/polyfill callers that omit the options argument. Mutating
callbacks reject if a provided execution signal is already aborted before
the mutation. Mutating callbacks perform the state change, synchronously flush
the React subscription update at that commit point, and return without awaiting
post-mutation work. This leaves no asynchronous cancellation window between a
committed mutation and callback settlement. Tool registration is atomic: all
nine `registerTool` calls are initiated in one synchronous task and then awaited
as a group. Any synchronous throw or asynchronous rejection unregisters every
attempted name, aborts the shared lifecycle signal, reports an error, and
rejects readiness. Disposal while registrations are pending follows the same
cleanup path without producing unhandled rejections or a false ready state.

## Headline prompt

> Minimize this account's data. Keep tax invoices and saved delivery addresses;
> delete location history and advertising profiles, opt out of sale or sharing,
> show what features will change, and stage the request for review.

Expected sequence:

1. `get_data_inventory`
2. `get_consent_state`
3. `get_retention_constraints`
4. `simulate_privacy_plan`
5. `stage_consent_changes` with the returned `plan_id`
6. `stage_erasure_request` with the same `plan_id`
7. Review and actuate **Confirm staged actions** in the visible page
8. `get_privacy_receipt`

## OpenAI Codex / ChatGPT Site Tools testing

1. Deploy the built app to HTTPS.
2. Open the URL directly as the **top-level page**; do not embed it in an iframe.
3. Enable the available Codex or ChatGPT Site Tools/WebMCP preview integration.
4. Confirm the page says **WebMCP ready** and all nine imperative tools appear.
5. Send the headline prompt above.
6. Verify the visible plan becomes 9 / 2 / 3 with two feature effects.
7. Verify the review matrix shows the actual staged consent ID/value and exact
   erasure count, while inventory and durable consent remain unchanged.
8. Actuate **Confirm staged actions** in the normal page UI.
9. Verify inventory now marks nine categories erased, consent is updated,
   staging language is gone, and `get_privacy_receipt` returns the same result.

Current OpenAI Site Tools do not support declarative tools and do not discover
iframe-registered tools. This project therefore uses only top-level imperative
registration.

## Chrome preview fallback testing

1. Use Chrome 149 or a newer WebMCP-enabled preview build over HTTPS or
   localhost.
2. Enable `chrome://flags/#enable-webmcp-testing` when required.
3. Chrome 150+ uses `document.modelContext`; Chrome 149 can use the temporary
   `navigator.modelContext` fallback.
4. Inspect and invoke all nine tools using supported preview tooling.
5. Verify pre-commit cancellation rejects without mutation and late
   post-commit cancellation does not produce a false failure.

Preview tooling is a test aid, not a runtime dependency.

## Hosting

- **Live demo:** the verified public build is hosted at
  `https://webmaxru.github.io/webmcp-data-rights-workbench/`. This private
  source repository runs validation-only GitHub Actions.
- **Vercel:** `vercel.json` adds origin isolation,
  `Origin-Agent-Cluster: ?1`, and `Permissions-Policy: tools=(self)`.
- **Netlify:** `netlify.toml` builds `dist` with the same supported headers.

The application is intentionally top-level and has no iframe deployment path.

## Limitations

- WebMCP remains an evolving browser preview and is not universally available.
- OpenAI Site Tools support and safety behavior may change.
- All rules, sizes, dates, consent values, effects, and receipts are fictional.
- Commitment persists only in memory; refreshing resets the synthetic demo.
- No identity proofing, jurisdiction logic, real export generation, deletion
  queue, or legal assessment is implemented.

## Judge credentials

**None required.** The synthetic demo account is immediately available.

## License

[MIT](LICENSE)
