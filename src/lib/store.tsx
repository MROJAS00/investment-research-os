"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createId, shiftDay, todayDay } from "@/lib/dates";
import { DECISION_LABELS, STAGE_LABELS } from "@/lib/labels";
import { createSeedState } from "@/lib/seed";
import type {
  Activity,
  AppState,
  DecisionType,
  DocumentRecord,
  Idea,
  IdeaDraft,
  ResearchQuestion,
  Settings,
  Stage,
  Thesis,
  Valuation,
  WaitKind,
} from "@/lib/types";

export const STORAGE_KEY = "longview.demo.v1";

function withActivity(state: AppState, activity: Activity): AppState {
  return { ...state, activities: [activity, ...state.activities] };
}

function updateIdea(
  state: AppState,
  id: string,
  updater: (idea: Idea) => Idea,
): AppState {
  return {
    ...state,
    ideas: state.ideas.map((idea) => (idea.id === id ? updater(idea) : idea)),
  };
}

function touch(idea: Idea, partial: Partial<Idea>): Idea {
  return { ...idea, ...partial, lastUpdated: new Date().toISOString() };
}

function blankThesis(rationale: string): Thesis {
  const now = new Date().toISOString();
  return {
    businessOverview: "Not yet documented.",
    whyMispriced: rationale,
    competitiveAdvantages: "Not yet documented.",
    growthDrivers: "Not yet documented.",
    capitalAllocation: "Not yet documented.",
    managementQuality: "Not yet documented.",
    mainRisks: "Not yet documented.",
    invalidators: "Not yet documented.",
    bullCase: "Not yet documented.",
    baseCase: "Not yet documented.",
    bearCase: "Not yet documented.",
    status: "draft",
    lastSubstantiveReview: todayDay(),
    lastEditedAt: now,
    changeSummary: "Idea opened.",
  };
}

export interface StageChangeInput {
  stage: Stage;
  rejectionReason?: string;
  waitKind?: WaitKind;
  waitReason?: string;
  nextReviewTrigger?: string;
}

interface StoreValue {
  ready: boolean;
  loadNote: string | null;
  state: AppState | null;
  reset: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  createIdea: (draft: IdeaDraft) => string;
  updateIdeaDetails: (id: string, draft: IdeaDraft) => void;
  changeStage: (id: string, input: StageChangeInput) => void;
  saveThesis: (id: string, thesis: Thesis) => void;
  saveValuation: (id: string, valuation: Valuation) => void;
  saveQuestion: (companyId: string, question: ResearchQuestion) => void;
  deleteQuestion: (companyId: string, questionId: string) => void;
  addDocument: (companyId: string, document: DocumentRecord) => void;
  deleteDocument: (companyId: string, documentId: string) => void;
  addComment: (companyId: string, text: string) => void;
  createMeeting: (input: {
    title: string;
    scheduledAt: string;
    location: string;
    notes: string;
  }) => string;
  addAgendaCompany: (
    meetingId: string,
    companyId: string,
    presenterId: string,
  ) => void;
  recordDecision: (
    meetingId: string,
    agendaId: string,
    input: { type: DecisionType; rationale: string; waitKind?: WaitKind },
  ) => void;
  reassignIdea: (ideaId: string, analystId: string) => void;
  reassignQuestion: (
    companyId: string,
    questionId: string,
    ownerId: string,
  ) => void;
  updateWatch: (
    ideaId: string,
    input: {
      targetEntry: number;
      waitKind: WaitKind;
      waitReason: string;
      nextReviewTrigger: string;
    },
  ) => void;
  addSuggestedQuestions: (companyId: string, prompts: string[]) => number;
}

const StoreContext = createContext<StoreValue | null>(null);

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as AppState;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.ideas) &&
    Array.isArray(candidate.meetings) &&
    Array.isArray(candidate.team) &&
    Array.isArray(candidate.activities)
  );
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [ready, setReady] = useState(false);
  const [loadNote, setLoadNote] = useState<string | null>(null);
  const stateRef = useRef<AppState | null>(null);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setState(createSeedState());
      } else {
        const parsed: unknown = JSON.parse(raw);
        if (isAppState(parsed)) {
          setState(parsed);
        } else {
          setState(createSeedState());
          setLoadNote(
            "Stored demo data did not match this version and was replaced with the original dataset.",
          );
        }
      }
    } catch {
      setState(createSeedState());
      setLoadNote(
        "Stored demo data could not be read and was replaced with the original dataset.",
      );
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !state) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setLoadNote("Changes could not be saved in this browser.");
    }
  }, [ready, state]);

  const reset = useCallback(() => {
    const next = createSeedState();
    setState(next);
    setLoadNote(null);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setLoadNote("The reset dataset could not be saved in this browser.");
    }
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((current) =>
      current
        ? { ...current, settings: { ...current.settings, ...patch } }
        : current,
    );
  }, []);

  const createIdea = useCallback((draft: IdeaDraft) => {
    const id = createId("idea");
    const now = new Date().toISOString();
    setState((current) => {
      if (!current) return current;
      const idea: Idea = {
        id,
        companyName: draft.companyName.trim(),
        ticker: draft.ticker.trim().toUpperCase(),
        country: draft.country,
        sector: draft.sector,
        stage: draft.stage,
        leadAnalystId: draft.leadAnalystId,
        priority: draft.priority,
        conviction: draft.conviction,
        nextAction: draft.nextAction.trim() || "Write the initial screen.",
        researchReason: draft.researchReason.trim(),
        lastUpdated: now,
        createdAt: now,
        waitKind: draft.stage === "watchlist" ? "catalyst" : undefined,
        waitReason:
          draft.stage === "watchlist"
            ? draft.researchReason.trim()
            : undefined,
        thesis: blankThesis(draft.researchReason.trim()),
        thesisHistory: [],
        valuation: {
          currentPrice: draft.currentPrice,
          bearFairValue: 0,
          baseFairValue: draft.baseFairValue,
          bullFairValue: 0,
          targetEntry: 0,
          minMarginOfSafety: 0.25,
          updatedAt: now,
        },
        questions: [],
        documents: [],
      };
      const activity: Activity = {
        id: createId("act"),
        companyId: id,
        kind: "created",
        at: now,
        actorId: current.settings.actingUserId,
        description: `Opened ${idea.companyName} in ${STAGE_LABELS[idea.stage]}.`,
      };
      return withActivity({ ...current, ideas: [idea, ...current.ideas] }, activity);
    });
    return id;
  }, []);

  const updateIdeaDetails = useCallback((id: string, draft: IdeaDraft) => {
    setState((current) => {
      if (!current) return current;
      const existing = current.ideas.find((idea) => idea.id === id);
      if (!existing) return current;
      const actorId = current.settings.actingUserId;
      const next = updateIdea(current, id, (idea) =>
        touch(idea, {
          companyName: draft.companyName.trim(),
          ticker: draft.ticker.trim().toUpperCase(),
          country: draft.country,
          sector: draft.sector,
          leadAnalystId: draft.leadAnalystId,
          priority: draft.priority,
          conviction: draft.conviction,
          nextAction: draft.nextAction.trim(),
          researchReason: draft.researchReason.trim(),
        }),
      );
      return withActivity(next, {
        id: createId("act"),
        companyId: id,
        kind: "comment",
        at: new Date().toISOString(),
        actorId,
        description: `Updated research details for ${existing.companyName}.`,
      });
    });
  }, []);

  const changeStage = useCallback((id: string, input: StageChangeInput) => {
    setState((current) => {
      if (!current) return current;
      const existing = current.ideas.find((idea) => idea.id === id);
      if (!existing || existing.stage === input.stage) return current;
      const actorId = current.settings.actingUserId;
      const next = updateIdea(current, id, (idea) =>
        touch(idea, {
          stage: input.stage,
          rejectionReason:
            input.stage === "rejected"
              ? input.rejectionReason?.trim()
              : idea.rejectionReason,
          waitKind:
            input.stage === "watchlist" ? input.waitKind ?? idea.waitKind : idea.waitKind,
          waitReason:
            input.stage === "watchlist"
              ? input.waitReason?.trim()
              : idea.waitReason,
          nextReviewTrigger:
            input.stage === "watchlist"
              ? input.nextReviewTrigger?.trim() || idea.nextReviewTrigger
              : idea.nextReviewTrigger,
        }),
      );
      const description =
        input.stage === "rejected"
          ? `Rejected ${existing.companyName}. ${input.rejectionReason?.trim()}`
          : input.stage === "invested"
            ? `Recorded ${existing.companyName} as an invested research outcome. No position is tracked.`
            : `Moved ${existing.companyName} from ${STAGE_LABELS[existing.stage]} to ${STAGE_LABELS[input.stage]}.`;
      return withActivity(next, {
        id: createId("act"),
        companyId: id,
        kind: input.stage === "watchlist" ? "watchlist" : "stage_change",
        at: new Date().toISOString(),
        actorId,
        description,
      });
    });
  }, []);

  const saveThesis = useCallback((id: string, thesis: Thesis) => {
    setState((current) => {
      if (!current) return current;
      const existing = current.ideas.find((idea) => idea.id === id);
      if (!existing) return current;
      const actorId = current.settings.actingUserId;
      const now = new Date().toISOString();
      const saved: Thesis = { ...thesis, lastEditedAt: now };
      const next = updateIdea(current, id, (idea) =>
        touch(idea, {
          thesis: saved,
          thesisHistory: [
            {
              id: createId("snap"),
              savedAt: now,
              savedBy: actorId,
              summary: idea.thesis.changeSummary,
              thesis: idea.thesis,
            },
            ...idea.thesisHistory,
          ].slice(0, 12),
        }),
      );
      return withActivity(next, {
        id: createId("act"),
        companyId: id,
        kind: "thesis_edit",
        at: now,
        actorId,
        description: saved.changeSummary || `Updated the thesis for ${existing.companyName}.`,
      });
    });
  }, []);

  const saveValuation = useCallback((id: string, valuation: Valuation) => {
    setState((current) => {
      if (!current) return current;
      const existing = current.ideas.find((idea) => idea.id === id);
      if (!existing) return current;
      const actorId = current.settings.actingUserId;
      const now = new Date().toISOString();
      const previous = existing.valuation;
      const changes: string[] = [];
      if (previous.currentPrice !== valuation.currentPrice) {
        changes.push(`price €${valuation.currentPrice.toFixed(2)}`);
      }
      if (previous.baseFairValue !== valuation.baseFairValue) {
        changes.push(`base fair value €${valuation.baseFairValue.toFixed(2)}`);
      }
      if (previous.targetEntry !== valuation.targetEntry) {
        changes.push(`target entry €${valuation.targetEntry.toFixed(2)}`);
      }
      if (previous.bearFairValue !== valuation.bearFairValue) changes.push("bear case");
      if (previous.bullFairValue !== valuation.bullFairValue) changes.push("bull case");
      if (previous.minMarginOfSafety !== valuation.minMarginOfSafety) {
        changes.push("minimum margin of safety");
      }
      const description = changes.length
        ? `Updated illustrative valuation (${changes.join(", ")}).`
        : "Saved illustrative valuation without a numeric change.";
      const next = updateIdea(current, id, (idea) =>
        touch(idea, { valuation: { ...valuation, updatedAt: now } }),
      );
      return withActivity(next, {
        id: createId("act"),
        companyId: id,
        kind: "valuation_change",
        at: now,
        actorId,
        description,
      });
    });
  }, []);

  const saveQuestion = useCallback((companyId: string, question: ResearchQuestion) => {
    setState((current) => {
      if (!current) return current;
      const existing = current.ideas.find((idea) => idea.id === companyId);
      if (!existing) return current;
      const actorId = current.settings.actingUserId;
      const now = new Date().toISOString();
      const isNew = !existing.questions.some((item) => item.id === question.id);
      const next = updateIdea(current, companyId, (idea) =>
        touch(idea, {
          questions: isNew
            ? [{ ...question, createdAt: now, updatedAt: now }, ...idea.questions]
            : idea.questions.map((item) =>
                item.id === question.id ? { ...question, updatedAt: now } : item,
              ),
        }),
      );
      return withActivity(next, {
        id: createId("act"),
        companyId,
        kind: "question_update",
        at: now,
        actorId,
        description: isNew
          ? `Opened a research question: ${question.question}`
          : `Updated a research question: ${question.question}`,
      });
    });
  }, []);

  const deleteQuestion = useCallback((companyId: string, questionId: string) => {
    setState((current) => {
      if (!current) return current;
      const existing = current.ideas.find((idea) => idea.id === companyId);
      const question = existing?.questions.find((item) => item.id === questionId);
      if (!existing || !question) return current;
      const next = updateIdea(current, companyId, (idea) =>
        touch(idea, {
          questions: idea.questions.filter((item) => item.id !== questionId),
        }),
      );
      return withActivity(next, {
        id: createId("act"),
        companyId,
        kind: "question_update",
        at: new Date().toISOString(),
        actorId: current.settings.actingUserId,
        description: `Deleted a research question: ${question.question}`,
      });
    });
  }, []);

  const addDocument = useCallback((companyId: string, doc: DocumentRecord) => {
    setState((current) => {
      if (!current) return current;
      const next = updateIdea(current, companyId, (idea) =>
        touch(idea, { documents: [doc, ...idea.documents] }),
      );
      return withActivity(next, {
        id: createId("act"),
        companyId,
        kind: "document",
        at: doc.addedAt,
        actorId: current.settings.actingUserId,
        description: `Added an illustrative record: ${doc.title}`,
      });
    });
  }, []);

  const deleteDocument = useCallback((companyId: string, documentId: string) => {
    setState((current) => {
      if (!current) return current;
      const existing = current.ideas.find((idea) => idea.id === companyId);
      const doc = existing?.documents.find((item) => item.id === documentId);
      if (!doc) return current;
      const next = updateIdea(current, companyId, (idea) =>
        touch(idea, {
          documents: idea.documents.filter((item) => item.id !== documentId),
        }),
      );
      return withActivity(next, {
        id: createId("act"),
        companyId,
        kind: "document",
        at: new Date().toISOString(),
        actorId: current.settings.actingUserId,
        description: `Removed an illustrative record: ${doc.title}`,
      });
    });
  }, []);

  const addComment = useCallback((companyId: string, text: string) => {
    setState((current) => {
      if (!current) return current;
      const now = new Date().toISOString();
      const next = updateIdea(current, companyId, (idea) => touch(idea, {}));
      return withActivity(next, {
        id: createId("act"),
        companyId,
        kind: "comment",
        at: now,
        actorId: current.settings.actingUserId,
        description: text.trim(),
      });
    });
  }, []);

  const createMeeting = useCallback(
    (input: { title: string; scheduledAt: string; location: string; notes: string }) => {
      const id = createId("ic");
      setState((current) => {
        if (!current) return current;
        return {
          ...current,
          meetings: [
            {
              id,
              title: input.title.trim(),
              scheduledAt: input.scheduledAt,
              status: "scheduled",
              location: input.location.trim() || "Amsterdam office",
              notes: input.notes.trim(),
              agenda: [],
            },
            ...current.meetings,
          ],
        };
      });
      return id;
    },
    [],
  );

  const addAgendaCompany = useCallback(
    (meetingId: string, companyId: string, presenterId: string) => {
      setState((current) => {
        if (!current) return current;
        return {
          ...current,
          meetings: current.meetings.map((meeting) => {
            if (meeting.id !== meetingId) return meeting;
            if (meeting.agenda.some((item) => item.companyId === companyId)) {
              return meeting;
            }
            return {
              ...meeting,
              agenda: [
                ...meeting.agenda,
                { id: createId("agenda"), companyId, presenterId },
              ],
            };
          }),
        };
      });
    },
    [],
  );

  const recordDecision = useCallback(
    (
      meetingId: string,
      agendaId: string,
      input: { type: DecisionType; rationale: string; waitKind?: WaitKind },
    ) => {
      setState((current) => {
        if (!current) return current;
        const meeting = current.meetings.find((item) => item.id === meetingId);
        const agenda = meeting?.agenda.find((item) => item.id === agendaId);
        if (!meeting || !agenda || agenda.decision) return current;
        const idea = current.ideas.find((item) => item.id === agenda.companyId);
        if (!idea) return current;
        const actorId = current.settings.actingUserId;
        const now = new Date().toISOString();
        const stageByDecision: Partial<Record<DecisionType, Stage>> = {
          request_research: "deep_research",
          add_watchlist: "watchlist",
          reject: "rejected",
          approve_candidate: "portfolio_candidate",
        };
        const nextStage = stageByDecision[input.type];
        let next = updateIdea(current, idea.id, (item) =>
          touch(item, {
            stage: nextStage ?? item.stage,
            rejectionReason:
              input.type === "reject" ? input.rationale.trim() : item.rejectionReason,
            waitKind:
              input.type === "add_watchlist"
                ? input.waitKind ?? "catalyst"
                : item.waitKind,
            waitReason:
              input.type === "add_watchlist" ? input.rationale.trim() : item.waitReason,
          }),
        );
        next = {
          ...next,
          meetings: next.meetings.map((item) =>
            item.id !== meetingId
              ? item
              : {
                  ...item,
                  agenda: item.agenda.map((entry) =>
                    entry.id !== agendaId
                      ? entry
                      : {
                          ...entry,
                          decision: {
                            type: input.type,
                            rationale: input.rationale.trim(),
                            decidedBy: actorId,
                            decidedAt: now,
                          },
                        },
                  ),
                },
          ),
        };
        return withActivity(next, {
          id: createId("act"),
          companyId: idea.id,
          meetingId,
          kind: "committee_decision",
          at: now,
          actorId,
          description: `${DECISION_LABELS[input.type]} — ${input.rationale.trim()}`,
        });
      });
    },
    [],
  );

  const reassignIdea = useCallback((ideaId: string, analystId: string) => {
    setState((current) => {
      if (!current) return current;
      const idea = current.ideas.find((item) => item.id === ideaId);
      const analyst = current.team.find((member) => member.id === analystId);
      if (!idea || !analyst || idea.leadAnalystId === analystId) return current;
      const next = updateIdea(current, ideaId, (item) =>
        touch(item, { leadAnalystId: analystId }),
      );
      return withActivity(next, {
        id: createId("act"),
        companyId: ideaId,
        kind: "reassignment",
        at: new Date().toISOString(),
        actorId: current.settings.actingUserId,
        description: `Reassigned ${idea.companyName} to ${analyst.name}.`,
      });
    });
  }, []);

  const reassignQuestion = useCallback(
    (companyId: string, questionId: string, ownerId: string) => {
      setState((current) => {
        if (!current) return current;
        const idea = current.ideas.find((item) => item.id === companyId);
        const question = idea?.questions.find((item) => item.id === questionId);
        const owner = current.team.find((member) => member.id === ownerId);
        if (!idea || !question || !owner || question.ownerId === ownerId) return current;
        const next = updateIdea(current, companyId, (item) =>
          touch(item, {
            questions: item.questions.map((entry) =>
              entry.id === questionId
                ? { ...entry, ownerId, updatedAt: new Date().toISOString() }
                : entry,
            ),
          }),
        );
        return withActivity(next, {
          id: createId("act"),
          companyId,
          kind: "reassignment",
          at: new Date().toISOString(),
          actorId: current.settings.actingUserId,
          description: `Reassigned a question on ${idea.companyName} to ${owner.name}.`,
        });
      });
    },
    [],
  );

  const updateWatch = useCallback(
    (
      ideaId: string,
      input: {
        targetEntry: number;
        waitKind: WaitKind;
        waitReason: string;
        nextReviewTrigger: string;
      },
    ) => {
      setState((current) => {
        if (!current) return current;
        const idea = current.ideas.find((item) => item.id === ideaId);
        if (!idea) return current;
        const next = updateIdea(current, ideaId, (item) =>
          touch(item, {
            waitKind: input.waitKind,
            waitReason: input.waitReason.trim(),
            nextReviewTrigger: input.nextReviewTrigger.trim(),
            valuation: {
              ...item.valuation,
              targetEntry: input.targetEntry,
              updatedAt: new Date().toISOString(),
            },
          }),
        );
        return withActivity(next, {
          id: createId("act"),
          companyId: ideaId,
          kind: "watchlist",
          at: new Date().toISOString(),
          actorId: current.settings.actingUserId,
          description: `Updated why ${idea.companyName} is waiting.`,
        });
      });
    },
    [],
  );

  const addSuggestedQuestions = useCallback((companyId: string, prompts: string[]) => {
    const current = stateRef.current;
    if (!current) return 0;
    const idea = current.ideas.find((item) => item.id === companyId);
    if (!idea) return 0;
    const existing = new Set(
      idea.questions.map((item) => item.question.trim().toLowerCase()),
    );
    const now = new Date().toISOString();
    const fresh: ResearchQuestion[] = [];
    for (const prompt of prompts) {
      const text = prompt.trim();
      if (!text || existing.has(text.toLowerCase())) continue;
      existing.add(text.toLowerCase());
      fresh.push({
        id: createId("q"),
        question: text,
        ownerId: idea.leadAnalystId,
        priority: "medium",
        status: "open",
        dueDate: shiftDay(14),
        notes: "Added from the simulated assistant using fields already in this thesis.",
        createdAt: now,
        updatedAt: now,
      });
    }
    if (fresh.length === 0) return 0;
    setState((latest) => {
      if (!latest) return latest;
      const next = updateIdea(latest, companyId, (item) =>
        touch(item, { questions: [...fresh, ...item.questions] }),
      );
      return withActivity(next, {
        id: createId("act"),
        companyId,
        kind: "question_update",
        at: now,
        actorId: latest.settings.actingUserId,
        description: `Added ${fresh.length} follow-up question${fresh.length === 1 ? "" : "s"} suggested from the local thesis.`,
      });
    });
    return fresh.length;
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      loadNote,
      state,
      reset,
      updateSettings,
      createIdea,
      updateIdeaDetails,
      changeStage,
      saveThesis,
      saveValuation,
      saveQuestion,
      deleteQuestion,
      addDocument,
      deleteDocument,
      addComment,
      createMeeting,
      addAgendaCompany,
      recordDecision,
      reassignIdea,
      reassignQuestion,
      updateWatch,
      addSuggestedQuestions,
    }),
    [
      ready,
      loadNote,
      state,
      reset,
      updateSettings,
      createIdea,
      updateIdeaDetails,
      changeStage,
      saveThesis,
      saveValuation,
      saveQuestion,
      deleteQuestion,
      addDocument,
      deleteDocument,
      addComment,
      createMeeting,
      addAgendaCompany,
      recordDecision,
      reassignIdea,
      reassignQuestion,
      updateWatch,
      addSuggestedQuestions,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}

export function useWorkspace() {
  const value = useStore();
  if (!value.state) {
    throw new Error("Workspace data is not ready");
  }
  return { ...value, state: value.state };
}
