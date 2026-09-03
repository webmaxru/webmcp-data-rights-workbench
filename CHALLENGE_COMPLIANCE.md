# WebMCP Challenge compliance checklist

## Required links

- [x] Live HTTPS URL: https://webmaxru.github.io/webmcp-data-rights-workbench/
  deployed successfully through this repository's GitHub Pages workflow and
  returned HTTP 200 with the expected title on 2026-09-03. It must remain free
  and unrestricted through September 21, 2026 at 5:00 p.m. PT.
- [x] Public source repository:
  https://github.com/webmaxru/webmcp-data-rights-workbench is anonymously
  readable as of 2026-09-03.
- [x] Demo video URL: https://youtu.be/Yt5Ggk0LXLw

## Submission package

- [x] Runnable Vite + React + TypeScript application
- [x] Top-level imperative WebMCP registration
- [x] Nine documented tool contracts
- [x] `document.modelContext` preferred with a transition fallback compatible
      with the challenge's Chrome 149+ testing requirement
- [x] Awaited `registerTool()` in `try/catch`
- [x] All registrations initiated synchronously, group-awaited, and atomically rolled back
- [x] AbortSignal registration lifecycle and execution cancellation checks
- [x] In-code input and business-rule validation
- [x] Accurate read-only and untrusted-content annotations
- [x] Visible state synchronized before tool results return
- [x] No consequential WebMCP commit tool; final commitment uses a visible control
- [x] Read-only receipt after visible commitment
- [x] Unique plan IDs and plan-bound consent, erasure, export, and cancellation
- [x] Explicit complete partition of every non-retained category
- [x] Truthful committed inventory and consent state
- [x] Consent-only and export-only confirmation paths
- [x] Substantially distinct from Tracebound: this app models category-level
      privacy intent, retention rules, feature effects, plan-bound staging, and
      a visible commit checkpoint rather than archival evidence provenance,
      hostile-source quarantine, or cited research drafting
- [x] Deterministic 14 / 9 / 2 / 3 fixture
- [x] Four consent choices and two feature-dependency warnings
- [x] Responsive, accessible, static-hostable UI
- [x] Clearly labelled deterministic rehearsal
- [x] Domain and WebMCP registration tests
- [x] Vercel and Netlify headers/configuration
- [x] Standard source-repository GitHub Pages deployment workflow active
- [x] MIT license
- [x] README, submission copy, dialogues, testing guide, and demo script
- [x] Static social/demo card
- [x] Final live deployment reachable and anonymously smoke-tested
- [x] Four clean screenshots, exact captions, and a validated 2:25 local final master
- [x] Repository visibility changed to public by the owner
- [x] Real Codex Site Tool capture published at https://youtu.be/Yt5Ggk0LXLw

## OpenAI compatibility statement

Current OpenAI Codex/ChatGPT Site Tools do not support declarative WebMCP tools
and do not discover iframe-registered tools. The workbench deliberately registers
imperative tools from the top-level document and is not deployed in an iframe.
OpenAI preview availability and discovery behavior remain platform limitations,
not guarantees made by this project.

## Privacy and claims

All people, categories, sizes, rules, dates, effects, consent values, and
receipts are synthetic deterministic fixtures. This workbench is not legal advice,
does not determine eligibility for a legal right, and does not claim regulatory
compliance. It demonstrates a safer interaction pattern.

## Final submission steps for repository owner

1. Complete the entrant-specific Devpost fields using the links in this file and `SUBMISSION.md`.
2. Submit the completed entry before the deadline.
