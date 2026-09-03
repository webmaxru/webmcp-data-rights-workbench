# Devpost submission copy

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
- **Video:** a public YouTube recording made from `DEMO_SCRIPT.md` is still
  required. Upload `submission-assets/demo-captions.srt` as its caption track.
  Local recordings and final masters remain uncommitted in the ignored
  `/submission-video/` folder.

## YouTube title and description

**Title**

`Delete My Data - But Keep What Must Be Retained | WebMCP + Codex`

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
