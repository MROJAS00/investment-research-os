import { daysBetween, todayDay } from "@/lib/dates";
import type {
  AppState,
  CommitteeMeeting,
  EventKind,
  Idea,
  Priority,
  QuestionStatus,
  Stage,
} from "@/lib/types";
import { ACTIVE_STAGES } from "@/lib/types";

export function marginOfSafety(
  currentPrice: number,
  baseFairValue: number,
): number | null {
  if (
    !Number.isFinite(currentPrice) ||
    !Number.isFinite(baseFairValue) ||
    baseFairValue <= 0
  ) {
    return null;
  }
  return (baseFairValue - currentPrice) / baseFairValue;
}

export function ideaMargin(idea: Idea): number | null {
  return marginOfSafety(
    idea.valuation.currentPrice,
    idea.valuation.baseFairValue,
  );
}

export function isTerminal(stage: Stage): boolean {
  return stage === "invested" || stage === "rejected";
}

export function isActiveIdea(idea: Idea): boolean {
  return !isTerminal(idea.stage);
}

export function unresolvedQuestions(idea: Idea) {
  return idea.questions.filter((question) => question.status !== "completed");
}

export function isQuestionOverdue(
  status: QuestionStatus,
  dueDate: string,
  today = todayDay(),
): boolean {
  return status !== "completed" && dueDate.slice(0, 10) < today;
}

export function ideaAwaitsAction(idea: Idea, today = todayDay()): boolean {
  if (!isActiveIdea(idea)) return false;
  return idea.questions.some((question) =>
    isQuestionOverdue(question.status, question.dueDate, today),
  );
}

export function isNearTargetEntry(price: number, targetEntry: number): boolean {
  if (targetEntry <= 0 || price <= 0) return false;
  const ratio = price / targetEntry;
  return ratio >= 0.98 && ratio <= 1.04;
}

export interface AttentionItem {
  id: string;
  companyId: string;
  ownerId: string;
  priority: Priority;
  reason: string;
  kind: "stale_thesis" | "earnings_contradiction" | "near_entry" | "missing_document";
}

export function attentionItems(ideas: Idea[], today = todayDay()): AttentionItem[] {
  const items: AttentionItem[] = [];
  for (const idea of ideas) {
    if (!isActiveIdea(idea)) continue;
    const staleDays = daysBetween(idea.thesis.lastSubstantiveReview, today);
    if (staleDays >= 120) {
      items.push({
        id: `${idea.id}-stale`,
        companyId: idea.id,
        ownerId: idea.leadAnalystId,
        priority: "high",
        kind: "stale_thesis",
        reason: `Thesis not reviewed in ${staleDays} days`,
      });
    }
    if (idea.earningsComparison?.contradicts) {
      items.push({
        id: `${idea.id}-earnings`,
        companyId: idea.id,
        ownerId: idea.leadAnalystId,
        priority: "high",
        kind: "earnings_contradiction",
        reason: `New earnings summary contradicts an assumption: ${idea.earningsComparison.assumptionTouched}`,
      });
    }
    if (
      isNearTargetEntry(
        idea.valuation.currentPrice,
        idea.valuation.targetEntry,
      )
    ) {
      items.push({
        id: `${idea.id}-entry`,
        companyId: idea.id,
        ownerId: idea.leadAnalystId,
        priority: idea.priority === "low" ? "medium" : "high",
        kind: "near_entry",
        reason: "Illustrative price is near the target entry",
      });
    }
    if (
      idea.stage === "investment_committee" &&
      !idea.documents.some((document) => document.type === "valuation_model")
    ) {
      items.push({
        id: `${idea.id}-document`,
        companyId: idea.id,
        ownerId: idea.leadAnalystId,
        priority: "high",
        kind: "missing_document",
        reason: "Committee review is missing a valuation model",
      });
    }
  }
  const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  return items.sort((a, b) => rank[a.priority] - rank[b.priority]);
}

export function upcomingMeetings(
  meetings: CommitteeMeeting[],
  today = todayDay(),
): CommitteeMeeting[] {
  return meetings
    .filter(
      (meeting) =>
        (meeting.status === "scheduled" || meeting.status === "in_progress") &&
        meeting.scheduledAt.slice(0, 10) >= today,
    )
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

export function countByStage(ideas: Idea[]): Record<Stage, number> {
  const counts = Object.fromEntries(
    [
      "discovered",
      "initial_screening",
      "deep_research",
      "valuation",
      "watchlist",
      "investment_committee",
      "portfolio_candidate",
      "invested",
      "rejected",
    ].map((stage) => [stage, 0]),
  ) as Record<Stage, number>;
  for (const idea of ideas) counts[idea.stage] += 1;
  return counts;
}

export interface DashboardMetrics {
  activeIdeas: number;
  deepResearch: number;
  upcomingCommittee: number;
  awaitingAction: number;
}

export function dashboardMetrics(state: AppState, today = todayDay()): DashboardMetrics {
  return {
    activeIdeas: state.ideas.filter(isActiveIdea).length,
    deepResearch: state.ideas.filter((idea) => idea.stage === "deep_research").length,
    upcomingCommittee: upcomingMeetings(state.meetings, today).length,
    awaitingAction: state.ideas.filter((idea) => ideaAwaitsAction(idea, today)).length,
  };
}

export interface CalendarEntry {
  id: string;
  companyId?: string;
  meetingId?: string;
  kind: EventKind;
  title: string;
  date: string;
  detail: string;
  overdue: boolean;
}

export function calendarEntries(state: AppState, today = todayDay()): CalendarEntry[] {
  const companyEvents: CalendarEntry[] = state.events.map((event) => ({
    ...event,
    overdue: event.date < today,
  }));
  const meetings: CalendarEntry[] = state.meetings
    .filter((meeting) => meeting.status !== "cancelled")
    .map((meeting) => ({
      id: `meeting-${meeting.id}`,
      meetingId: meeting.id,
      kind: "committee" as const,
      title: meeting.title,
      date: meeting.scheduledAt.slice(0, 10),
      detail: meeting.location,
      overdue:
        meeting.scheduledAt.slice(0, 10) < today && meeting.status !== "completed",
    }));
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 50);
  const horizonDay = `${horizon.getFullYear()}-${String(horizon.getMonth() + 1).padStart(2, "0")}-${String(horizon.getDate()).padStart(2, "0")}`;
  const recentFloor = new Date();
  recentFloor.setDate(recentFloor.getDate() - 21);
  const floorDay = `${recentFloor.getFullYear()}-${String(recentFloor.getMonth() + 1).padStart(2, "0")}-${String(recentFloor.getDate()).padStart(2, "0")}`;

  return [...companyEvents, ...meetings]
    .filter((entry) => entry.date >= floorDay && entry.date <= horizonDay)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function recentTheses(ideas: Idea[], limit = 5): Idea[] {
  return [...ideas]
    .sort((a, b) => b.thesis.lastEditedAt.localeCompare(a.thesis.lastEditedAt))
    .slice(0, limit);
}

export function memberById(state: AppState, id: string) {
  return state.team.find((member) => member.id === id);
}

export function ideaById(state: AppState, id: string) {
  return state.ideas.find((idea) => idea.id === id);
}

export const PIPELINE_STAGE_ORDER = ACTIVE_STAGES;

export function priorityRank(priority: Priority): number {
  if (priority === "high") return 0;
  if (priority === "medium") return 1;
  return 2;
}

export function cheapVersusValuation(idea: Idea): boolean {
  const margin = ideaMargin(idea);
  if (margin === null) return false;
  return margin > 0 && margin >= idea.valuation.minMarginOfSafety;
}

export function openQuestionsForMember(ideas: Idea[], memberId: string) {
  return ideas.flatMap((idea) =>
    idea.questions
      .filter(
        (question) =>
          question.ownerId === memberId && question.status !== "completed",
      )
      .map((question) => ({ idea, question })),
  );
}
