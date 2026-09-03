# Submission media assets

This folder contains recording-ready text assets:

- `VOICEOVER.txt` — the spoken narration, aligned to the implemented synthetic
  14 / 9 / 2 / 3 fixture, with a planned finished runtime of 2:37.
- `demo-captions.srt` — upload-ready captions synchronized to the final master.
- `../DEMO_SCRIPT.md` — the authoritative recording plan: operator setup, the
  on-camera fresh-session/sidebar-hide cold open, the full-page scan, timed
  storyboard with per-tool-call scroll/cursor targets, exact Codex prompts,
  the post-production cursor-overlay fallback, and which waits to accelerate
  in post to stay under the 2:40 ceiling (target 2:37).
- `screenshots/01-overview.png`
- `screenshots/02-staged-review.png`
- `screenshots/03-confirmation-gate.png`
- `screenshots/04-confirmed-receipt.png`

Recorded media is intentionally not stored here. Rehearsal captures, working
renders, and final masters belong exclusively in the repository's ignored
`/submission-video/` folder.

## Final recording requirement

The final submission video must show **real Codex Site Tool discovery and tool
calls against the top-level Personal Data Rights Workbench page**. It must not show only the
deterministic rehearsal mode.

The fresh Codex session and sidebar collapse are no longer pre-record setup —
they are the first 4 seconds of the recorded video (see `DEMO_SCRIPT.md`
0:00–0:04): open a brand-new conversation on camera, then immediately collapse
the sidebar so no prior conversation history is ever on frame. Only after that
does the page reload into its initial synthetic state get shown.

Immediately after, the video must show a full **top → bottom → hold → top**
smooth scroll of the entire page (header, 14-category inventory grid, empty
review panel, four consent toggles, empty timeline, footer, then back to the
header) with the opening voiceover playing continuously over it, so the first
10 seconds are a hook, not a silent tour.

The labelled rehearsal is useful for timing practice or a recovery take, but it
is not a WebMCP substitute and should stay out of the final cut. Include footage
showing:

1. The fresh Codex session opening and the sidebar collapsing, on camera.
2. The full-page top→bottom→hold→top scan under the opening voiceover.
3. The page reporting nine WebMCP tools ready.
4. The headline prompt entered through Codex Site Tools in that same fresh
   session.
5. Real inventory, consent, retention, simulation, and staging tool activity —
   each call preceded by a scroll to its exact target (inventory grid; the
   Consent signals card, specifically the Sale-or-sharing row; the two
   retained-status category cards; the Delete/Retained/Kept plan groups and
   the two effect cards; the review matrix's Consent and Erase rows) with a
   visible cursor or cursor halo on the exact element named in the voiceover.
6. Commitment through the normal visible page button, at full speed, with a
   deliberate cursor move and a single click halo — never sped up.
7. A real post-confirmation `get_privacy_receipt` Site Tool call, camera on
   the receipt card, cursor halo on the receipt ID and timestamp.

**Cursor overlay fallback:** if the capture does not render a visible system
cursor for Codex-driven interactions, add a high-contrast cursor with a subtle
click halo in post, synchronized to the real recorded interaction coordinates.
It is a visual pointer only — never use it to fake a click, hover, or state
change that did not genuinely happen in the footage.

Record the app directly as a top-level HTTPS page, never inside an iframe.
All claims must remain scoped to the deterministic synthetic demo.

No consequential commit tool is exposed through WebMCP. Do not claim that the
visible control is technically human-only: ordinary browser actuation may still
reach it, and Codex/browser safety confirmation remains applicable.

## Publication status

- Live demo: https://webmaxru.github.io/webmcp-data-rights-workbench/
  (GitHub Pages deployment and anonymous HTTP 200 smoke test passed on
  September 3, 2026).
- Source: https://github.com/webmaxru/webmcp-data-rights-workbench
  (public and anonymously readable as of September 3, 2026).
- Final public YouTube video: still required.

A validated 2:25 narrated final master showing real Codex Site Tool discovery
and calls exists only in ignored `submission-video/`. Upload it publicly to
YouTube and attach `demo-captions.srt`.
