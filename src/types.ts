export type CategoryStatus = "erasable" | "retained" | "erased";
export type PlanGroup = "delete" | "retained" | "keep";
export type ConsentId =
  | "personalized_ads"
  | "sale_or_sharing"
  | "location_personalization"
  | "product_analytics";

export interface DataCategory {
  id: string;
  name: string;
  description: string;
  bytes: number;
  status: CategoryStatus;
  icon: string;
}

export interface ConsentChoice {
  id: ConsentId;
  name: string;
  description: string;
  enabled: boolean;
}

export interface RetentionConstraint {
  categoryId: string;
  rule: string;
  until: string;
  basis: string;
}

export interface FeatureEffect {
  id: string;
  title: string;
  explanation: string;
  severity: "notice" | "warning";
}

export interface PlanItem extends DataCategory {
  group: PlanGroup;
  reason: string;
}

export interface PrivacyPlan {
  id: string;
  items: PlanItem[];
  consentChanges: Partial<Record<ConsentId, boolean>>;
  effects: FeatureEffect[];
  deleteBytes: number;
  totalBytes: number;
  reductionPercent: number;
}

export interface StagedErasure {
  planId: string;
  categoryIds: string[];
}

export interface StagedConsent {
  planId: string;
  changes: Partial<Record<ConsentId, boolean>>;
}

export interface StagedExport {
  planId: string;
  format: "json" | "csv";
  scope: "all_data" | "current_plan";
}

export interface ConfirmedErasure {
  erasedCategoryIds: string[];
  retainedCategoryIds: string[];
  keptCategoryIds: string[];
}

export interface PrivacyReceipt {
  id: string;
  planId: string;
  confirmedAt: string;
  erasure: ConfirmedErasure | null;
  consentChanges: Partial<Record<ConsentId, boolean>>;
  exportRequest: StagedExport | null;
  status: "confirmed";
}

export interface TimelineEvent {
  id: string;
  label: string;
  detail: string;
  tone: "neutral" | "active" | "success";
}

export interface WorkbenchState {
  categories: DataCategory[];
  consents: ConsentChoice[];
  constraints: RetentionConstraint[];
  plan: PrivacyPlan | null;
  stagedErasure: StagedErasure | null;
  stagedConsent: StagedConsent | null;
  stagedExport: StagedExport | null;
  receipt: PrivacyReceipt | null;
  timeline: TimelineEvent[];
}

export interface SimulationInput {
  deleteCategoryIds: string[];
  keepCategoryIds: string[];
  consentChanges?: Partial<Record<ConsentId, boolean>>;
}
