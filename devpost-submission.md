# Submission information

## Project name

**Personal Data Rights Workbench — Delete What You Can, Explain What You Must Keep**

## Tagline

Turn a vague “delete my data” request into a transparent plan that shows what
can go, what must stay, and why.

## 1. What we built

The **Personal Data Rights Workbench** makes a synthetic account's data
footprint legible before consequential actions commit. A person or browser
agent can inspect a 14-category inventory, read four consent choices and two
retention constraints, simulate a complete data-minimization partition,
understand feature trade-offs, and stage consent, erasure, or portability
actions.

The responsive data map reorganizes into **Delete**, **Retained by rule**, and
**Kept by choice**. The headline fixture shows exactly 9 / 2 / 3 categories and
an honest 92.6% reduction of deterministic demo bytes. The review matrix shows
the exact staged action IDs and values. Commitment through the normal visible
page control updates inventory and consent, clears staging, and creates an
immutable synthetic receipt.

## 2. How we used WebMCP

The top-level page registers nine imperative JavaScript tools for inventory,
consent, retention, simulation, plan-bound staging, cancellation, and receipt
reading. It prefers `document.modelContext` and retains
`navigator.modelContext` only for older Chrome preview builds.

Registration is scoped with an `AbortController` and atomic: all nine calls are
initiated in one synchronous task, then awaited as a group. If any call throws
or rejects, every attempted name is removed, the lifecycle is aborted, and
readiness rejects. Tool callbacks use
`execute(input, { signal })`, while tolerating older callers that omit options.
Inputs are validated in code, every non-retained
category must be explicitly classified, plans receive unique IDs, and all
staging is bound to the exact current plan.

No consequential commit tool is exposed through WebMCP. Final commitment uses
the normal visible page control and remains subject to Codex/browser safety
confirmation; ordinary browser actuation may still reach visible controls. The
read-only receipt tool returns only after commitment.

## 3. Why it matters

Privacy controls often split one intention across opaque settings, retention
language, and destructive forms. This workbench explores a more inspectable
model: structured agent assistance for inventory and planning, explicit user
intent for every category, visible consequences, version-bound staging, and a
clear commit point.

The demo does not determine legal rights or establish compliance. It
demonstrates how WebMCP can make a complex workflow composable, visible, and
truthful before and after commitment.

## 4. What we learned

Tool quality is inseparable from visible state. The same domain service powers
the UI, WebMCP tools, and deterministic rehearsal. A mutating callback rejects
if already cancelled, then commits state, synchronously flushes the React
subscription update, and returns without awaiting post-mutation work. Confirmed
receipts also close every staging path.

We also learned that schemas are routing guidance, not authorization; omitted
categories must not be interpreted as user intent; every staged action needs a
plan version; partial tool registration is unsafe; and receipts should describe
only actions that actually committed. Current OpenAI Site Tools constraints
also require imperative registration in the top-level page rather than
declarative or iframe-registered tools.

## Submission links and publication status

- **Live demo:** https://webmaxru.github.io/webmcp-data-rights-workbench/
  — deployed from this public repository through GitHub Pages Actions and
  anonymously smoke-tested with HTTP 200 on 2026-09-03. It must remain free
  and unrestricted through September 21, 2026 at 5:00 p.m. PT.
- **Source:** https://github.com/webmaxru/webmcp-data-rights-workbench
  — public and anonymously readable as of 2026-09-03.
- **Video:** https://youtu.be/Yt5Ggk0LXLw

## YouTube title and description

**Title**

`Delete My Data - But Keep What Must Be Retained | WebMCP`

**Description**

```text
"Delete my data" sounds like one action. In reality, some data must be retained, some data powers features the person wants, and every consequential change needs a reviewable boundary.

In this 2:25 Codex demo, the Personal Data Rights Workbench exposes nine WebMCP tools over a synthetic 14-category account inventory. Codex reads consent and retention rules, calculates a transparent 9 delete / 2 retain / 3 keep plan, explains the trade-offs, and stages the exact changes. The page, not the agent, owns final commitment through a visible control and produces a receipt only after the reviewed plan commits.

The demo uses deterministic synthetic data. It is not legal advice or a compliance certification.

Try it: https://webmaxru.github.io/webmcp-data-rights-workbench/
Source: https://github.com/webmaxru/webmcp-data-rights-workbench

Built for the WebMCP Challenge.

#WebMCP #AIAgents #DataRights #Privacy #Codex
```


---

# Preparation supplement — local draft, September 3, 2026

The original author copy above is preserved. This supplement follows the
preparation outline and maps the live Devpost fields. Readiness notes and TODOs
are internal preparation material, not text to paste into the public write-up.

## Title

**Confirmed Devpost title:** Personal Data Rights Workbench

The original full name is 80 characters. Devpost's project title limit is 60;
the existing short name is 30. Keep the original longer wording as a subtitle
in the description if desired. No public title has been changed.

## One-line Summary

Turn a vague “delete my data” request into a transparent plan that shows what
can go, what must stay, and why.

## Problem

A person trying to minimize an account's data must understand inventory,
consent settings, retention constraints, and feature trade-offs together.
Scattered controls make it difficult to see the complete outcome before
committing. The target user is a person reviewing their account's data with
agent assistance; the current project demonstrates that interaction on
synthetic data, not on a connected production account.

## Solution

The workbench gives the person and browser agent a shared view of the same
domain state. The agent can inspect, simulate, explain, and stage an explicit
category-level plan. The visible page shows the proposed outcomes before the
normal confirmation control changes synthetic inventory and consent.

## Why This Matters

Structured operations let an agent work with category IDs, constraints, and
plan versions instead of inferring them from screen coordinates. The person
can review the proposed consequences, cancel the reversible plan, and inspect
the result after confirmation. The implementation is an interaction prototype;
it does not establish legal rights or demonstrate regulatory compliance.

## How We Used AI

The documented demo uses a browser agent through Codex Site Tools to discover
and call the page's nine WebMCP tools. The agent coordinates the multi-step
inventory, consent, retention, planning, staging, and receipt-reading workflow.
The application itself has no embedded language model or inference backend;
its domain calculations and synthetic fixture are deterministic.

The author confirmed Codex as the AI tool used for this project. The repository
also credits the WebMCP Agent Skill from the Web AI Agent Skills collection as
development guidance. No other AI tool is claimed in the official form answer.

## How We Used Codex

The README and media documentation describe real Codex Site Tool discovery and
calls in the recorded walkthrough, followed by a receipt read after visible
confirmation. This preparation session used Codex to inspect the existing
implementation and materials, add judge-facing instructions, and run the
automated tests and production build.

The author confirmed Codex use during the project. The recorded Site Tools
walkthrough and this session's preparation and verification work are concrete
examples. No finer-grained claim about which original features Codex authored
is made; no guided-build notes directory was present.

## Key Features

- Fourteen synthetic categories, four consent choices, and two retention rules.
- Nine imperative, top-level WebMCP tools for structured agent interaction.
- Complete explicit delete/keep classification of every non-retained category.
- Version-bound staging that rejects stale plans and mismatched consent values.
- A 9 delete / 2 retained / 3 kept headline scenario, selecting 1,119 of 1,209 MB
  of fictional data for deletion (92.6%).
- Visible feature effects, review matrix, cancellation, and confirmation.
- Consent-only, erasure, and portability-request staging paths.
- A read-only synthetic receipt that reports only the actions actually
  committed in the in-memory session.
- A clearly labelled deterministic rehearsal for inspecting the product flow
  without claiming that rehearsal is a native WebMCP test.

## Architecture

Vite, React, and TypeScript form a static, client-side application.
`src/fixtures.ts` supplies the synthetic records.
`src/domain/privacyWorkbench.ts` owns validation and state transitions.
`src/webmcp/tools.ts` exposes the domain operations through nine registered
tools, preferring `document.modelContext` and keeping the documented
`navigator.modelContext` transition fallback.
`src/App.tsx` renders the same state and synchronously flushes subscription
updates. Registration shares an AbortSignal lifecycle and rolls back attempted
registrations on failure.

No consequential commit tool is registered. The visible confirmation button is
not technically human-only: ordinary browser automation can still reach it,
subject to browser/agent safety confirmation.

Built-with candidate list grounded in the repository:
`webmcp`, `typescript`, `react`, `vite`, `vitest`, `github-pages`, `codex`.
This is preparation copy, not a change to Devpost.

## Testing Instructions

No account, credentials, payment, or real personal data is required.

1. Open https://webmaxru.github.io/webmcp-data-rights-workbench/ directly as the
   top-level HTTPS page in a WebMCP-capable client. The repository documents
   Codex Site Tools, ChatGPT's in-app browser, and Chrome with WebMCP enabled;
   client availability is environment-dependent.
2. Verify the page reports nine native WebMCP tools ready. If native WebMCP is
   unavailable, the labelled rehearsal can illustrate the UI but does not
   establish native tool discovery or invocation.
3. Ask the agent to inspect inventory, consent, and retention constraints.
4. Request the deterministic headline plan: keep `account_profile`,
   `tax_invoices`, and `saved_delivery_addresses`; delete the other nine
   non-retained categories; leave the two retained categories classified by
   their rules; and set `sale_or_sharing` to false.
5. Have the agent simulate and stage that plan without committing. Verify
   9 / 2 / 3, 92.6%, two feature effects, and the exact staged consent and erasure
   details. All staging must use the returned current `plan_id`.
6. Review the visible staged actions and activate **Confirm staged actions**.
   Verify nine inventory records become erased, sale-or-sharing consent is
   false, and staging is cleared.
7. Ask the agent for `get_privacy_receipt`. It should match the visible
   confirmed result. Additional staging, cancellation, or re-confirmation must
   fail until the synthetic demo is reset.
8. Refresh for a fresh in-memory account. For negative cases and the
   consent-only/export-only paths, follow `TESTING.md`.

Local verification: `npm install`, `npm test`, `npm run typecheck`,
`npm run build`; use `npm run dev` to start Vite.

Preparation checks run on September 3, 2026:

- `npm test`: 25 tests passed across two files.
- `npm run build`: TypeScript compilation and Vite production build passed.
- Anonymous HTTP checks: live demo, repository, and main-branch MIT license
  each returned 200.
- Four existing screenshots were visually inspected.
- Local `submission-video/final.mp4`: 145.000 seconds, video and audio streams.
- Native browser tool invocation and public YouTube playback were not re-tested
  in this preparation session. Existing project records describe a real Codex
  capture; that is prior recorded evidence, not a new execution result.

## Public Demo Link

https://webmaxru.github.io/webmcp-data-rights-workbench/

## Public Repository Link

https://github.com/webmaxru/webmcp-data-rights-workbench

The public repository contains a detectable MIT license. The existing local
deletion of `SUBMISSION.md` and the untracked `devpost-submission.md` were
present before this preparation pass and were left in place.

## Demo Video

https://youtu.be/Yt5Ggk0LXLw

Local master: `submission-video/final.mp4` (2:25 with an audio stream).
Caption source: `submission-assets/demo-captions.srt`.
The master was inspected for duration and stream presence, not fully played
during this preparation pass.

Outline supported by the existing captions:

- 0:00–0:21: problem and consequences of scattered data controls.
- 0:21–0:39: workbench introduction and nine structured tools.
- 0:39–1:05: Codex prompt, inventory, consent, and retention inspection.
- 1:05–1:42: 9 / 2 / 3 plan, feature effects, and version-bound staging.
- 1:42–2:06: visible confirmation and receipt readback.
- 2:06–2:25: consequences-first interaction and synthetic-data scope.

**Review before final use:** the captions at approximately 1:45–1:52 say the
agent “cannot pull the trigger” and the step “stays with me.” That overstates a
technical guarantee: the actual protection is no WebMCP commit tool, not an
unclickable-by-agents button. Suggested replacement narration:
“The WebMCP tools stop at staging. Final commitment uses the visible review
button and remains subject to browser and agent safety confirmation.”

The opening captions also claim “You have a legal right to delete your data”
and “Almost nobody finishes.” No jurisdictional or completion-rate evidence is
supplied in the project. A neutral replacement is:
“A delete-my-data request can involve scattered controls and retention
constraints. It should be possible to inspect the consequences before committing.”
These are proposed corrections only; no audio, video, caption file, or remote
upload has been altered. Any correction to the published artifact needs to be
completed before the event deadline.

## Screenshot Shot List

Four existing 1600 × 900 PNGs were received from the project folder, inspected,
and referenced here. They remain at their existing paths; nothing was uploaded.

1. `submission-assets/screenshots/01-overview.png` — initial synthetic account
   and inventory. Caption: “A shared, visible map of the account's synthetic
   data, with nine native WebMCP tools ready.”
2. `submission-assets/screenshots/02-staged-review.png` — grouped plan and
   review panel. Caption: “An explicit plan: nine categories for deletion, two
   retained by rule, three kept by choice.”
3. `submission-assets/screenshots/03-confirmation-gate.png` — visible button
   and feature effects. Caption: “Review staged actions and their consequences
   before using the visible confirmation control.”
4. `submission-assets/screenshots/04-confirmed-receipt.png` — confirmed action
   summary and erased-category state. Caption: “After confirmation, the
   synthetic inventory and action summary reflect what actually committed.”

Optional improvement: capture the actual receipt card with its ID and result.
The fourth existing screenshot shows confirmed state but does not show the
receipt ID in its crop. The staged-plan screenshot is a useful cover candidate;
the final thumbnail choice remains with the author.

## Submission Readiness Notes

The product story, source, demo link, testing guide, local video, and four
screenshots exist. The author confirmed the short title, media checks, and
documented Codex Site Tools testing, then supplied all required personal form
answers on September 4, 2026.

Final readiness review: ready, pending explicit permission for the Devpost
writes. The local security scan found no high-confidence secrets, generic
credential assignments, or risky credential files. The previous 25-test and
production-build checks passed; they were not repeated on September 4 because
this pass changes preparation documents only.

The earlier video/caption review observations above remain as an audit record.
Media review/correction and public playback are author-confirmed, not newly
independently replayed by this preparation session. No media was modified or
uploaded by the assistant.

Use only the clean public description and the exact field values below for
Devpost. Do not include this preparation supplement or its audit notes in the
public project description. Nothing has been sent to Devpost for this project.

Deadline snapshot: Devpost's September 3 announcement “Deadline Extension |
12 more hours” confirms **September 4, 2026 at 1:00 a.m. Pacific Time**
(**08:00 UTC / 10:00 a.m. Europe/Paris**). This resolves the earlier discrepancy
with the older formal-rules deadline. Re-read live event status before final
action; do not treat this local snapshot as authoritative forever.
The organizers also require the project to remain accessible through judging
and prohibit post-deadline alterations to the entry materials.

## Known Limitations

- All records, identities, sizes, retention rules, dates, and receipts are
  deterministic synthetic fixtures.
- The 92.6% figure is demo-byte selection, not measured deletion from a real
  service or proof of privacy improvement.
- State and receipt immutability are scoped to the in-memory demo session.
  Refreshing resets the account.
- Portability is a staged synthetic export request, not a real downloadable
  data export.
- There is no identity proofing, legal eligibility engine, production deletion
  queue, external account connection, analytics, or persistent backend.
- Browser-preview support and agent safety behavior are outside this app's
  control; the visible confirmation button is not an authorization boundary
  that prevents all browser automation.

## Confirmed Official Form Fields

These labels and IDs were rechecked against live Devpost requirements for
`webmcp` on September 4, 2026. The author supplied the personal choices below.
The form does not request a Codex session ID.

- **28249 — Submitter Type (required):** `Individual`.
- **28250 — Country of residence of yourself and team members if applicable
  (required; multiple):** `["Norway"]`.
- **28251 — If submitting on behalf of an organization, what is the organization
  name? (optional):** Not applicable; omit.
- **28252 — App Status (required):** `New`.
- **28253 — If Existing, explain what you updated during the submission period.
  (We recommend explaining this in your text description, too!) (optional,
  conditional):** Not applicable; omit.
- **28254 — Live URL that judges can access using ChatGPT’s in-app browser or
  Google Chrome with WebMCP enabled (required):**
  https://webmaxru.github.io/webmcp-data-rights-workbench/
- **28255 — If applicable, testing instructions for application - If you have
  credentials for your URL, you can put them here. (optional; private to
  Devpost and judges):** No credentials required. Use the Testing Instructions
  section above, excluding preparation-only notes.
- **28256 — URL to your PUBLIC Code Repo (on Github, Gitlab, or Bitbucket)
  (required):** https://github.com/webmaxru/webmcp-data-rights-workbench
- **28257 — Which agent(s) or client(s) did you test your WebMCP tools with?
  (required):** `Codex Site Tools` — recorded walkthrough; author-confirmed.
- **28258 — Which AI tools have you leveraged while working on this project?
  (required):** `Codex`.
- **28259 — Describe the level of learning you/your team derived from the project
  (required):** `Significant`.
- **28260 — Did you gain AI value that you can use in your career? (required):**
  `Yes`.
