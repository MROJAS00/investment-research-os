"use client";

import { cn } from "cn";
import { GripVertical, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ConvictionBadge,
  EmptyState,
  IllustrativeNote,
  NativeSelect,
  PageHeader,
  PriorityBadge,
  Surface,
} from "@/components/common/ui-bits";
import {
  IdeaFormDialog,
  StageChangeDialog,
  useStageController,
} from "@/components/ideas/dialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatMoney, formatPercent } from "@/lib/format";
import { PRIORITY_LABELS, STAGE_LABELS, stageOptions } from "@/lib/labels";
import {
  ideaAwaitsAction,
  ideaMargin,
  memberById,
  PIPELINE_STAGE_ORDER,
  priorityRank,
  unresolvedQuestions,
} from "@/lib/metrics";
import { useWorkspace } from "@/lib/store";
import {
  ACTIVE_STAGES,
  STAGES,
  type Idea,
  type Priority,
  type Stage,
} from "@/lib/types";

type SortKey = "updated" | "priority" | "margin";

export function PipelineView() {
  const { state } = useWorkspace();
  const params = useSearchParams();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Idea | null>(null);
  const stageController = useStageController();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const view =
    params.get("view") === "table" || params.get("view") === "kanban"
      ? params.get("view")!
      : state.settings.defaultPipelineView;
  const stageFilter = params.get("stage") ?? "active";
  const analyst = params.get("analyst") ?? "all";
  const sector = params.get("sector") ?? "all";
  const country = params.get("country") ?? "all";
  const priority = params.get("priority") ?? "all";
  const [query, setQuery] = useState(params.get("q") ?? "");
  const sort = (params.get("sort") as SortKey) || "updated";
  const overdueOnly = params.get("overdue") === "1";

  function replace(next: Record<string, string | null>) {
    const search = new URLSearchParams(params.toString());
    if (query && !("q" in next)) search.set("q", query);
    for (const [key, value] of Object.entries(next)) {
      if (!value) search.delete(key);
      else search.set(key, value);
    }
    const qs = search.toString();
    router.replace(qs ? `/pipeline?${qs}` : "/pipeline", { scroll: false });
  }

  function clearFilters() {
    setQuery("");
    router.replace("/pipeline", { scroll: false });
  }

  const sectors = [...new Set(state.ideas.map((idea) => idea.sector))].sort();
  const countries = [...new Set(state.ideas.map((idea) => idea.country))].sort();

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    const rows = state.ideas.filter((idea) => {
      if (overdueOnly && !ideaAwaitsAction(idea)) return false;
      if (stageFilter === "active" && (idea.stage === "invested" || idea.stage === "rejected")) {
        return false;
      }
      if (stageFilter !== "active" && stageFilter !== "all" && idea.stage !== stageFilter) {
        return false;
      }
      if (analyst !== "all" && idea.leadAnalystId !== analyst) return false;
      if (sector !== "all" && idea.sector !== sector) return false;
      if (country !== "all" && idea.country !== country) return false;
      if (priority !== "all" && idea.priority !== priority) return false;
      if (text && !`${idea.companyName} ${idea.ticker}`.toLowerCase().includes(text)) {
        return false;
      }
      return true;
    });
    return rows.sort((a, b) => compareIdeas(a, b, sort));
  }, [state.ideas, overdueOnly, stageFilter, analyst, sector, country, priority, query, sort]);

  const columns: Stage[] =
    stageFilter === "active" || stageFilter === "all"
      ? [...PIPELINE_STAGE_ORDER]
      : ACTIVE_STAGES.includes(stageFilter as (typeof ACTIVE_STAGES)[number]) ||
          stageFilter === "invested" ||
          stageFilter === "rejected"
        ? [stageFilter as Stage]
        : [...PIPELINE_STAGE_ORDER];

  const showHistoricalNote = stageFilter === "all";
  const historical = showHistoricalNote
    ? filtered.filter((idea) => idea.stage === "invested" || idea.stage === "rejected")
    : [];
  const boardIdeas =
    stageFilter === "all"
      ? filtered.filter((idea) => idea.stage !== "invested" && idea.stage !== "rejected")
      : filtered;

  function onDrop(stage: Stage, ideaId: string) {
    const idea = state.ideas.find((item) => item.id === ideaId);
    if (!idea) return;
    stageController.requestStage(idea, stage);
  }

  const filtersActive =
    stageFilter !== "active" ||
    analyst !== "all" ||
    sector !== "all" ||
    country !== "all" ||
    priority !== "all" ||
    query.length > 0 ||
    overdueOnly ||
    sort !== "updated";

  return (
    <div>
      <PageHeader
        title="Idea Pipeline"
        description="Research ideas moving from discovery toward a committee decision. Rejected and invested outcomes stay out of the active board."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus data-icon="inline-start" />
            New idea
          </Button>
        }
      />

      <Surface className="mb-4 p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1.2fr)_repeat(5,minmax(0,0.7fr))]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-2 left-2.5 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or ticker"
              aria-label="Search by company or ticker"
              className="pl-8"
            />
          </div>
          <NativeSelect
            ariaLabel="Stage"
            value={stageFilter}
            onChange={(value) => replace({ stage: value === "active" ? null : value })}
            options={[
              { value: "active", label: "Active stages" },
              { value: "all", label: "All, including history" },
              ...stageOptions(STAGES),
            ]}
          />
          <NativeSelect
            ariaLabel="Analyst"
            value={analyst}
            onChange={(value) => replace({ analyst: value === "all" ? null : value })}
            options={[
              { value: "all", label: "All analysts" },
              ...state.team.map((member) => ({ value: member.id, label: member.name })),
            ]}
          />
          <NativeSelect
            ariaLabel="Sector"
            value={sector}
            onChange={(value) => replace({ sector: value === "all" ? null : value })}
            options={[
              { value: "all", label: "All sectors" },
              ...sectors.map((item) => ({ value: item, label: item })),
            ]}
          />
          <NativeSelect
            ariaLabel="Country"
            value={country}
            onChange={(value) => replace({ country: value === "all" ? null : value })}
            options={[
              { value: "all", label: "All countries" },
              ...countries.map((item) => ({ value: item, label: item })),
            ]}
          />
          <NativeSelect
            ariaLabel="Priority"
            value={priority}
            onChange={(value) => replace({ priority: value === "all" ? null : value })}
            options={[
              { value: "all", label: "All priorities" },
              ...(Object.keys(PRIORITY_LABELS) as Priority[]).map((item) => ({
                value: item,
                label: PRIORITY_LABELS[item],
              })),
            ]}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <NativeSelect
            ariaLabel="Sort"
            className="w-48"
            value={sort}
            onChange={(value) => replace({ sort: value === "updated" ? null : value })}
            options={[
              { value: "updated", label: "Sort: last updated" },
              { value: "priority", label: "Sort: priority" },
              { value: "margin", label: "Sort: margin of safety" },
            ]}
          />
          <div className="flex items-baseline gap-3 border-b border-rule pb-0.5">
            <button
              type="button"
              className={cn(
                "font-serif text-[14px]",
                view === "table"
                  ? "font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4"
                  : "text-muted-foreground",
              )}
              onClick={() => replace({ view: "table" })}
              aria-pressed={view === "table"}
            >
              Table
            </button>
            <button
              type="button"
              className={cn(
                "font-serif text-[14px]",
                view === "kanban"
                  ? "font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4"
                  : "text-muted-foreground",
              )}
              onClick={() => replace({ view: "kanban" })}
              aria-pressed={view === "kanban"}
            >
              Board
            </button>
          </div>
          {filtersActive ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
          <p className="ml-auto text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "idea" : "ideas"}
            {overdueOnly ? " with overdue questions" : ""}
          </p>
        </div>
      </Surface>
      <IllustrativeNote>
        Prices and fair values are illustrative EUR source figures
        {state.settings.currency === "EUR"
          ? "."
          : `, shown in ${state.settings.currency} at a fixed demo rate.`}{" "}
        Margin of safety = (base fair value − price) / base fair value.
      </IllustrativeNote>

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No ideas match these filters"
            body="Clear a filter or add a company if the research list should include it."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : view === "table" ? (
        <div className="mt-4">
          <IdeaTable
            ideas={filtered}
            onEdit={setEditing}
            onStage={stageController.requestStage}
          />
        </div>
      ) : (
        <div className="mt-4 min-w-0 overflow-x-auto pb-2">
          <div className="flex w-max gap-3">
            {columns.map((stage) => {
              const cards = boardIdeas.filter((idea) => idea.stage === stage);
              return (
                <section
                  key={stage}
                  className="w-72 shrink-0"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const id = event.dataTransfer.getData("text/plain");
                    setDraggingId(null);
                    if (id) onDrop(stage, id);
                  }}
                >
                  <div className="mb-2 flex items-baseline justify-between border-b border-foreground/20 pb-1">
                    <h2 className="font-heading text-[15px] font-semibold tracking-[-0.01em]">
                      {STAGE_LABELS[stage]}
                    </h2>
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {cards.length}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "min-h-24 space-y-3 border-l border-rule pl-2 transition-[background-color,outline] duration-200",
                      draggingId && "stage-drop-active",
                    )}
                  >
                    {cards.length === 0 ? (
                      <p className="px-1 py-4 text-center text-xs text-muted-foreground">
                        Drop an idea here, or move one with the stage control.
                      </p>
                    ) : (
                      cards.map((idea) => (
                        <IdeaCard
                          key={idea.id}
                          idea={idea}
                          dragging={draggingId === idea.id}
                          onDragStart={() => setDraggingId(idea.id)}
                          onDragEnd={() => setDraggingId(null)}
                          onEdit={() => setEditing(idea)}
                          onStage={(stage) => stageController.requestStage(idea, stage)}
                        />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
          {historical.length > 0 ? (
            <div className="mt-4">
              <h2 className="mb-2 text-sm font-semibold">Historical outcomes</h2>
              <IdeaTable
                ideas={historical}
                onEdit={setEditing}
                onStage={stageController.requestStage}
              />
            </div>
          ) : null}
        </div>
      )}

      <IdeaFormDialog open={creating} onOpenChange={setCreating} />
      <IdeaFormDialog
        open={Boolean(editing)}
        editing={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <StageChangeDialog
        idea={stageController.pending?.idea ?? null}
        stage={stageController.pending?.stage ?? null}
        onClose={stageController.close}
      />
    </div>
  );
}

function compareIdeas(a: Idea, b: Idea, sort: SortKey): number {
  if (sort === "priority") {
    const rank = priorityRank(a.priority) - priorityRank(b.priority);
    if (rank !== 0) return rank;
  }
  if (sort === "margin") {
    const left = ideaMargin(a);
    const right = ideaMargin(b);
    if (left === null && right === null) return 0;
    if (left === null) return 1;
    if (right === null) return -1;
    if (left !== right) return right - left;
  }
  return b.lastUpdated.localeCompare(a.lastUpdated);
}

function IdeaCard({
  idea,
  dragging,
  onDragStart,
  onDragEnd,
  onEdit,
  onStage,
}: {
  idea: Idea;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onEdit: () => void;
  onStage: (stage: Stage) => void;
}) {
  const { state } = useWorkspace();
  const analyst = memberById(state, idea.leadAnalystId);
  const margin = ideaMargin(idea);
  const openQuestions = unresolvedQuestions(idea).length;
  const showValuation = idea.priority !== "low";
  const showAction = idea.priority === "high" || openQuestions > 0;

  return (
    <article
      className={cn(
        "border-b border-rule pb-2.5 transition-colors",
        idea.priority === "high" && "bg-[color-mix(in_srgb,var(--ink-wash)_35%,transparent)] px-1.5 pt-1",
        dragging && "opacity-60",
      )}
    >
      <div className="flex items-start gap-1">
        <button
          type="button"
          className="mt-0.5 cursor-grab p-0.5 text-muted-foreground hover:text-foreground"
          draggable
          aria-label={`Drag ${idea.companyName} to another stage`}
          onDragStart={(event) => {
            event.dataTransfer.setData("text/plain", idea.id);
            event.dataTransfer.effectAllowed = "move";
            onDragStart();
          }}
          onDragEnd={onDragEnd}
        >
          <GripVertical className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <Link
            href={`/companies/${idea.id}`}
            className="block truncate font-heading text-[15px] font-semibold tracking-[-0.015em] hover:text-primary"
          >
            {idea.companyName}
          </Link>
          <p className="font-mono text-[11px] text-muted-foreground">
            {idea.ticker} · {idea.country} · {idea.sector}
          </p>
        </div>
      </div>

      {showValuation ? (
        <p className="mt-1.5 font-mono text-[11px] tabular-nums text-foreground/80">
          {formatMoney(idea.valuation.currentPrice, state.settings.currency)}
          <span className="text-muted-foreground"> → </span>
          {formatMoney(idea.valuation.baseFairValue, state.settings.currency)}
          <span
            className={cn(
              "ml-2",
              margin !== null && margin < 0 ? "text-destructive" : "text-foreground",
            )}
          >
            MoS {formatPercent(margin)}
          </span>
        </p>
      ) : (
        <p className="mt-1 font-serif text-[12px] text-muted-foreground">
          {analyst?.initials} · {openQuestions} open q
        </p>
      )}

      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <PriorityBadge priority={idea.priority} />
        {showValuation ? (
          <span className="font-mono text-[11px] text-muted-foreground">
            {analyst?.initials}
            {openQuestions > 0 ? ` · ${openQuestions} q` : ""}
          </span>
        ) : null}
      </div>

      {showAction ? (
        <p className="mt-1.5 line-clamp-3 font-serif text-[12.5px] leading-5 text-foreground/80">
          {idea.nextAction}
        </p>
      ) : null}

      <div className="mt-2 flex items-center gap-1">
        <NativeSelect
          ariaLabel={`Stage for ${idea.companyName}`}
          value={idea.stage}
          onChange={(value) => onStage(value as Stage)}
          options={stageOptions(STAGES)}
        />
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </article>
  );
}

function IdeaTable({
  ideas,
  onEdit,
  onStage,
}: {
  ideas: Idea[];
  onEdit: (idea: Idea) => void;
  onStage: (idea: Idea, stage: Stage) => void;
}) {
  const { state } = useWorkspace();
  return (
    <Surface className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-[13px]">
          <thead className="border-b border-rule font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
            <tr>
              {[
                "Company",
                "Country",
                "Sector",
                "Price",
                "Base FV",
                "MoS",
                "Stage",
                "Analyst",
                "Priority",
                "Conviction",
                "Last review",
                "Next action",
                "Open Qs",
                "",
              ].map((heading) => (
                <th key={heading || "actions"} className="px-2 py-2 font-medium whitespace-nowrap">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ideas.map((idea) => {
              const analyst = memberById(state, idea.leadAnalystId);
              const margin = ideaMargin(idea);
              return (
                <tr key={idea.id} className="blotter-row border-b border-rule/70 last:border-0">
                  <td className="px-2 py-2">
                    <Link
                      href={`/companies/${idea.id}`}
                      className="font-heading text-[14px] font-semibold tracking-[-0.015em] hover:text-primary"
                    >
                      {idea.companyName}
                    </Link>
                    <div className="font-mono text-[11px] text-muted-foreground">{idea.ticker}</div>
                  </td>
                  <td className="px-2 py-2 font-serif whitespace-nowrap">{idea.country}</td>
                  <td className="px-2 py-2 font-serif whitespace-nowrap">{idea.sector}</td>
                  <td className="px-2 py-2 whitespace-nowrap tabular-nums">
                    {formatMoney(idea.valuation.currentPrice, state.settings.currency)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap tabular-nums">
                    {formatMoney(idea.valuation.baseFairValue, state.settings.currency)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap tabular-nums">
                    {formatPercent(margin)}
                  </td>
                  <td className="px-2 py-2">
                    <NativeSelect
                      ariaLabel={`Stage for ${idea.companyName}`}
                      className="w-44"
                      value={idea.stage}
                      onChange={(value) => onStage(idea, value as Stage)}
                      options={stageOptions(STAGES)}
                    />
                  </td>
                  <td className="px-2 py-2 font-serif whitespace-nowrap">{analyst?.name}</td>
                  <td className="px-2 py-2">
                    <PriorityBadge priority={idea.priority} />
                  </td>
                  <td className="px-2 py-2">
                    <ConvictionBadge conviction={idea.conviction} />
                  </td>
                  <td className="px-2 py-2 font-mono text-[12px] whitespace-nowrap">
                    {formatDate(idea.thesis.lastSubstantiveReview)}
                  </td>
                  <td className="max-w-56 px-2 py-2 font-serif text-[13px] leading-5 whitespace-normal text-foreground/75">
                    {idea.nextAction}
                  </td>
                  <td className="px-2 py-2 tabular-nums">
                    {unresolvedQuestions(idea).length}
                  </td>
                  <td className="px-2 py-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(idea)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Surface>
  );
}

