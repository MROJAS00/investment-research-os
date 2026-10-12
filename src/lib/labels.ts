import type {
  ActivityKind,
  Conviction,
  Currency,
  DecisionType,
  DocumentType,
  EventKind,
  MeetingStatus,
  Priority,
  QuestionStatus,
  Stage,
  ThesisStatus,
  WaitKind,
} from "@/lib/types";

export const STAGE_LABELS: Record<Stage, string> = {
  discovered: "Discovered",
  initial_screening: "Initial Screening",
  deep_research: "Deep Research",
  valuation: "Valuation",
  watchlist: "Watchlist",
  investment_committee: "Investment Committee",
  portfolio_candidate: "Portfolio Candidate",
  invested: "Invested",
  rejected: "Rejected",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const CONVICTION_LABELS: Record<Conviction, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  unformed: "Unformed",
};

export const THESIS_STATUS_LABELS: Record<ThesisStatus, string> = {
  draft: "Draft",
  active: "Active",
  under_review: "Under review",
  stale: "Stale",
  invalidated: "Invalidated",
};

export const QUESTION_STATUS_LABELS: Record<QuestionStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  blocked: "Blocked",
  completed: "Completed",
};

export const WAIT_KIND_LABELS: Record<WaitKind, string> = {
  price: "Waiting on price",
  thesis: "Thesis deteriorated",
  catalyst: "Waiting on a catalyst",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  annual_report: "Annual report",
  earnings_summary: "Earnings summary",
  internal_note: "Internal note",
  valuation_model: "Valuation model",
  industry_note: "Industry note",
  transcript: "Transcript",
  other: "Other",
};

export const DECISION_LABELS: Record<DecisionType, string> = {
  approve_further: "Approve for further consideration",
  request_research: "Request more research",
  add_watchlist: "Add to watchlist",
  reject: "Reject",
  approve_candidate: "Approve as a portfolio candidate",
};

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  earnings: "Earnings",
  annual_report: "Annual report",
  committee: "Committee",
  thesis_review: "Thesis review",
};

export const ACTIVITY_LABELS: Record<ActivityKind, string> = {
  created: "Opened",
  thesis_edit: "Thesis",
  valuation_change: "Valuation",
  stage_change: "Stage",
  question_update: "Question",
  comment: "Comment",
  committee_decision: "Committee",
  watchlist: "Watchlist",
  document: "Document",
  reassignment: "Assignment",
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  EUR: "Euro (EUR)",
  USD: "US dollar (USD)",
  GBP: "Sterling (GBP)",
  CHF: "Swiss franc (CHF)",
};

export const SECTORS = [
  "Industrials",
  "Materials",
  "Consumer Staples",
  "Consumer Discretionary",
  "Utilities",
  "Health Care",
] as const;

export const COUNTRIES = [
  "Austria",
  "Finland",
  "France",
  "Germany",
  "Italy",
  "Netherlands",
  "Norway",
  "Spain",
  "Sweden",
  "United Kingdom",
] as const;

export function stageOptions(stages: readonly Stage[]) {
  return stages.map((stage) => ({ value: stage, label: STAGE_LABELS[stage] }));
}
