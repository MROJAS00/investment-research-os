import type { DocumentRecord, Idea } from "@/lib/types";

function firstSentence(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "Not yet documented.") return "";
  const match = trimmed.match(/^(.+?[.])(\s|$)/);
  return (match?.[1] ?? trimmed).trim();
}

export interface AssistantCitation {
  documentId: string;
  title: string;
  sentence: string;
}

export function earningsReadout(idea: Idea): {
  available: boolean;
  previous: string;
  latest: string;
  observation: string;
} {
  const comparison = idea.earningsComparison;
  if (!comparison) {
    return {
      available: false,
      previous: "",
      latest: "",
      observation:
        "No fictional earnings pair is stored for this company. A future assistant would compare local summaries only, not a live filing feed.",
    };
  }
  const observation = comparison.contradicts
    ? `The latest fictional summary conflicts with the stored assumption “${comparison.assumptionTouched}”. This is a deterministic comparison of two local notes, not a model checking a live report.`
    : `The latest fictional summary is consistent with the stored assumption “${comparison.assumptionTouched}”. Nothing here is a live price or a verified filing.`;
  return {
    available: true,
    previous: comparison.previousSummary,
    latest: comparison.latestSummary,
    observation,
  };
}

export function thesisChangeAlert(idea: Idea): {
  headline: string;
  detail: string;
  cited: DocumentRecord[];
} {
  const previous = idea.thesisHistory[0];
  const cited = idea.documents.slice(0, 3);
  if (!previous) {
    return {
      headline: "No earlier thesis snapshot is stored.",
      detail:
        "A future assistant would diff the current thesis against the previous local snapshot. This company has no snapshot yet.",
      cited,
    };
  }
  const statusChanged = previous.thesis.status !== idea.thesis.status;
  return {
    headline: idea.thesis.changeSummary || "Thesis fields were edited.",
    detail: statusChanged
      ? `Status moved from ${previous.thesis.status.replaceAll("_", " ")} to ${idea.thesis.status.replaceAll("_", " ")}. Prior note: ${previous.summary}`
      : `Prior note: ${previous.summary}. Status remains ${idea.thesis.status.replaceAll("_", " ")}.`,
    cited,
  };
}

export function researchSummary(idea: Idea, analystName: string): string {
  const margin = idea.valuation.baseFairValue
    ? (idea.valuation.baseFairValue - idea.valuation.currentPrice) /
      idea.valuation.baseFairValue
    : null;
  const marginText =
    margin === null
      ? "Margin of safety is not calculable."
      : `Illustrative margin of safety versus the base case is ${(margin * 100).toFixed(1)}%.`;
  const open = idea.questions.filter((question) => question.status !== "completed");
  return [
    `${idea.companyName} (${idea.ticker}) is in ${idea.stage.replaceAll("_", " ")}. Lead analyst: ${analystName}.`,
    idea.thesis.businessOverview,
    `Why it is on the research list: ${idea.researchReason}`,
    `Mispricing note: ${idea.thesis.whyMispriced}`,
    marginText,
    `Base case: ${idea.thesis.baseCase}`,
    `Main risks: ${idea.thesis.mainRisks}`,
    open.length
      ? `Unresolved questions: ${open.map((question) => question.question).join(" ")}`
      : "No unresolved research questions are stored.",
    "Summary assembled from local workspace fields only.",
  ].join("\n\n");
}

export function suggestedQuestions(idea: Idea): string[] {
  const suggestions: string[] = [];
  const risk = firstSentence(idea.thesis.mainRisks);
  if (risk) {
    suggestions.push(`What evidence would show this risk is worsening: ${risk}`);
  }
  const invalidator = firstSentence(idea.thesis.invalidators);
  if (invalidator) {
    suggestions.push(
      `Which observable indicator would confirm the thesis is invalid: ${invalidator}`,
    );
  }
  if (
    idea.thesis.capitalAllocation &&
    !idea.thesis.capitalAllocation.startsWith("Not yet")
  ) {
    suggestions.push(
      "Has capital allocation stayed inside the policy described in the current thesis since the last substantive review?",
    );
  }
  if (idea.earningsComparison?.contradicts) {
    suggestions.push(
      `Does the latest fictional earnings summary require a change to this assumption: ${idea.earningsComparison.assumptionTouched}?`,
    );
  }
  if (suggestions.length === 0) {
    suggestions.push(
      "What single fact would most change the base-case fair value?",
    );
  }
  return suggestions.slice(0, 4);
}

export function citationPreview(idea: Idea): AssistantCitation[] {
  if (idea.documents.length === 0) {
    return [];
  }
  return idea.documents.map((document) => ({
    documentId: document.id,
    title: document.title,
    sentence: document.associatedClaim
      ? `A future assistant would cite the local record “${document.title}” when discussing: ${document.associatedClaim}`
      : `A future assistant would cite the local record “${document.title}” as illustrative evidence already stored in this workspace.`,
  }));
}
