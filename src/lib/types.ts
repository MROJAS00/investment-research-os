export const STAGES = [
  "discovered",
  "initial_screening",
  "deep_research",
  "valuation",
  "watchlist",
  "investment_committee",
  "portfolio_candidate",
  "invested",
  "rejected",
] as const;

export type Stage = (typeof STAGES)[number];

export const ACTIVE_STAGES = [
  "discovered",
  "initial_screening",
  "deep_research",
  "valuation",
  "watchlist",
  "investment_committee",
  "portfolio_candidate",
] as const satisfies readonly Stage[];

export const PRIORITIES = ["high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const CONVICTIONS = ["high", "medium", "low", "unformed"] as const;
export type Conviction = (typeof CONVICTIONS)[number];

export const THESIS_STATUSES = [
  "draft",
  "active",
  "under_review",
  "stale",
  "invalidated",
] as const;
export type ThesisStatus = (typeof THESIS_STATUSES)[number];

export const QUESTION_STATUSES = [
  "open",
  "in_progress",
  "blocked",
  "completed",
] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export const ROLES = [
  "Portfolio Manager",
  "Investment Analyst",
  "Research Associate",
] as const;
export type Role = (typeof ROLES)[number];

export const WAIT_KINDS = ["price", "thesis", "catalyst"] as const;
export type WaitKind = (typeof WAIT_KINDS)[number];

export const CURRENCIES = ["EUR", "USD", "GBP", "CHF"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const DOCUMENT_TYPES = [
  "annual_report",
  "earnings_summary",
  "internal_note",
  "valuation_model",
  "industry_note",
  "transcript",
  "other",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DECISION_TYPES = [
  "approve_further",
  "request_research",
  "add_watchlist",
  "reject",
  "approve_candidate",
] as const;
export type DecisionType = (typeof DECISION_TYPES)[number];

export const MEETING_STATUSES = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const ACTIVITY_KINDS = [
  "created",
  "thesis_edit",
  "valuation_change",
  "stage_change",
  "question_update",
  "comment",
  "committee_decision",
  "watchlist",
  "document",
  "reassignment",
] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export const EVENT_KINDS = [
  "earnings",
  "annual_report",
  "committee",
  "thesis_review",
] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  initials: string;
  email: string;
}

export interface Thesis {
  businessOverview: string;
  whyMispriced: string;
  competitiveAdvantages: string;
  growthDrivers: string;
  capitalAllocation: string;
  managementQuality: string;
  mainRisks: string;
  invalidators: string;
  bullCase: string;
  baseCase: string;
  bearCase: string;
  status: ThesisStatus;
  lastSubstantiveReview: string;
  lastEditedAt: string;
  changeSummary: string;
}

export interface ThesisSnapshot {
  id: string;
  savedAt: string;
  savedBy: string;
  summary: string;
  thesis: Thesis;
}

export interface Valuation {
  currentPrice: number;
  bearFairValue: number;
  baseFairValue: number;
  bullFairValue: number;
  targetEntry: number;
  minMarginOfSafety: number;
  updatedAt: string;
}

export interface EarningsComparison {
  previousSummary: string;
  latestSummary: string;
  assumptionTouched: string;
  contradicts: boolean;
}

export interface ResearchQuestion {
  id: string;
  question: string;
  ownerId: string;
  priority: Priority;
  status: QuestionStatus;
  dueDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  type: DocumentType;
  publicationDate: string;
  sourceUrl?: string;
  analystNotes: string;
  associatedClaim?: string;
  illustrative: boolean;
  addedBy: string;
  addedAt: string;
}

export interface Idea {
  id: string;
  companyName: string;
  ticker: string;
  country: string;
  sector: string;
  stage: Stage;
  leadAnalystId: string;
  priority: Priority;
  conviction: Conviction;
  nextAction: string;
  researchReason: string;
  lastUpdated: string;
  createdAt: string;
  rejectionReason?: string;
  waitKind?: WaitKind;
  waitReason?: string;
  nextReviewTrigger?: string;
  earningsComparison?: EarningsComparison;
  thesis: Thesis;
  thesisHistory: ThesisSnapshot[];
  valuation: Valuation;
  questions: ResearchQuestion[];
  documents: DocumentRecord[];
}

export interface AgendaItem {
  id: string;
  companyId: string;
  presenterId: string;
  decision?: {
    type: DecisionType;
    rationale: string;
    decidedBy: string;
    decidedAt: string;
  };
}

export interface CommitteeMeeting {
  id: string;
  title: string;
  scheduledAt: string;
  status: MeetingStatus;
  location: string;
  notes: string;
  agenda: AgendaItem[];
}

export interface ResearchEvent {
  id: string;
  companyId?: string;
  kind: Exclude<EventKind, "committee">;
  title: string;
  date: string;
  detail: string;
}

export interface Activity {
  id: string;
  companyId?: string;
  meetingId?: string;
  kind: ActivityKind;
  at: string;
  actorId: string;
  description: string;
}

export interface Settings {
  workspaceName: string;
  currency: Currency;
  defaultPipelineView: "kanban" | "table";
  actingUserId: string;
}

export interface AppState {
  version: 1;
  ideas: Idea[];
  meetings: CommitteeMeeting[];
  events: ResearchEvent[];
  activities: Activity[];
  team: TeamMember[];
  settings: Settings;
  seededAt: string;
}

export interface IdeaDraft {
  companyName: string;
  ticker: string;
  country: string;
  sector: string;
  stage: Stage;
  leadAnalystId: string;
  priority: Priority;
  conviction: Conviction;
  nextAction: string;
  researchReason: string;
  currentPrice: number;
  baseFairValue: number;
}
