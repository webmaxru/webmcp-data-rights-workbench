# Natural-language dialogues

## Dialogue 1 — headline minimization

**Human**

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

> I inspected 14 categories and found two time-limited retention constraints. I
> simulated plan `plan-001` with 9 selected for deletion, 2 retained by rule,
> and 3 explicitly kept, selecting 92.6% of demo bytes. Sale or sharing is
> staged off. Nearby shortcuts will stop learning familiar places, and ads will
> become contextual rather than profile-driven. Nothing is committed yet.
> Review the visible matrix and use the normal confirmation control if the plan
> is correct.

## Dialogue 2 — explain before acting

**Human**

> Before staging anything, tell me what cannot be erased now and what I would
> lose by deleting location and ad profiles.

**Expected tool sequence**

1. `get_retention_constraints`
2. `get_data_inventory`
3. `simulate_privacy_plan` only if every non-retained category can be explicitly
   classified from the user's instructions; otherwise ask for clarification

**Representative agent response**

> Payment transaction records are retained until 2031-09-02 under the synthetic
> financial-ledger rule. Fraud-prevention audit logs are retained until
> 2027-03-02 under the synthetic security-review window. Deleting location
> history removes learned familiar-place shortcuts, while deleting advertising
> profiles makes ads contextual rather than profile-driven. I have not staged
> or committed an action.

## Dialogue 3 — portability without deletion

**Human**

> Prepare a JSON copy of all my data for review, but do not delete anything or
> change consent.

**Expected tool sequence**

1. `get_data_inventory`
2. `simulate_privacy_plan` with all 12 non-retained categories explicitly in
   `keep_category_ids`, an empty delete array, and no consent changes
3. `stage_portability_export` with the returned `plan_id`,
   `{ "format": "json", "scope": "all_data" }`

**Representative agent response**

> A JSON portability export is staged against the current plan. No category is
> selected for deletion and no consent choice changed. No consequential commit
> tool is exposed; the export can be committed through the normal visible page
> control, subject to browser and agent safety confirmation.

**After the visible control is actuated**

> The receipt contains the JSON export request, an empty consent-change object,
> and no erasure result. Inventory remains unchanged.

## Dialogue 4 — consent-only workflow

**Human**

> Keep all account data, but opt me out of sale or sharing and stage that choice.

**Expected tool sequence**

1. `get_data_inventory`
2. `get_consent_state`
3. `simulate_privacy_plan` with all 12 non-retained categories explicitly kept
   and `{ "sale_or_sharing": false }`
4. `stage_consent_changes` with the returned `plan_id` and the exact same change

**Representative agent response**

> Sale or sharing is staged off under the current plan. No erasure or export is
> staged. Durable consent still reads on until the visible confirmation control
> is actuated.

**After visible confirmation**

> The receipt records only the sale-or-sharing change. It contains no erasure or
> export result, and inventory remains unchanged.

## Failure and recovery — conflicting or incomplete partition

**Human**

> Delete my location history, but also keep my location history.

**Tool error**

> A category cannot be both deleted and kept: location_history.

**Representative recovery**

> Those instructions conflict, so no plan was created. I also need an explicit
> delete-or-keep choice for every other non-retained category before simulation
> can proceed. I will not invent those choices.

## Failure and recovery — stale plan

**Situation**

The agent simulates `plan-001`, then creates `plan-002` and attempts to stage an
action using `plan-001`.

**Tool error**

> The plan ID is missing or does not match the visible plan.

**Representative recovery**

> The earlier plan is stale and its staging was invalidated. I will inspect the
> current visible plan ID and only stage actions that exactly match it.

## Failure and recovery — retention mismatch

**Human**

> Put payment transaction records in my kept-by-choice group.

**Tool error**

> Retained categories are classified automatically and must not appear in
> delete or keep: payment_transaction_records.

**Representative recovery**

> Payment transaction records are automatically classified under the synthetic
> retention rule until 2031-09-02, not as user-selected keep intent. No plan was
> staged.

## Final approval dialogue

**Human**

> The review looks right. Submit it.

**Representative agent response**

> No consequential commit tool is exposed through WebMCP. Final commitment uses
> the normal visible **Confirm staged actions** control and remains subject to
> Codex/browser safety confirmation. Ordinary browser actuation may still reach
> that control.

**After the visible control is actuated**

**Human**

> Confirmation is complete. Read my receipt.

**Expected tool**

`get_privacy_receipt`

**Representative agent response**

> Receipt `PDR-2026-0902-001` records the confirmed headline actions: 9 erased
> categories, 2 retained by rule, 3 kept by explicit choice, and sale or sharing
> changed to off. Inventory now marks the nine categories erased, consent state
> reports the committed value, and the staging state is cleared.
