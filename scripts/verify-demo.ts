import { createSeedState } from "../src/lib/seed";
import {
  attentionItems,
  calendarEntries,
  countByStage,
  dashboardMetrics,
  ideaAwaitsAction,
  ideaMargin,
  marginOfSafety,
  upcomingMeetings,
} from "../src/lib/metrics";
import { ACTIVE_STAGES } from "../src/lib/types";

const state = createSeedState();
const metrics = dashboardMetrics(state);
const counts = countByStage(state.ideas);
const attention = attentionItems(state.ideas);
const questions = state.ideas.reduce((sum, idea) => sum + idea.questions.length, 0);
const watchlist = state.ideas.filter((idea) => idea.stage === "watchlist");
const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(state.ideas.length >= 12, "expected at least 12 companies");
assert(state.team.length === 3, "expected 3 team members");
assert(upcomingMeetings(state.meetings).length >= 2, "expected 2 upcoming meetings");
assert(questions >= 8, `expected at least 8 questions, got ${questions}`);
assert(state.activities.length >= 10, "expected at least 10 activities");
assert(watchlist.length >= 3, "expected several watchlist companies");
assert(
  new Set(watchlist.map((idea) => idea.waitKind)).has("thesis") &&
    new Set(watchlist.map((idea) => idea.waitKind)).has("price"),
  "watchlist should distinguish price waits from a deteriorated thesis",
);

assert(
  metrics.activeIdeas === state.ideas.filter((idea) => idea.stage !== "invested" && idea.stage !== "rejected").length,
  "active idea metric drifted from the dataset",
);
assert(
  metrics.deepResearch === counts.deep_research,
  "deep research metric drifted from stage counts",
);
assert(
  metrics.awaitingAction === state.ideas.filter((idea) => ideaAwaitsAction(idea)).length,
  "awaiting-action metric drifted",
);
assert(metrics.upcomingCommittee === upcomingMeetings(state.meetings).length, "committee metric drifted");
assert(
  ACTIVE_STAGES.reduce((sum, stage) => sum + counts[stage], 0) === metrics.activeIdeas,
  "active stage counts do not sum to active ideas",
);

const vossfjord = state.ideas.find((idea) => idea.id === "vossfjord");
assert(Boolean(vossfjord), "missing Vossfjord sample dossier company");
if (vossfjord) {
  const manual =
    (vossfjord.valuation.baseFairValue - vossfjord.valuation.currentPrice) /
    vossfjord.valuation.baseFairValue;
  assert(
    ideaMargin(vossfjord) === manual &&
      marginOfSafety(vossfjord.valuation.currentPrice, vossfjord.valuation.baseFairValue) === manual,
    "margin of safety formula drifted",
  );
  assert(
    !vossfjord.documents.some((document) => document.type === "valuation_model"),
    "Vossfjord should be missing a valuation model",
  );
}

const kinds = new Set(attention.map((item) => item.kind));
for (const kind of ["stale_thesis", "earnings_contradiction", "near_entry", "missing_document"]) {
  assert(kinds.has(kind as never), `missing attention kind ${kind}`);
}

for (const idea of state.ideas) {
  const { bearFairValue, baseFairValue, bullFairValue } = idea.valuation;
  if (bearFairValue > 0 && baseFairValue > 0 && bullFairValue > 0) {
    assert(
      bearFairValue <= baseFairValue && baseFairValue <= bullFairValue,
      `${idea.companyName} fair values are not ordered bear <= base <= bull`,
    );
  }
  assert(
    state.team.some((member) => member.id === idea.leadAnalystId),
    `${idea.companyName} lead analyst is missing`,
  );
  for (const question of idea.questions) {
    assert(
      state.team.some((member) => member.id === question.ownerId),
      `${idea.companyName} has a question with an unknown owner`,
    );
  }
}

const tickers = new Set<string>();
for (const idea of state.ideas) {
  assert(!tickers.has(idea.ticker), `duplicate ticker ${idea.ticker}`);
  tickers.add(idea.ticker);
}

for (const meeting of state.meetings) {
  for (const item of meeting.agenda) {
    assert(
      state.ideas.some((idea) => idea.id === item.companyId),
      `${meeting.title} references a missing company`,
    );
  }
}

assert(calendarEntries(state).some((entry) => entry.kind === "committee"), "calendar is missing committee events");
assert(state.ideas.every((idea) => idea.documents.every((document) => document.illustrative)), "a document is not marked illustrative");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      companies: state.ideas.length,
      questions,
      activities: state.activities.length,
      metrics,
      attention: attention.map((item) => item.kind),
      stages: counts,
    },
    null,
    2,
  ),
);
