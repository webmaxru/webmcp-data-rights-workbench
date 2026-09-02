import type {
  ConsentChoice,
  DataCategory,
  RetentionConstraint,
  SimulationInput,
} from "./types";

const mb = (value: number) => value * 1024 * 1024;

export const categories: DataCategory[] = [
  { id: "account_profile", name: "Account profile", description: "Name, preferences, and account settings", bytes: mb(18), status: "erasable", icon: "ID" },
  { id: "saved_delivery_addresses", name: "Saved delivery addresses", description: "Addresses used to speed up checkout", bytes: mb(6), status: "erasable", icon: "AD" },
  { id: "tax_invoices", name: "Tax invoices", description: "Downloadable invoices chosen for safekeeping", bytes: mb(22), status: "erasable", icon: "TX" },
  { id: "location_history", name: "Location history", description: "Visited places and location-derived routines", bytes: mb(280), status: "erasable", icon: "LC" },
  { id: "advertising_profiles", name: "Advertising profiles", description: "Inferred interests and audience segments", bytes: mb(96), status: "erasable", icon: "AD" },
  { id: "search_history", name: "Search history", description: "Queries and browsing discovery signals", bytes: mb(140), status: "erasable", icon: "SH" },
  { id: "purchase_recommendations", name: "Recommendation signals", description: "Product affinity and ranking history", bytes: mb(76), status: "erasable", icon: "RC" },
  { id: "voice_assistant_transcripts", name: "Voice transcripts", description: "Synthetic assistant requests and transcripts", bytes: mb(210), status: "erasable", icon: "VO" },
  { id: "support_conversations", name: "Support conversations", description: "Chat transcripts and resolved tickets", bytes: mb(85), status: "erasable", icon: "SP" },
  { id: "device_diagnostics", name: "Device diagnostics", description: "Crash details and performance traces", bytes: mb(160), status: "erasable", icon: "DV" },
  { id: "email_engagement", name: "Email engagement", description: "Synthetic opens, clicks, and campaign history", bytes: mb(48), status: "erasable", icon: "EM" },
  { id: "wishlist_activity", name: "Wishlist activity", description: "Saved products and reminder interactions", bytes: mb(24), status: "erasable", icon: "WL" },
  { id: "payment_transaction_records", name: "Payment transaction records", description: "Completed payment ledger entries", bytes: mb(32), status: "retained", icon: "PY" },
  { id: "fraud_prevention_audit_logs", name: "Fraud-prevention audit logs", description: "Minimal security decisions and access trail", bytes: mb(12), status: "retained", icon: "FR" },
];

export const consents: ConsentChoice[] = [
  { id: "personalized_ads", name: "Personalized advertising", description: "Use activity to tailor ads", enabled: true },
  { id: "sale_or_sharing", name: "Sale or sharing", description: "Allow data sharing for cross-context advertising", enabled: true },
  { id: "location_personalization", name: "Location personalization", description: "Use location for nearby suggestions", enabled: true },
  { id: "product_analytics", name: "Product analytics", description: "Use diagnostics to improve the product", enabled: true },
];

export const constraints: RetentionConstraint[] = [
  {
    categoryId: "payment_transaction_records",
    rule: "Financial ledger retention",
    until: "2031-09-02",
    basis: "A synthetic five-year accounting rule applies to completed payments.",
  },
  {
    categoryId: "fraud_prevention_audit_logs",
    rule: "Security dispute window",
    until: "2027-03-02",
    basis: "A synthetic six-month security review window remains open.",
  },
];

export const headlineInput: SimulationInput = {
  deleteCategoryIds: [
    "location_history",
    "advertising_profiles",
    "search_history",
    "purchase_recommendations",
    "voice_assistant_transcripts",
    "support_conversations",
    "device_diagnostics",
    "email_engagement",
    "wishlist_activity",
  ],
  keepCategoryIds: [
    "account_profile",
    "tax_invoices",
    "saved_delivery_addresses",
  ],
  consentChanges: {
    sale_or_sharing: false,
  },
};
