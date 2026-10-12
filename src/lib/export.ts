import { formatDate, formatPercent } from "@/lib/format";
import {
  ACTIVITY_LABELS,
  DECISION_LABELS,
  DOCUMENT_TYPE_LABELS,
  STAGE_LABELS,
  THESIS_STATUS_LABELS,
} from "@/lib/labels";
import { ideaMargin, memberById } from "@/lib/metrics";
import type { AppState, Idea } from "@/lib/types";

function csvCell(value: string | number | undefined): string {
  const text = value === undefined ? "" : String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function ideasToCsv(state: AppState): string {
  const headers = [
    "Company",
    "Ticker",
    "Country",
    "Sector",
    "Stage",
    "Priority",
    "Conviction",
    "Lead analyst",
    "Price EUR",
    "Base fair value EUR",
    "Bear fair value EUR",
    "Bull fair value EUR",
    "Target entry EUR",
    "Margin of safety",
    "Minimum margin of safety",
    "Last thesis review",
    "Thesis status",
    "Next action",
    "Research reason",
    "Unresolved questions",
    "Wait reason",
    "Rejection reason",
  ];
  const rows = state.ideas.map((idea) => {
    const analyst = memberById(state, idea.leadAnalystId);
    const margin = ideaMargin(idea);
    return [
      idea.companyName,
      idea.ticker,
      idea.country,
      idea.sector,
      STAGE_LABELS[idea.stage],
      idea.priority,
      idea.conviction,
      analyst?.name ?? idea.leadAnalystId,
      idea.valuation.currentPrice,
      idea.valuation.baseFairValue,
      idea.valuation.bearFairValue,
      idea.valuation.bullFairValue,
      idea.valuation.targetEntry,
      margin === null ? "" : (margin * 100).toFixed(1) + "%",
      (idea.valuation.minMarginOfSafety * 100).toFixed(0) + "%",
      idea.thesis.lastSubstantiveReview,
      THESIS_STATUS_LABELS[idea.thesis.status],
      idea.nextAction,
      idea.researchReason,
      idea.questions.filter((question) => question.status !== "completed").length,
      idea.waitReason ?? "",
      idea.rejectionReason ?? "",
    ];
  });
  return [headers, ...rows]
    .map((row) => row.map((cell) => csvCell(cell)).join(","))
    .join("\n");
}

export function stateToJson(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function companyDossierMarkdown(state: AppState, idea: Idea): string {
  const analyst = memberById(state, idea.leadAnalystId);
  const margin = ideaMargin(idea);
  const activities = state.activities.filter(
    (activity) => activity.companyId === idea.id,
  );
  const decisions = state.meetings.flatMap((meeting) =>
    meeting.agenda
      .filter((item) => item.companyId === idea.id && item.decision)
      .map((item) => ({ meeting, item })),
  );
  const lines = [
    `# ${idea.companyName} (${idea.ticker})`,
    "",
    `${state.settings.workspaceName}`,
    "",
    "Illustrative research summary exported from local demo data. Not an investment recommendation. Company, ticker, people, and figures are fictional.",
    "",
    "## Position in the research process",
    "",
    `- Stage: ${STAGE_LABELS[idea.stage]}`,
    `- Country / sector: ${idea.country} / ${idea.sector}`,
    `- Lead analyst: ${analyst?.name ?? "Unassigned"}`,
    `- Priority: ${idea.priority}`,
    `- Conviction: ${idea.conviction}`,
    `- Thesis status: ${THESIS_STATUS_LABELS[idea.thesis.status]}`,
    `- Last substantive review: ${formatDate(idea.thesis.lastSubstantiveReview)}`,
    `- Next action: ${idea.nextAction}`,
    "",
    "## Why it is being researched",
    "",
    idea.researchReason,
    "",
    "## Investment thesis",
    "",
    `### Business overview`,
    idea.thesis.businessOverview,
    "",
    `### Why it may be mispriced`,
    idea.thesis.whyMispriced,
    "",
    `### Competitive advantages`,
    idea.thesis.competitiveAdvantages,
    "",
    `### Long-term growth drivers`,
    idea.thesis.growthDrivers,
    "",
    `### Capital allocation`,
    idea.thesis.capitalAllocation,
    "",
    `### Management quality`,
    idea.thesis.managementQuality,
    "",
    `### Main risks`,
    idea.thesis.mainRisks,
    "",
    `### What would invalidate the thesis`,
    idea.thesis.invalidators,
    "",
    `### Bull case`,
    idea.thesis.bullCase,
    "",
    `### Base case`,
    idea.thesis.baseCase,
    "",
    `### Bear case`,
    idea.thesis.bearCase,
    "",
    "## Illustrative valuation",
    "",
    "Source currency is EUR. These are discussion assumptions, not a recommendation and not a live price.",
    "",
    `- Current illustrative price: €${idea.valuation.currentPrice.toFixed(2)}`,
    `- Bear / base / bull fair value: €${idea.valuation.bearFairValue.toFixed(2)} / €${idea.valuation.baseFairValue.toFixed(2)} / €${idea.valuation.bullFairValue.toFixed(2)}`,
    `- Target entry: €${idea.valuation.targetEntry.toFixed(2)}`,
    `- Margin of safety vs base case: ${formatPercent(margin)}`,
    `- Minimum desired margin of safety: ${formatPercent(idea.valuation.minMarginOfSafety)}`,
    "",
    "## Research questions",
    "",
  ];
  if (idea.questions.length === 0) {
    lines.push("None stored.", "");
  } else {
    for (const question of idea.questions) {
      const owner = memberById(state, question.ownerId);
      lines.push(
        `- [${question.status}] ${question.question} — ${owner?.name ?? question.ownerId}, due ${formatDate(question.dueDate)}. ${question.notes}`.trim(),
      );
    }
    lines.push("");
  }
  lines.push("## Documents and evidence", "");
  lines.push(
    "Every record below is an illustrative local entry. Nothing here confirms that an external document was retrieved or verified.",
    "",
  );
  if (idea.documents.length === 0) {
    lines.push("None stored.", "");
  } else {
    for (const document of idea.documents) {
      lines.push(
        `- ${document.title} (${DOCUMENT_TYPE_LABELS[document.type]}, ${formatDate(document.publicationDate)}). ${document.analystNotes}`,
      );
    }
    lines.push("");
  }
  lines.push("## Committee decisions", "");
  if (decisions.length === 0) {
    lines.push("None recorded.", "");
  } else {
    for (const entry of decisions) {
      const decision = entry.item.decision;
      if (!decision) continue;
      const actor = memberById(state, decision.decidedBy);
      lines.push(
        `- ${formatDate(decision.decidedAt)} — ${DECISION_LABELS[decision.type]} (${entry.meeting.title}). ${decision.rationale} Recorded by ${actor?.name ?? decision.decidedBy}.`,
      );
    }
    lines.push("");
  }
  lines.push("## History", "");
  if (activities.length === 0) {
    lines.push("No activity stored.", "");
  } else {
    for (const activity of activities) {
      const actor = memberById(state, activity.actorId);
      lines.push(
        `- ${formatDate(activity.at)} — ${ACTIVITY_LABELS[activity.kind]} — ${actor?.name ?? activity.actorId}: ${activity.description}`,
      );
    }
    lines.push("");
  }
  if (idea.rejectionReason) {
    lines.push("## Rejection reason", "", idea.rejectionReason, "");
  }
  if (idea.waitReason) {
    lines.push("## Why it is waiting", "", idea.waitReason, "");
  }
  return lines.join("\n");
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function copyCurrentUrl(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch {
    return false;
  }
}
