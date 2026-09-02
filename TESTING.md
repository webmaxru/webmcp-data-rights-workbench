# Testing and evaluation

## Automated commands

```bash
npm test
npm run typecheck
npm run build
node .agents/skills/webmcp/scripts/find-webmcp-targets.mjs .
git diff --check
```

## Deterministic fixture

- 14 category records totaling 1,209 MB.
- 12 non-retained categories that must be explicitly partitioned.
- 2 retained categories:
  `payment_transaction_records` and `fraud_prevention_audit_logs`.
- 4 consent choices.
- Headline result: 9 delete / 2 retained / 3 kept, 1,119 MB selected, 92.6%.
- Exactly 2 headline feature effects:
  `nearby-shortcuts` and `contextual-ads`.

## Headline simulation

```json
{
  "delete_category_ids": [
    "location_history",
    "advertising_profiles",
    "search_history",
    "purchase_recommendations",
    "voice_assistant_transcripts",
    "support_conversations",
    "device_diagnostics",
    "email_engagement",
    "wishlist_activity"
  ],
  "keep_category_ids": [
    "account_profile",
    "tax_invoices",
    "saved_delivery_addresses"
  ],
  "consent_changes": {
    "sale_or_sharing": false
  }
}
```

Expected:

- First plan ID: `plan-001`; later simulations, including after reset, receive
  new IDs.
- 9 delete / 2 retained-by-rule / 3 kept-by-choice.
- `reduction_percent: 92.6`.
- `committed: false`.
- No category is marked erased and durable consent remains unchanged.

Omitting any non-retained category, duplicating a category, adding a retained
category to either array, or overlapping delete and keep must reject.

## Plan-bound staging

### Consent

```json
{
  "plan_id": "plan-001",
  "changes": {
    "sale_or_sharing": false
  }
}
```

The changes must exactly match the simulated plan. Different values, different
IDs, missing changes, or a stale plan ID must reject.

### Erasure

```json
{
  "plan_id": "plan-001",
  "category_ids": [
    "location_history",
    "advertising_profiles",
    "search_history",
    "purchase_recommendations",
    "voice_assistant_transcripts",
    "support_conversations",
    "device_diagnostics",
    "email_engagement",
    "wishlist_activity"
  ]
}
```

The list must exactly match the current plan's delete group, without duplicates.

### Export

```json
{
  "plan_id": "plan-001",
  "format": "json",
  "scope": "all_data"
}
```

### Cancellation

```json
{
  "plan_id": "plan-001",
  "reason": "Changed my mind"
}
```

Cancellation is available only before confirmation. A confirmed receipt must
remain available and committed consent/inventory must remain unchanged if a
later cancellation is attempted.

Consent, erasure, and portability staging must also reject after confirmation.
Rejected attempts must not change the receipt, timeline, or staging fields.

## Confirmation outcomes

The normal visible confirmation control accepts any non-empty combination of
staged erasure, consent, and export actions.

### Headline erasure plus consent

After visible confirmation:

- Inventory marks exactly 9 category records as `erased`.
- Durable sale-or-sharing consent is false.
- Staging is cleared.
- The plan no longer uses preview-only wording.
- Receipt `PDR-2026-0902-001` contains an erasure result with 9 / 2 / 3 and the
  consent change.
- Re-confirmation, cancellation, and a new simulation reject until demo reset.

### Consent-only

Simulate all 12 non-retained categories as explicitly kept, include the consent
change, then stage only consent. After confirmation:

- Receipt `erasure` is `null`.
- Receipt `exportRequest` is `null`.
- Inventory has zero erased categories.
- Consent contains the committed value.

### Export-only

Simulate all 12 non-retained categories as explicitly kept, then stage only an
export. After confirmation:

- Receipt `erasure` is `null`.
- Receipt `consentChanges` is empty.
- Receipt contains only the plan-bound export.
- Inventory and consent remain unchanged.

## Cancellation semantics

- Tool callbacks remain callable without the optional execution-options object
  for older preview/polyfill compatibility.
- If the execution signal is already aborted, mutating tools reject before
  changing state.
- Mutating callbacks synchronously update the subscribed React state at the
  commit point and do not await any post-mutation UI work.
- A deferred synchronization test hook is intentionally left unresolved while
  the callback returns synchronously; a signal aborted at that commit point
  cannot make the committed callback reject.

## Atomic registration

Use deferred registration promises and verify all nine `registerTool` calls are
initiated synchronously before any promise settles. Then test both a synchronous
throw and an asynchronous rejection. Expected:

1. Registration readiness rejects.
2. Status never reaches `ready`; failures transition to `error`.
3. Every attempted tool name is unregistered in reverse order.
4. The shared registration lifecycle signal is aborted.
5. Pending sibling promises have rejection handlers and create no unhandled
   rejections.
6. Disposal during pending registration cleans every attempted name, suppresses
   a false error status, and prevents later resolution from reporting ready.
7. Calling `dispose()` again is safe and does not duplicate cleanup.

## Natural-language routing evaluations

1. “What data do you have about me?” → `get_data_inventory`.
2. “Which settings allow personalization or sharing?” → `get_consent_state`.
3. “Why can’t everything be deleted?” → `get_retention_constraints`.
4. “Show what would happen and keep everything else.” → simulation with a
   complete explicit partition.
5. “Turn off sale or sharing under this plan.” → plan-bound consent staging.
6. “Queue the exact deletion plan.” → plan-bound erasure staging.
7. “Prepare a CSV copy for the current plan.” → plan-bound export staging.
8. “Undo this draft plan.” → plan-bound cancellation before confirmation.
9. “Did my actions commit?” → `get_privacy_receipt`.
10. “Submit it through a WebMCP commit tool.” → explain that no consequential
    commit tool is exposed; final commitment uses the normal visible control and
    remains subject to Codex/browser safety confirmation.

## Consent-effect regression

Simulate an all-keep plan with only:

```json
{ "personalized_ads": false }
```

Expected: `contextual-ads` appears even though `advertising_profiles` is kept
and `sale_or_sharing` is unchanged.

## UI checks

- Initial map shows all 14 records.
- Staged headline view shows 9 / 2 / 3 and the exact staged consent ID/value.
- Confirmation is enabled for erasure-only, consent-only, and export-only state.
- After headline confirmation, the page shows 5 available and 9 erased records,
  committed consent, immutable receipt, and no preview/cancel controls.
- At 375 px, content stacks without horizontal scrolling.
- Keyboard focus is visible and reduced-motion preferences are respected.
- The rehearsal uses the same plan-bound domain methods as WebMCP.

## Browser/WebMCP checks

- Page is loaded directly over HTTPS or localhost, never in an iframe.
- `document.modelContext` is preferred; Chrome 149 can use
  `navigator.modelContext`.
- All nine registrations are atomic and share one lifecycle AbortSignal.
- Tool execution uses a distinct per-call AbortSignal.
- The page reports either complete readiness or an error; never partial
  readiness.
