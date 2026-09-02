# WebMCP Challenge compliance checklist

## Required links

- [x] Live HTTPS URL: https://webmaxru.github.io/webmcp-data-rights-workbench/
- [ ] Public source repository:
  https://github.com/webmaxru/webmcp-data-rights-workbench is currently private
  and must be made public before submission.
- [ ] Demo video URL: a public YouTube upload is still required.

## Submission package

- [x] Runnable Vite + React + TypeScript application
- [x] Top-level imperative WebMCP registration
- [x] Nine documented tool contracts
- [x] `document.modelContext` preferred with Chrome 149 fallback
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
- [x] Deterministic 14 / 9 / 2 / 3 fixture
- [x] Four consent choices and two feature-dependency warnings
- [x] Responsive, accessible, static-hostable UI
- [x] Clearly labelled deterministic rehearsal
- [x] Domain and WebMCP registration tests
- [x] Vercel and Netlify headers/configuration
- [x] MIT license
- [x] README, submission copy, dialogues, testing guide, and demo script
- [x] Static social/demo card
- [x] Final live deployment smoke-tested
- [x] Four clean screenshots and a narrated rehearsal storyboard captured
- [ ] Repository visibility changed to public by the owner
- [ ] Real Codex Site Tool capture uploaded publicly to YouTube

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

## Final publication steps for repository owner

1. Make the existing GitHub repository public.
2. Confirm `LICENSE` is visible at repository root.
3. Confirm the deployed HTTPS URL still matches the source commit.
4. Add the public YouTube URL to this file and `SUBMISSION.md`.
5. Run the headline prompt in the supported Site Tools environment.
6. Record the 2:40 demo using `DEMO_SCRIPT.md`.
