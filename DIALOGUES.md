# Natural-language dialogues

Dialogue 1 is the exchange recorded on camera (see `DEMO_SCRIPT.md`). The
others show how the same nine tools behave across other realistic intents,
including the ways the workbench refuses to guess.

## Dialogue 1 — the recorded demo: minimize this account

**Human (prompt 1, sent at 0:42 in the demo)**

> Minimize this account's data. Keep tax invoices and saved delivery addresses;
> delete location history and advertising profiles, opt out of sale or sharing,
> show what features will change, and stage the request for review.

**Expected tool sequence**

1. `get_data_inventory`
2. `get_consent_state`
3. `get_retention_constraints`
4. `simulate_privacy_plan`
5. `stage_consent_changes` using the returned `plan_id`
6. `stage_erasure_request` using the same `plan_id`

**Representative agent response**

> Before proposing anything I read your 14 categories, your four consent
> choices, and the retention rules. Two categories can't be erased right now:
> payment transaction records and fraud-prevention audit logs are both inside
> synthetic retention windows, so I left them out of the deletion set rather
> than promise something that can't happen.
>
> Plan `plan-001` selects 9 categories for deletion, retains those 2 by rule,
> and keeps 3 by your explicit choice — tax invoices, saved delivery addresses,
> and your account profile, so the account stays active. That's 1,119 MB of
> 1,209 MB, a 92.6% reduction of demo bytes.
>
> Two things will change for you: nearby shortcuts stop learning frequently
> visited places, and ads become contextual instead of profile-driven. Sale or
> sharing is staged off.
>
> Nothing is committed. Consent and inventory are untouched until you use the
> visible **Confirm staged actions** control on the page.

**Human (prompt 2, sent at ~2:14, after the visible confirmation click)**

> I confirmed it in the page. Read my receipt.

**Expected tool**

`get_privacy_receipt`

**Representative agent response**

> Receipt `PDR-2026-0902-001` records exactly what committed: 9 categories
> erased, 2 retained by rule, 3 kept by choice, and sale or sharing changed to
> off. Inventory now marks those nine as erased, consent reflects the committed
> value, and staging is cleared. The receipt matches what's on the page — I'm
> not reporting anything the page doesn't show.

## Dialogue 2 — explain before acting

**Human**

> Before staging anything, tell me what can't be erased right now and what I'd
> actually lose by deleting location and ad profiles.

**Expected tool sequence**

1. `get_retention_constraints`
2. `get_data_inventory`
3. `simulate_privacy_plan` only if every non-retained category can be explicitly
   classified from your instructions; otherwise ask first

**Representative agent response**

> Two things are off the table for now. Payment transaction records are retained
> until 2031-09-02 under a synthetic financial-ledger rule, and fraud-prevention
> audit logs until 2027-03-02 under a synthetic security-review window.
>
> As for the cost: deleting location history means the product stops learning
> the places you visit — you can still type an address, it just won't recognize
> your routines. Deleting advertising profiles doesn't remove ads; it makes them
> contextual instead of built from audience segments.
>
> I haven't staged or committed anything.

## Dialogue 3 — portability without deletion

**Human**

> Prepare a JSON copy of all my data for review, but don't delete anything or
> change consent.

**Expected tool sequence**

1. `get_data_inventory`
2. `simulate_privacy_plan` with all 12 non-retained categories explicitly in
   `keep_category_ids`, an empty delete array, and no consent changes
3. `stage_portability_export` with the returned `plan_id`,
   `{ "format": "json", "scope": "all_data" }`

**Representative agent response**

> A JSON export of everything is staged against the current plan. Nothing is
> selected for deletion and no consent choice changed. I can't commit it —
> there's no commit tool exposed to me — so use the visible confirmation control
> when you're ready.

**After the visible control is actuated**

> The receipt records the JSON export request, no consent changes, and no
> erasure result. Your inventory is unchanged.

## Dialogue 4 — consent-only workflow

**Human**

> Keep all my data, but opt me out of sale or sharing and stage that.

**Expected tool sequence**

1. `get_data_inventory`
2. `get_consent_state`
3. `simulate_privacy_plan` with all 12 non-retained categories explicitly kept
   and `{ "sale_or_sharing": false }`
4. `stage_consent_changes` with the returned `plan_id` and the exact same change

**Representative agent response**

> Sale or sharing is staged off under the current plan. No erasure, no export.
> Your durable consent still reads on until you confirm on the page — staging
> deliberately doesn't move real state.

**After visible confirmation**

> The receipt records only the sale-or-sharing change: no erasure result, no
> export, inventory unchanged.

## Failure and recovery — conflicting or incomplete partition

**Human**

> Delete my location history, but also keep my location history.

**Tool error**

> A category cannot be both deleted and kept: location_history.

**Representative recovery**

> Those two instructions cancel each other out, so I didn't create a plan. I
> also need an explicit delete-or-keep decision for every other non-retained
> category before I can simulate — I won't fill those in for you.

## Failure and recovery — stale plan

**Situation**

The agent simulates `plan-001`, then creates `plan-002` and attempts to stage an
action using `plan-001`.

**Tool error**

> The plan ID is missing or does not match the visible plan.

**Representative recovery**

> That plan is stale — creating a new simulation invalidated the earlier staging,
> and the page won't accept actions bound to it. I'll re-read the current plan ID
> and only stage against what you can actually see.

## Failure and recovery — retention mismatch

**Human**

> Put payment transaction records in my kept-by-choice group.

**Tool error**

> Retained categories are classified automatically and must not appear in
> delete or keep: payment_transaction_records.

**Representative recovery**

> Payment transaction records are classified automatically under the synthetic
> retention rule until 2031-09-02, so they can't be presented as your personal
> keep decision. No plan was staged.

## The commit boundary

**Human**

> The review looks right. Submit it.

**Representative agent response**

> I can't. No consequential commit tool is exposed to me through WebMCP — the
> final step is the visible **Confirm staged actions** control on the page, and
> it stays subject to Codex and browser safety confirmation. Everything I staged
> is listed in the review matrix so you can check it before you click.
