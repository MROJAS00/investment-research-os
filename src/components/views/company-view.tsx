"use client";

import { cn } from "cn";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  EmptyState,
  Field,
  IllustrativeNote,
  NativeSelect,
  PriorityBadge,
  StageBadge,
  Surface,
  ThesisStatusBadge,
} from "@/components/common/ui-bits";
import {
  IdeaFormDialog,
  StageChangeDialog,
  useStageController,
} from "@/components/ideas/dialogs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  citationPreview,
  earningsReadout,
  researchSummary,
  suggestedQuestions,
  thesisChangeAlert,
} from "@/lib/assistant";
import { createId } from "@/lib/dates";
import {
  companyDossierMarkdown,
  copyCurrentUrl,
  downloadText,
} from "@/lib/export";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatPercent,
} from "@/lib/format";
import {
  ACTIVITY_LABELS,
  DOCUMENT_TYPE_LABELS,
  PRIORITY_LABELS,
  QUESTION_STATUS_LABELS,
  THESIS_STATUS_LABELS,
  stageOptions,
} from "@/lib/labels";
import {
  ideaMargin,
  isQuestionOverdue,
  marginOfSafety,
  memberById,
} from "@/lib/metrics";
import { useWorkspace } from "@/lib/store";
import {
  DOCUMENT_TYPES,
  PRIORITIES,
  QUESTION_STATUSES,
  STAGES,
  THESIS_STATUSES,
  type DocumentRecord,
  type DocumentType,
  type Priority,
  type QuestionStatus,
  type ResearchQuestion,
  type Stage,
  type Thesis,
  type ThesisStatus,
  type Valuation,
} from "@/lib/types";

const TABS = [
  "thesis",
  "valuation",
  "questions",
  "documents",
  "history",
] as const;
type CompanyTab = (typeof TABS)[number];

const THESIS_FIELDS: { key: keyof Thesis; label: string }[] = [
  { key: "businessOverview", label: "Business overview" },
  { key: "whyMispriced", label: "Why it may be mispriced" },
  { key: "competitiveAdvantages", label: "Competitive advantages" },
  { key: "growthDrivers", label: "Long-term growth drivers" },
  { key: "capitalAllocation", label: "Capital allocation" },
  { key: "managementQuality", label: "Management quality" },
  { key: "mainRisks", label: "Main risks" },
  { key: "invalidators", label: "What would invalidate the thesis" },
];

export function CompanyView() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { state } = useWorkspace();
  const idea = state.ideas.find((item) => item.id === params.id);
  const tabParam = search.get("tab");
  const tab: CompanyTab = TABS.includes(tabParam as CompanyTab)
    ? (tabParam as CompanyTab)
    : "thesis";
  const [editing, setEditing] = useState(false);
  const stageController = useStageController();

  if (!idea) {
    return (
      <EmptyState
        title="Company not in this workspace"
        body="The link does not match a research idea in the current demo data."
        action={
          <Button render={<Link href="/pipeline" />}>
            Back to the pipeline
          </Button>
        }
      />
    );
  }

  const analyst = memberById(state, idea.leadAnalystId);

  function setTab(next: string) {
    const query = new URLSearchParams(search.toString());
    query.set("tab", next);
    router.replace(`/companies/${idea!.id}?${query.toString()}`, {
      scroll: false,
    });
  }

  async function copyLink() {
    const ok = await copyCurrentUrl();
    if (ok) toast.success("Page link copied.");
    else toast.error("The link could not be copied from this browser.");
  }

  function exportDossier() {
    downloadText(
      `longview-${idea!.ticker.toLowerCase()}-dossier.md`,
      companyDossierMarkdown(state, idea!),
      "text/markdown",
    );
    toast.success("Research summary downloaded.");
  }

  return (
    <div>
      <p className="mb-2 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
        <Link href="/pipeline" className="hover:text-foreground">
          Pipeline
        </Link>
        <span className="px-1.5 normal-case tracking-normal">/</span>
        <span className=" normal-case tracking-normal">{idea.companyName}</span>
      </p>
      <div className="flex flex-col gap-3 border-b border-rule pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[1.5rem] leading-tight font-semibold tracking-tight">
            {idea.companyName}{" "}
            <span className="ml-1 font-mono text-sm font-medium tracking-[0.06em] text-muted-foreground uppercase">
              {idea.ticker}
            </span>
          </h1>
          <p className="mt-1 text-[13px] text-foreground/70">
            {idea.country} · {idea.sector}
          </p>
          <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <StageBadge stage={idea.stage} />
            <PriorityBadge priority={idea.priority} />
            <span className="text-[13px] text-muted-foreground">
              {analyst?.name} · Conviction {idea.conviction} · Reviewed{" "}
              {formatDate(idea.thesis.lastSubstantiveReview)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NativeSelect
            ariaLabel="Change stage"
            className="w-52"
            value={idea.stage}
            onChange={(value) =>
              stageController.requestStage(idea, value as Stage)
            }
            options={stageOptions(STAGES)}
          />
          <Button variant="outline" onClick={() => setEditing(true)}>
            Edit details
          </Button>
          <Button variant="outline" onClick={exportDossier}>
            Export summary
          </Button>
          <Button variant="outline" onClick={copyLink}>
            Copy link
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-4">
        <TabsList
          variant="line"
          className="w-full justify-start overflow-x-auto"
        >
          <TabsTrigger value="thesis">Investment Thesis</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="questions">Research Questions</TabsTrigger>
          <TabsTrigger value="documents">Documents & Evidence</TabsTrigger>
          <TabsTrigger value="history">History & Decisions</TabsTrigger>
        </TabsList>
        <TabsContent value="thesis" className="pt-4">
          <ThesisTab />
        </TabsContent>
        <TabsContent value="valuation" className="pt-4">
          <ValuationTab />
        </TabsContent>
        <TabsContent value="questions" className="pt-4">
          <QuestionsTab />
        </TabsContent>
        <TabsContent value="documents" className="pt-4">
          <DocumentsTab />
        </TabsContent>
        <TabsContent value="history" className="pt-4">
          <HistoryTab />
        </TabsContent>
      </Tabs>

      <IdeaFormDialog open={editing} editing={idea} onOpenChange={setEditing} />
      <StageChangeDialog
        idea={stageController.pending?.idea ?? null}
        stage={stageController.pending?.stage ?? null}
        onClose={stageController.close}
      />
    </div>
  );
}

function useCompany() {
  const params = useParams<{ id: string }>();
  const workspace = useWorkspace();
  const idea = workspace.state.ideas.find((item) => item.id === params.id);
  if (!idea) throw new Error("Company missing");
  return { ...workspace, idea };
}

function ThesisTab() {
  const { state, idea, saveThesis, addSuggestedQuestions } = useCompany();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Thesis>(idea.thesis);
  const [error, setError] = useState("");
  const analyst = memberById(state, idea.leadAnalystId);
  const earnings = earningsReadout(idea);
  const alert = thesisChangeAlert(idea);
  const suggestions = suggestedQuestions(idea);
  const citations = citationPreview(idea);

  useEffect(() => {
    if (!editing) setDraft(idea.thesis);
  }, [idea.thesis, editing]);

  function save() {
    const required: (keyof Thesis)[] = [
      "businessOverview",
      "whyMispriced",
      "mainRisks",
      "invalidators",
    ];
    if (required.some((key) => String(draft[key]).trim().length < 10)) {
      setError(
        "Overview, mispricing, risks, and invalidators each need at least 10 characters.",
      );
      return;
    }
    if (!draft.changeSummary.trim()) {
      setError("Add a short note describing what changed.");
      return;
    }
    setError("");
    saveThesis(idea.id, draft);
    setEditing(false);
    toast.success("Thesis saved. The previous version is kept in history.");
  }

  function addSuggestions() {
    const count = addSuggestedQuestions(idea.id, suggestions);
    if (count > 0)
      toast.success(
        `${count} follow-up question${count === 1 ? "" : "s"} added.`,
      );
    else toast.message("Those questions are already on the list.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)]">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ThesisStatusBadge status={idea.thesis.status} />
          <span className="text-xs text-muted-foreground">
            Last substantive review{" "}
            {formatDate(idea.thesis.lastSubstantiveReview)}
          </span>
          <div className="ml-auto flex gap-2">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={save}>
                  Save thesis
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
              >
                Edit thesis
              </Button>
            )}
          </div>
        </div>
        {error ? (
          <p className="mb-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {editing ? (
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Thesis status" htmlFor="thesis-status">
                <NativeSelect
                  id="thesis-status"
                  value={draft.status}
                  onChange={(value) =>
                    setDraft({ ...draft, status: value as ThesisStatus })
                  }
                  options={THESIS_STATUSES.map((status) => ({
                    value: status,
                    label: THESIS_STATUS_LABELS[status],
                  }))}
                />
              </Field>
              <Field label="Last substantive review" htmlFor="thesis-review">
                <Input
                  id="thesis-review"
                  type="date"
                  value={draft.lastSubstantiveReview}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      lastSubstantiveReview: event.target.value,
                    })
                  }
                />
              </Field>
            </div>
            <Field label="What changed" htmlFor="thesis-change">
              <Input
                id="thesis-change"
                value={draft.changeSummary}
                onChange={(event) =>
                  setDraft({ ...draft, changeSummary: event.target.value })
                }
              />
            </Field>
            {THESIS_FIELDS.map((field) => (
              <Field
                key={field.key}
                label={field.label}
                htmlFor={`thesis-${field.key}`}
              >
                <Textarea
                  id={`thesis-${field.key}`}
                  className="min-h-20"
                  value={String(draft[field.key])}
                  onChange={(event) =>
                    setDraft({ ...draft, [field.key]: event.target.value })
                  }
                />
              </Field>
            ))}
            <div className="grid gap-3 lg:grid-cols-3">
              {(["bullCase", "baseCase", "bearCase"] as const).map((key) => (
                <Field
                  key={key}
                  label={
                    key === "bullCase"
                      ? "Bull case"
                      : key === "baseCase"
                        ? "Base case"
                        : "Bear case"
                  }
                  htmlFor={`thesis-${key}`}
                >
                  <Textarea
                    id={`thesis-${key}`}
                    className="min-h-28"
                    value={draft[key]}
                    onChange={(event) =>
                      setDraft({ ...draft, [key]: event.target.value })
                    }
                  />
                </Field>
              ))}
            </div>
          </div>
        ) : (
          <Surface className="px-4">
            {THESIS_FIELDS.map((field) => (
              <section
                key={field.key}
                className="border-b border-border/80 py-3 last:border-0"
              >
                <h2 className="font-mono text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                  {field.label}
                </h2>
                <p className="mt-1 text-[13px] leading-6">
                  {idea.thesis[field.key]}
                </p>
              </section>
            ))}
            <div className="grid gap-4 border-t border-rule py-3 md:grid-cols-3">
              {(
                [
                  ["Bull case", idea.thesis.bullCase],
                  ["Base case", idea.thesis.baseCase],
                  ["Bear case", idea.thesis.bearCase],
                ] as const
              ).map(([label, text]) => (
                <section
                  key={label}
                  className="md:border-l md:border-border/80 md:pl-3 md:first:border-0 md:first:pl-0"
                >
                  <h2 className="font-mono text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                    {label}
                  </h2>
                  <p className="mt-1 text-[13px] leading-6">{text}</p>
                </section>
              ))}
            </div>
          </Surface>
        )}
      </div>
      <aside className="space-y-3">
        <Surface className="p-4">
          <p className="font-mono text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Simulated assistant
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Deterministic notes from data already in this workspace. Not a live
            model, not a price feed, and not a verification of the thesis.
          </p>
          <h3 className="mt-3 text-sm font-medium">Earnings comparison</h3>
          {earnings.available ? (
            <div className="mt-1 space-y-2 text-sm leading-5">
              <p>
                <span className="text-muted-foreground">Previous. </span>
                {earnings.previous}
              </p>
              <p>
                <span className="text-muted-foreground">Latest. </span>
                {earnings.latest}
              </p>
            </div>
          ) : null}
          <p className="mt-2 text-sm leading-5">{earnings.observation}</p>
          <h3 className="mt-4 text-sm font-medium">Thesis-change alert</h3>
          <p className="mt-1 text-sm leading-5">{alert.headline}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {alert.detail}
          </p>
          <h3 className="mt-4 text-sm font-medium">Research summary</h3>
          <p className="mt-1 text-sm leading-5 whitespace-pre-wrap">
            {researchSummary(idea, analyst?.name ?? "Unassigned")}
          </p>
          <h3 className="mt-4 text-sm font-medium">Suggested follow-ups</h3>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-5">
            {suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Button
            className="mt-3"
            size="sm"
            variant="outline"
            onClick={addSuggestions}
          >
            Add as open questions
          </Button>
          <h3 className="mt-4 text-sm font-medium">How citations would work</h3>
          {citations.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              No local document records to cite.
            </p>
          ) : (
            <ul className="mt-1 space-y-2">
              {citations.map((citation) => (
                <li
                  key={citation.documentId}
                  className="text-xs leading-5 text-muted-foreground"
                >
                  {citation.sentence}
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </aside>
    </div>
  );
}

function ValuationTab() {
  const { state, idea, saveValuation } = useCompany();
  const [draft, setDraft] = useState<Valuation>(idea.valuation);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(idea.valuation);
  }, [idea.valuation]);

  const margin = marginOfSafety(draft.currentPrice, draft.baseFairValue);
  const savedMargin = ideaMargin(idea);
  const dirty = JSON.stringify(draft) !== JSON.stringify(idea.valuation);
  const meets =
    margin !== null &&
    margin >= draft.minMarginOfSafety &&
    draft.minMarginOfSafety > 0;

  function setNumber(key: keyof Valuation, value: string) {
    setDraft((current) => ({ ...current, [key]: Number(value) }));
  }

  function save() {
    const fields: (keyof Valuation)[] = [
      "currentPrice",
      "bearFairValue",
      "baseFairValue",
      "bullFairValue",
      "targetEntry",
      "minMarginOfSafety",
    ];
    if (
      fields.some(
        (key) =>
          !Number.isFinite(draft[key] as number) || (draft[key] as number) < 0,
      )
    ) {
      setError("Every figure must be a number of zero or more.");
      return;
    }
    if (draft.baseFairValue > 0 && draft.bearFairValue > draft.baseFairValue) {
      setError("Bear fair value should not sit above the base case.");
      return;
    }
    if (
      draft.baseFairValue > 0 &&
      draft.bullFairValue > 0 &&
      draft.bullFairValue < draft.baseFairValue
    ) {
      setError("Bull fair value should not sit below the base case.");
      return;
    }
    setError("");
    saveValuation(idea.id, draft);
    toast.success("Illustrative valuation saved.");
  }

  const currency = state.settings.currency;
  const fields: { key: keyof Valuation; label: string; step: string }[] = [
    { key: "currentPrice", label: "Current illustrative price", step: "0.01" },
    { key: "bearFairValue", label: "Bear fair value", step: "0.01" },
    { key: "baseFairValue", label: "Base fair value", step: "0.01" },
    { key: "bullFairValue", label: "Bull fair value", step: "0.01" },
    { key: "targetEntry", label: "Target entry", step: "0.01" },
    {
      key: "minMarginOfSafety",
      label: "Minimum margin of safety (decimal)",
      step: "0.01",
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <Surface className="p-4">
        <h2 className="font-mono text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          Illustrative assumptions
        </h2>
        <IllustrativeNote>
          Source figures are EUR
          {currency === "EUR"
            ? ". "
            : ` and the amounts below are shown in ${currency} using a fixed demo rate. `}
          Editing here does not fetch a market price. This is not a
          recommendation.
        </IllustrativeNote>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              htmlFor={`val-${field.key}`}
            >
              <Input
                id={`val-${field.key}`}
                type="number"
                min={0}
                step={field.step}
                value={draft[field.key] as number}
                onChange={(event) => setNumber(field.key, event.target.value)}
              />
              {field.key !== "minMarginOfSafety" ? (
                <p className="text-xs text-muted-foreground">
                  Display: {formatMoney(draft[field.key] as number, currency)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Display: {formatPercent(draft.minMarginOfSafety)}
                </p>
              )}
            </Field>
          ))}
        </div>
        {error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex items-center gap-2">
          <Button onClick={save} disabled={!dirty}>
            Save valuation
          </Button>
          {dirty ? (
            <span className="text-xs text-muted-foreground">
              Unsaved changes
            </span>
          ) : null}
        </div>
      </Surface>
      <Surface className="p-4">
        <h2 className="font-mono text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          Base-case margin of safety
        </h2>
        <p className="mt-3 text-[2rem] font-semibold tabular-nums tracking-tight">
          {formatPercent(margin)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          (Base fair value − price) / base fair value. Saved value is{" "}
          {formatPercent(savedMargin)}.
        </p>
        <p className="mt-3 text-sm">
          {draft.baseFairValue <= 0
            ? "Enter a base fair value to calculate a margin of safety."
            : meets
              ? "The live margin meets the minimum desired margin of safety."
              : "The live margin is below the minimum desired margin of safety."}
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Gap to target entry</dt>
            <dd className="tabular-nums">
              {formatMoney(draft.currentPrice - draft.targetEntry, currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Last saved</dt>
            <dd>{formatDateTime(idea.valuation.updatedAt)}</dd>
          </div>
        </dl>
      </Surface>
    </div>
  );
}

function QuestionsTab() {
  const { state, idea, saveQuestion, deleteQuestion } = useCompany();
  const [editing, setEditing] = useState<ResearchQuestion | null>(null);
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ResearchQuestion | null>(
    null,
  );

  function startCreate() {
    const now = new Date().toISOString();
    setEditing({
      id: createId("q"),
      question: "",
      ownerId: idea.leadAnalystId,
      priority: "medium",
      status: "open",
      dueDate: new Date().toISOString().slice(0, 10),
      notes: "",
      createdAt: now,
      updatedAt: now,
    });
    setOpen(true);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {idea.questions.filter((item) => item.status !== "completed").length}{" "}
          unresolved
        </p>
        <Button size="sm" onClick={startCreate}>
          Add question
        </Button>
      </div>
      {idea.questions.length === 0 ? (
        <EmptyState
          title="No research questions yet"
          body="Open the questions that would change the thesis or the base-case value."
          action={
            <Button variant="outline" onClick={startCreate}>
              Add question
            </Button>
          }
        />
      ) : (
        <Surface className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  {[
                    "Question",
                    "Owner",
                    "Priority",
                    "Status",
                    "Due",
                    "Notes",
                    "",
                  ].map((heading) => (
                    <th key={heading} className="px-3 py-2 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {idea.questions.map((question) => {
                  const owner = memberById(state, question.ownerId);
                  const overdue = isQuestionOverdue(
                    question.status,
                    question.dueDate,
                  );
                  return (
                    <tr
                      key={question.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="max-w-sm px-3 py-2 whitespace-normal">
                        {question.question}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {owner?.name}
                      </td>
                      <td className="px-3 py-2">
                        {PRIORITY_LABELS[question.priority]}
                      </td>
                      <td className="px-3 py-2">
                        {QUESTION_STATUS_LABELS[question.status]}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 whitespace-nowrap",
                          overdue && "text-destructive",
                        )}
                      >
                        {formatDate(question.dueDate)}
                        {overdue ? " · Overdue" : ""}
                      </td>
                      <td className="max-w-xs px-3 py-2 whitespace-normal text-muted-foreground">
                        {question.notes}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(question);
                            setOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        {question.status !== "completed" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              saveQuestion(idea.id, {
                                ...question,
                                status: "completed",
                              });
                              toast.success("Question marked complete.");
                            }}
                          >
                            Complete
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPendingDelete(question)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Surface>
      )}
      <QuestionDialog
        open={open}
        question={editing}
        onOpenChange={setOpen}
        onSave={(question) => {
          saveQuestion(idea.id, question);
          setOpen(false);
          toast.success("Research question saved.");
        }}
      />
      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => !next && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription>
              The question is removed from the company file. The deletion is
              written into history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingDelete) {
                  deleteQuestion(idea.id, pendingDelete.id);
                  toast.success("Question deleted.");
                }
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function QuestionDialog({
  open,
  question,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  question: ResearchQuestion | null;
  onOpenChange: (open: boolean) => void;
  onSave: (question: ResearchQuestion) => void;
}) {
  const { state } = useWorkspace();
  const [draft, setDraft] = useState<ResearchQuestion | null>(question);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(question);
    setError("");
  }, [question, open]);

  if (!draft) return null;

  return (
    <div>
      {open ? (
        <QuestionDialogBody
          draft={draft}
          error={error}
          team={state.team}
          onClose={() => onOpenChange(false)}
          onChange={setDraft}
          onSubmit={() => {
            if (draft.question.trim().length < 10) {
              setError("Write the question in at least 10 characters.");
              return;
            }
            if (!draft.dueDate) {
              setError("Choose a due date.");
              return;
            }
            onSave({ ...draft, question: draft.question.trim() });
          }}
        />
      ) : null}
    </div>
  );
}

function QuestionDialogBody({
  draft,
  error,
  team,
  onClose,
  onChange,
  onSubmit,
}: {
  draft: ResearchQuestion;
  error: string;
  team: { id: string; name: string }[];
  onClose: () => void;
  onChange: (question: ResearchQuestion) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="contents">
      <DialogShell
        title="Research question"
        description="Assign an owner, a priority, and a due date. Notes should point at evidence already in the file."
        onClose={onClose}
        onSubmit={onSubmit}
      >
        <Field label="Question" htmlFor="q-text" error={error}>
          <Textarea
            id="q-text"
            className="min-h-20"
            value={draft.question}
            onChange={(event) =>
              onChange({ ...draft, question: event.target.value })
            }
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Owner" htmlFor="q-owner">
            <NativeSelect
              id="q-owner"
              value={draft.ownerId}
              onChange={(value) => onChange({ ...draft, ownerId: value })}
              options={team.map((member) => ({
                value: member.id,
                label: member.name,
              }))}
            />
          </Field>
          <Field label="Priority" htmlFor="q-priority">
            <NativeSelect
              id="q-priority"
              value={draft.priority}
              onChange={(value) =>
                onChange({ ...draft, priority: value as Priority })
              }
              options={PRIORITIES.map((priority) => ({
                value: priority,
                label: PRIORITY_LABELS[priority],
              }))}
            />
          </Field>
          <Field label="Status" htmlFor="q-status">
            <NativeSelect
              id="q-status"
              value={draft.status}
              onChange={(value) =>
                onChange({ ...draft, status: value as QuestionStatus })
              }
              options={QUESTION_STATUSES.map((status) => ({
                value: status,
                label: QUESTION_STATUS_LABELS[status],
              }))}
            />
          </Field>
          <Field label="Due date" htmlFor="q-due">
            <Input
              id="q-due"
              type="date"
              value={draft.dueDate}
              onChange={(event) =>
                onChange({ ...draft, dueDate: event.target.value })
              }
            />
          </Field>
        </div>
        <Field label="Notes and evidence" htmlFor="q-notes">
          <Textarea
            id="q-notes"
            value={draft.notes}
            onChange={(event) =>
              onChange({ ...draft, notes: event.target.value })
            }
          />
        </Field>
      </DialogShell>
    </div>
  );
}

function DialogShell({
  title,
  description,
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  const [mounted] = useState(true);
  if (!mounted) return null;
  return (
    <QuestionModal
      title={title}
      description={description}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      {children}
    </QuestionModal>
  );
}

function QuestionModal({
  title,
  description,
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  return (
    <ModalFrame
      title={title}
      description={description}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      {children}
    </ModalFrame>
  );
}

function ModalFrame({
  title,
  description,
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
          {children}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DocumentsTab() {
  const { state, idea, addDocument, deleteDocument } = useCompany();
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DocumentRecord | null>(
    null,
  );
  const [draft, setDraft] = useState({
    title: "",
    type: "internal_note" as DocumentType,
    publicationDate: new Date().toISOString().slice(0, 10),
    sourceUrl: "",
    analystNotes: "",
    associatedClaim: "",
  });
  const [error, setError] = useState("");

  function save() {
    if (draft.title.trim().length < 3) {
      setError("A title is required.");
      return;
    }
    if (!draft.publicationDate) {
      setError("A publication date is required.");
      return;
    }
    const actor = state.settings.actingUserId;
    addDocument(idea.id, {
      id: createId("doc"),
      title: draft.title.trim(),
      type: draft.type,
      publicationDate: draft.publicationDate,
      sourceUrl: draft.sourceUrl.trim() || undefined,
      analystNotes: draft.analystNotes.trim(),
      associatedClaim: draft.associatedClaim.trim() || undefined,
      illustrative: true,
      addedBy: actor,
      addedAt: new Date().toISOString(),
    });
    setOpen(false);
    setDraft({
      title: "",
      type: "internal_note",
      publicationDate: new Date().toISOString().slice(0, 10),
      sourceUrl: "",
      analystNotes: "",
      associatedClaim: "",
    });
    setError("");
    toast.success("Illustrative record added.");
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <IllustrativeNote>
          Records added here are manual and fictional unless you are looking at
          seeded demo notes. A URL does not mean the document was retrieved or
          checked.
        </IllustrativeNote>
        <Button size="sm" onClick={() => setOpen(true)}>
          Add record
        </Button>
      </div>
      {idea.documents.length === 0 ? (
        <EmptyState
          title="No evidence records"
          body="Add a note, model, or link that the team should read with the thesis."
        />
      ) : (
        <div className="space-y-2">
          {idea.documents.map((document) => {
            const author = memberById(state, document.addedBy);
            return (
              <Surface key={document.id} className="p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium">{document.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {DOCUMENT_TYPE_LABELS[document.type]} ·{" "}
                      {formatDate(document.publicationDate)} · Illustrative
                      record · {author?.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingDelete(document)}
                  >
                    Delete
                  </Button>
                </div>
                {document.analystNotes ? (
                  <p className="mt-2 text-sm leading-5">
                    {document.analystNotes}
                  </p>
                ) : null}
                {document.associatedClaim ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Associated claim: {document.associatedClaim}
                  </p>
                ) : null}
                {document.sourceUrl ? (
                  <a
                    href={document.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-primary underline-offset-2 hover:underline"
                  >
                    {document.sourceUrl}
                  </a>
                ) : null}
              </Surface>
            );
          })}
        </div>
      )}
      {open ? (
        <ModalFrame
          title="Add an illustrative record"
          description="This stores a manual research record in the browser. It does not fetch or verify an external document."
          onClose={() => setOpen(false)}
          onSubmit={save}
        >
          <Field label="Title" htmlFor="doc-title" error={error}>
            <Input
              id="doc-title"
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Type" htmlFor="doc-type">
              <NativeSelect
                id="doc-type"
                value={draft.type}
                onChange={(value) =>
                  setDraft({ ...draft, type: value as DocumentType })
                }
                options={DOCUMENT_TYPES.map((type) => ({
                  value: type,
                  label: DOCUMENT_TYPE_LABELS[type],
                }))}
              />
            </Field>
            <Field label="Publication date" htmlFor="doc-date">
              <Input
                id="doc-date"
                type="date"
                value={draft.publicationDate}
                onChange={(event) =>
                  setDraft({ ...draft, publicationDate: event.target.value })
                }
              />
            </Field>
          </div>
          <Field
            label="Source URL"
            htmlFor="doc-url"
            hint="Optional. Leave blank if there is no link."
          >
            <Input
              id="doc-url"
              value={draft.sourceUrl}
              onChange={(event) =>
                setDraft({ ...draft, sourceUrl: event.target.value })
              }
            />
          </Field>
          <Field label="Analyst notes" htmlFor="doc-notes">
            <Textarea
              id="doc-notes"
              value={draft.analystNotes}
              onChange={(event) =>
                setDraft({ ...draft, analystNotes: event.target.value })
              }
            />
          </Field>
          <Field label="Associated claim or question" htmlFor="doc-claim">
            <Input
              id="doc-claim"
              value={draft.associatedClaim}
              onChange={(event) =>
                setDraft({ ...draft, associatedClaim: event.target.value })
              }
            />
          </Field>
        </ModalFrame>
      ) : null}
      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => !next && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              The illustrative record is removed from the company file and the
              deletion is logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingDelete) {
                  deleteDocument(idea.id, pendingDelete.id);
                  toast.success("Record deleted.");
                }
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function HistoryTab() {
  const { state, idea, addComment } = useCompany();
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const activities = useMemo(
    () =>
      state.activities
        .filter((activity) => activity.companyId === idea.id)
        .sort((a, b) => b.at.localeCompare(a.at)),
    [state.activities, idea.id],
  );

  function submit() {
    if (comment.trim().length < 5) {
      setError("Write a comment of at least 5 characters.");
      return;
    }
    addComment(idea.id, comment);
    setComment("");
    setError("");
    toast.success("Comment added to the history.");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <Surface className="p-4">
        <ol className="space-y-4">
          {activities.length === 0 ? (
            <li className="text-sm text-muted-foreground">No history yet.</li>
          ) : (
            activities.map((activity) => {
              const actor = memberById(state, activity.actorId);
              return (
                <li
                  key={activity.id}
                  className="border-b border-border pb-3 last:border-0"
                >
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(activity.at)} ·{" "}
                    {ACTIVITY_LABELS[activity.kind]} · {actor?.name}
                  </p>
                  <p className="mt-1 text-sm leading-5">
                    {activity.description}
                  </p>
                </li>
              );
            })
          )}
        </ol>
        {idea.thesisHistory.length > 0 ? (
          <div className="mt-4 border-t border-border pt-3">
            <h2 className="text-sm font-semibold">Previous thesis snapshots</h2>
            <div className="mt-2 space-y-2">
              {idea.thesisHistory.map((snapshot) => {
                const author = memberById(state, snapshot.savedBy);
                return (
                  <details
                    key={snapshot.id}
                    className="rounded-md border border-border px-3 py-2"
                  >
                    <summary className="cursor-pointer text-sm">
                      {formatDateTime(snapshot.savedAt)} · {author?.name} ·{" "}
                      {snapshot.summary}
                    </summary>
                    <p className="mt-2 text-sm leading-5 text-muted-foreground">
                      {snapshot.thesis.baseCase}
                    </p>
                  </details>
                );
              })}
            </div>
          </div>
        ) : null}
      </Surface>
      <Surface className="h-fit p-4">
        <h2 className="text-sm font-semibold">Analyst comment</h2>
        <Field label="Comment" htmlFor="history-comment" error={error}>
          <Textarea
            id="history-comment"
            className="mt-2 min-h-24"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </Field>
        <Button className="mt-3" size="sm" onClick={submit}>
          Add comment
        </Button>
      </Surface>
    </div>
  );
}
