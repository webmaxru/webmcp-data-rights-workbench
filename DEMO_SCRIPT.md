# Personal Data Rights Workbench — demo recording plan

**Planned finished runtime: 2:37** (hard ceiling **2:40**). Raw capture will
run longer because of agent latency; the marked wait sections are compressed
in post to land on 2:37. Only true Codex/tool-call waiting gaps are
accelerated — the fresh-session open, the full-site scan, and the confirm
click are never sped up.

**Story spine:** the right to delete is real, using it is miserable → a chat
agent that cannot see your account is not the fix → the page itself hands the
agent nine WebMCP tools → the agent plans, explains, and stages → the human
commits → the receipt matches reality.

**What changed in this revision:** the fresh Codex session and sidebar-hide
now happen on camera as the first recorded seconds (not before recording
starts); a full top→bottom→hold→top scan of the whole page now plays under the
opening hook so the first 10 seconds are never a silent tour; every tool call
now has a named scroll target and cursor/halo instruction tied to the exact
element it touches; and a post-production cursor-overlay fallback is defined
for when the underlying capture doesn't render a system cursor.

---

## Before you hit record (operator actions, no voiceover)

1. Open the deployed top-level HTTPS page:
   `https://webmaxru.github.io/webmcp-data-rights-workbench/`. Never in an
   iframe.
2. Reload it so the synthetic demo is in its initial state: 14 categories, no
   plan, no staging, no receipt.
3. Confirm the header status pill reads **WebMCP ready** and that Codex lists
   all nine Site Tools.
4. Close any existing Codex conversation so the very first visible action
   after pressing record is opening a brand-new one — do **not** start the
   fresh session before recording; it is now part of the recorded cold open
   (see 0:00–0:04 below).
5. Set the window to 1600×900 or larger, browser zoom near 90%, and hide the
   bookmarks bar, notifications, and any personal profile chrome.
6. Put prompt 1 on the clipboard so entering it is one paste, not typing.

---

## Camera & cursor choreography rules (apply throughout)

1. **Scroll before the event, not after.** Whenever Codex is about to retrieve
   information from the page or change page state, scroll/pan the in-app
   Browser to the specific region involved *just before* the tool call
   resolves, so the viewer sees the relevant area settle into frame right as
   the result lands — never a cut to an already-changed screen.
2. **Keep the changed area in frame** for as long as the voiceover is
   discussing it. Do not pan away mid-explanation.
3. **Show a clearly visible cursor or cursor halo over the exact
   category/consent/plan/control being named** — e.g. the "Sale or sharing"
   row, not the whole consent card; the two retained-status category cards,
   not the whole inventory grid — while the voiceover names it.
4. **Post-production fallback — synthetic cursor overlay.** If the Codex /
   background-automation capture does not render a visible system cursor for
   an interaction, add a high-contrast cursor overlay in post with a subtle
   click halo, synchronized frame-accurately to the real recorded interaction
   coordinates (the actual hover/scroll/click position captured in that take).
   This overlay is a **visual pointer annotation only** — it must never imply
   a click, hover, or state change that did not really happen in the footage.
   If a moment's coordinates can't be reconstructed accurately, leave it
   without an overlay rather than guess.

---

## Timed storyboard

| Time | On-screen action | Wait handling |
|---|---|---|
| 0:00–0:04 | **Recording starts here.** On camera: open a brand-new Codex conversation (empty history), then **immediately collapse the Codex sidebar** (sidebar toggle, or `Ctrl`/`Cmd`+`B`) so no prior conversation titles ever appear on frame. This is the cold open — visible, not pre-recorded prep. | Real time |
| 0:04–0:12 | Cut to the full page at the very top (brand bar + hero). Begin one continuous smooth scroll **down** — header → hero → the 14-card inventory grid — steady speed, no cursor jitter. | Real time |
| 0:12–0:24 | Continue the same smooth scroll down through the empty review panel ("Your review will appear here"), the four consent toggles (all **on**) in the Consent signals card, and the empty Activity timeline, to the footer. Hold ~1s at the footer, then smoothly scroll **back up** to the top. | Real time |
| 0:24–0:26 | Settle on the header **WebMCP ready** status pill as the scroll-up completes. | Real time |
| 0:26–0:43 | Reveal the Codex panel beside the page (sidebar already hidden since 0:04). Briefly show the nine discovered Site Tools, then dismiss the list. | Real time |
| 0:43–0:57 | Paste prompt 1 into Codex and send it. | Real time |
| 0:57–1:15 | Agent calls `get_data_inventory` → `get_consent_state` → `get_retention_constraints`. Before each call resolves, scroll/pan to its exact target and hold a cursor halo there (see per-call targets below). Keep the tool chips readable. | **Accelerate 1.5–2× in post** |
| 1:15–1:39 | `simulate_privacy_plan` returns. The page reorganizes into **Delete / Retained by rule / Kept by choice**, the impact strip animates to 92.6%, and two effect cards appear. Cursor halo touches each group header, then the impact bar, then the two named effect cards. Cut to the effect cards at ~1:28. | **Accelerate the call; play the page reorganizing at 1×** |
| 1:39–1:56 | `stage_consent_changes`, then `stage_erasure_request`, both with the same `plan_id`. Cursor halo moves from the "Sale or sharing" consent row to the review matrix's Consent row, then to the Erase row and the "Staged, not committed" safety note; durable consent toggles still read on in the background. | **Accelerate 1.5–2× in post** |
| 1:56–2:10 | Hold on the safety note with the review panel fully framed, then the human cursor moves deliberately to **Confirm staged actions** and clicks it; a single click halo pulses. | Real time — never speed up the click |
| 2:10–2:24 | Scroll down through the now-**Erased** category cards, sale-or-sharing toggle off, staging language gone, to the receipt card `PDR-2026-0902-001`. Send prompt 2; `get_privacy_receipt` returns — cursor halo rests on the receipt ID and timestamp as the values are read back. | **Accelerate the receipt call only** |
| 2:24–2:37 | Pull back to frame the receipt card and Activity timeline together. Final line, then a quick scroll to the hero and a one-second hold on the "Synthetic account · no credentials" line. | Real time |

### Per-call scroll & cursor targets (0:57–2:24)

- **`get_data_inventory`** → frame the full 14-card inventory grid; halo
  sweeps loosely across it (there is no single target — it's the whole
  footprint) as the tool chip resolves.
- **`get_consent_state`** → scroll to the **Consent signals** card; halo rests
  specifically on the **Sale or sharing** row (the one about to change) while
  the other three toggles stay visible in the same frame.
- **`get_retention_constraints`** → scroll back to the inventory grid; halo
  hovers over the two `status-retained` cards — **Payment transaction
  records** and **Fraud-prevention audit logs** — the only two categories
  carrying a retention rule.
- **`simulate_privacy_plan`** → hold the map column in frame as the grid
  morphs into **Delete / Retained by rule / Kept by choice**; halo touches
  each group header in reading order, then the impact-strip bar as it
  animates toward 92.6%, then pans to the **Location history** and
  **Advertising profiles** effect cards as the voiceover names them.
- **`stage_consent_changes`** → halo returns to the "Sale or sharing" consent
  row (now showing staged), then to the review panel's **Consent** row.
- **`stage_erasure_request`** → halo moves to the review panel's **Erase**
  row, then to the "Staged, not committed" safety-note icon.
- **Confirm staged actions click** → review panel fully framed; cursor moves
  to the button, click halo pulses once. Never accelerated.
- **`get_privacy_receipt`** → scroll to the receipt card; halo rests on the
  receipt ID and the `confirmedAt` timestamp.

---

## Exact prompts

**Prompt 1 — paste at 0:43 (the verified headline prompt):**

```
Minimize this account's data. Keep tax invoices and saved delivery addresses; delete location history and advertising profiles, opt out of sale or sharing, show what features will change, and stage the request for review.
```

**Prompt 2 — paste at ~2:14, after the visible confirmation click:**

```
I confirmed it in the page. Read my receipt.
```

**Retake fallback only** — use if the agent asks for clarification about the
remaining categories. It does not change the resulting partition:

```
Minimize this account's data: keep my account active plus tax invoices and saved delivery addresses, delete everything else that can be deleted, opt out of sale or sharing, show what features will change, and stage it for review.
```

Expected tool order: `get_data_inventory` → `get_consent_state` →
`get_retention_constraints` → `simulate_privacy_plan` → `stage_consent_changes`
→ `stage_erasure_request` → visible **Confirm staged actions** click →
`get_privacy_receipt`.

---

## Narration

Delivery: warm, confident, conversational. Vary the pace — land the hook, move
briskly through the tool calls, then slow down hard at the confirmation moment.
Do not narrate clicks, and do not read numbers off the screen; let the page
carry the figures.

*Stage direction (0:00–0:26 only, wording unchanged from `VOICEOVER.txt`):
this line and the next play continuously over the fresh-session open, the
sidebar collapse, and the full top→bottom→hold→top page scan — never over a
silent tour. Nothing changes below 0:26.*

**0:00**

“You have a legal right to delete your data. Almost nobody finishes. The
controls are scattered, the retention rules are buried, and the last button is
irreversible.”

**0:12**

“So you either click through a dozen screens hoping you understood them, or you
ask a chatbot that can’t see your account and can only guess. Neither one shows
you what you’re about to lose.”

**0:26**

“This is the Personal Data Rights Workbench. The page itself hands the agent
nine WebMCP tools: inventory, consent, retention rules, planning, staging,
cancellation, and a receipt. The same data I can see — structured so an agent
can actually reason about it.”

**0:43**

“One sentence, in a fresh Codex session. Keep the tax invoices and the delivery
addresses, drop location history and advertising profiles, opt out of sale or
sharing, and stage it for review.”

**0:57**

“Watch what happens before anything is touched. It reads the fourteen
categories, the four consent switches, and the retention rules — and it finds
two categories it isn’t allowed to delete yet, so it never promises to delete
them.”

**1:15**

“Then the plan arrives, and the page rearranges itself around it. Nine
categories to delete, two held back by rule, three kept because I asked. Almost
the entire footprint goes. But the part that really matters is the trade-off, in
plain language: this account stops learning the places I go, and my ads become
contextual instead of profiled.”

**1:39**

“Every category has to be explicitly deleted or kept — silence never becomes
consent on my behalf. And each staged action is bound to this exact plan
version, so a stale or half-remembered plan is simply rejected.”

**1:56**

“Now the part I care about most. There is no commit tool. The agent can inspect,
plan, explain, and stage — it cannot pull the trigger. That step stays with me.”

**2:10**

“And the state really moves: nine records erased, sale or sharing off, staging
cleared, receipt issued. When the agent reads that receipt back, it matches the
page exactly. Nothing invented, nothing quietly assumed.”

**2:24**

“Agents shouldn’t just click through your privacy settings faster. They should
make consequences legible before you commit. That’s what WebMCP makes possible
here — on synthetic data, with the final say still mine.”

---

## Post-production

- Compress only the marked wait sections — true Codex/tool-call latency, not
  the fresh-session open, the full-site scan, or the confirm click. Keep
  tool-call chips on screen long enough to read — roughly 0.8 seconds each
  after speed-up.
- Never speed up the **Confirm staged actions** click, the fresh-session +
  sidebar-hide cold open, or the moment the page reorganizes after simulation.
  Those are proof/authenticity shots.
- If the raw capture is running long, shorten static holds first (the 1s
  bottom-of-scroll hold, the tools-list glance, the safety-note hold) before
  touching any accelerated tool-call segment further — this is how the cut
  stays under the 2:40 ceiling without hiding real agent behavior.
- **Cursor overlay fallback:** if the screen capture does not show a system
  cursor during Codex-driven interactions, add a high-contrast cursor with a
  subtle click halo in post, synchronized to the actual recorded interaction
  coordinates for that take. It is a pointer annotation only — never use it to
  suggest a click, hover, or state change that isn't genuinely in the footage.
- Burn in `submission-assets/demo-captions.srt` or upload it as a caption track.
- Keep a visible caption or on-screen note that the account is synthetic.

## Honesty guardrails

- The final video must show real Codex Site Tool discovery and real tool calls
  against the top-level page. Rehearsal mode is not a substitute and should not
  appear in the final cut except, at most, as clearly labelled b-roll.
- Never say or imply that the confirmation control is technically unreachable by
  an agent. The accurate claim is that **no consequential commit tool is exposed
  through WebMCP**, and commitment remains subject to Codex/browser safety
  confirmation.
- Never call this legal advice, a compliance product, or a real deletion.
  Everything shown is a deterministic synthetic fixture held in memory.
- Any post-production cursor overlay is a visual pointer only. It must never be
  used to fabricate or imply an interaction, click, or page-state change that
  did not really occur in the captured footage.
