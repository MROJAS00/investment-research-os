"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  EmptyState,
  Field,
  IllustrativeNote,
  NativeSelect,
  PageHeader,
  PriorityBadge,
  Surface,
  ThesisStatusBadge,
} from "@/components/common/ui-bits";
import { StageChangeDialog, useStageController } from "@/components/ideas/dialogs";
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
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatMoney, formatPercent } from "@/lib/format";
import { WAIT_KIND_LABELS } from "@/lib/labels";
import {
  cheapVersusValuation,
  ideaMargin,
  memberById,
  priorityRank,
} from "@/lib/metrics";
import { useWorkspace } from "@/lib/store";
import type { Idea, WaitKind } from "@/lib/types";
import Link from "next/link";

type SortKey = "reviewed" | "margin" | "priority";

export function WatchlistView() {
  const { state, updateWatch } = useWorkspace();
  const stageController = useStageController();
  const [analyst, setAnalyst] = useState("all");
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("reviewed");
  const [editing, setEditing] = useState<Idea | null>(null);

  const rows = useMemo(() => {
    const text = query.trim().toLowerCase();
    return state.ideas
      .filter((idea) => idea.stage === "watchlist")
      .filter((idea) => (analyst === "all" ? true : idea.leadAnalystId === analyst))
      .filter((idea) => (kind === "all" ? true : idea.waitKind === kind))
      .filter((idea) =>
        text ? `${idea.companyName} ${idea.ticker}`.toLowerCase().includes(text) : true,
      )
      .sort((a, b) => {
        if (sort === "priority") {
          const rank = priorityRank(a.priority) - priorityRank(b.priority);
          if (rank !== 0) return rank;
        }
        if (sort === "margin") {
          const left = ideaMargin(a);
          const right = ideaMargin(b);
          if (left === null) return 1;
          if (right === null) return -1;
          if (left !== right) return right - left;
        }
        return b.thesis.lastSubstantiveReview.localeCompare(a.thesis.lastSubstantiveReview);
      });
  }, [state.ideas, analyst, kind, query, sort]);

  return (
    <div>
      <PageHeader
        title="Watchlist"
        description="Companies the team understands, or is still trying to understand, and has not bought. This is not a portfolio and it does not show positions."
      />
      <Surface className="mb-3 grid gap-2 p-3 md:grid-cols-4">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name or ticker"
          aria-label="Search watchlist"
        />
        <NativeSelect
          ariaLabel="Analyst"
          value={analyst}
          onChange={setAnalyst}
          options={[
            { value: "all", label: "All analysts" },
            ...state.team.map((member) => ({ value: member.id, label: member.name })),
          ]}
        />
        <NativeSelect
          ariaLabel="Wait reason"
          value={kind}
          onChange={setKind}
          options={[
            { value: "all", label: "All wait reasons" },
            ...(Object.keys(WAIT_KIND_LABELS) as WaitKind[]).map((item) => ({
              value: item,
              label: WAIT_KIND_LABELS[item],
            })),
          ]}
        />
        <NativeSelect
          ariaLabel="Sort"
          value={sort}
          onChange={(value) => setSort(value as SortKey)}
          options={[
            { value: "reviewed", label: "Sort: last reviewed" },
            { value: "margin", label: "Sort: margin of safety" },
            { value: "priority", label: "Sort: priority" },
          ]}
        />
      </Surface>
      <IllustrativeNote>
        “Cheap vs illustrative valuation” means the base-case margin of safety meets the minimum stored on the idea. “Thesis deteriorated” is a research judgement, not a price signal.
      </IllustrativeNote>

      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No companies on the watchlist"
            body="Move an active idea to the watchlist from the pipeline when the team wants to wait rather than keep working it."
            action={
              <Button variant="outline" render={<Link href="/pipeline" />}>
                Open the pipeline
              </Button>
            }
          />
        </div>
      ) : (
        <Surface className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-[13px]">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  {[
                    "Company",
                    "Price",
                    "Base FV",
                    "Target entry",
                    "MoS",
                    "Analyst",
                    "Thesis",
                    "Waiting because",
                    "Next trigger",
                    "Last reviewed",
                    "",
                  ].map((heading) => (
                    <th key={heading} className="px-2 py-2 font-medium whitespace-nowrap">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((idea) => {
                  const analystName = memberById(state, idea.leadAnalystId);
                  const cheap = cheapVersusValuation(idea);
                  return (
                    <tr key={idea.id} className="border-b border-border align-top last:border-0">
                      <td className="px-2 py-2">
                        <Link
                          href={`/companies/${idea.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {idea.companyName}
                        </Link>
                        <div className="text-xs text-muted-foreground">{idea.ticker}</div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap tabular-nums">
                        {formatMoney(idea.valuation.currentPrice, state.settings.currency)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap tabular-nums">
                        {formatMoney(idea.valuation.baseFairValue, state.settings.currency)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap tabular-nums">
                        {formatMoney(idea.valuation.targetEntry, state.settings.currency)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap tabular-nums">
                        {formatPercent(ideaMargin(idea))}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">{analystName?.name}</td>
                      <td className="px-2 py-2">
                        <ThesisStatusBadge status={idea.thesis.status} />
                      </td>
                      <td className="max-w-xs px-2 py-2 whitespace-normal">
                        <div className="mb-1 flex flex-wrap gap-1">
                          <PriorityBadge priority={idea.priority} />
                          <span className="inline-flex h-5 items-center rounded-md bg-muted px-1.5 text-[11px] font-medium">
                            {idea.waitKind ? WAIT_KIND_LABELS[idea.waitKind] : "Unspecified"}
                          </span>
                          <span className="inline-flex h-5 items-center rounded-md bg-secondary px-1.5 text-[11px] font-medium">
                            {idea.waitKind === "thesis"
                              ? "Thesis deteriorated"
                              : cheap
                                ? "Cheap vs illustrative valuation"
                                : "Not cheap vs illustrative valuation"}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{idea.waitReason}</p>
                      </td>
                      <td className="max-w-xs px-2 py-2 whitespace-normal text-muted-foreground">
                        {idea.nextReviewTrigger || "—"}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {formatDate(idea.thesis.lastSubstantiveReview)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditing(idea)}>
                            Update watch
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => stageController.requestStage(idea, "deep_research")}
                          >
                            Return to research
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Surface>
      )}

      <WatchDialog
        idea={editing}
        onClose={() => setEditing(null)}
        onSave={(idea, input) => {
          updateWatch(idea.id, input);
          toast.success(`Watch notes updated for ${idea.companyName}.`);
          setEditing(null);
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

function WatchDialog({
  idea,
  onClose,
  onSave,
}: {
  idea: Idea | null;
  onClose: () => void;
  onSave: (
    idea: Idea,
    input: {
      targetEntry: number;
      waitKind: WaitKind;
      waitReason: string;
      nextReviewTrigger: string;
    },
  ) => void;
}) {
  const [targetEntry, setTargetEntry] = useState(0);
  const [waitKind, setWaitKind] = useState<WaitKind>("price");
  const [waitReason, setWaitReason] = useState("");
  const [trigger, setTrigger] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!idea) return;
    setTargetEntry(idea.valuation.targetEntry);
    setWaitKind(idea.waitKind ?? "price");
    setWaitReason(idea.waitReason ?? "");
    setTrigger(idea.nextReviewTrigger ?? "");
    setError("");
  }, [idea]);

  return (
    <Dialog open={Boolean(idea)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update watch notes</DialogTitle>
          <DialogDescription>
            {idea
              ? `${idea.companyName}. Target entry is an illustrative EUR figure.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="Target entry (EUR)" htmlFor="watch-entry">
            <Input
              id="watch-entry"
              type="number"
              min={0}
              step="0.01"
              value={targetEntry}
              onChange={(event) => setTargetEntry(Number(event.target.value))}
            />
          </Field>
          <Field label="Why it is waiting" htmlFor="watch-kind">
            <NativeSelect
              id="watch-kind"
              value={waitKind}
              onChange={(value) => setWaitKind(value as WaitKind)}
              options={(Object.keys(WAIT_KIND_LABELS) as WaitKind[]).map((item) => ({
                value: item,
                label: WAIT_KIND_LABELS[item],
              }))}
            />
          </Field>
          <Field label="Reason for waiting" htmlFor="watch-reason" error={error}>
            <Textarea
              id="watch-reason"
              className="min-h-24"
              value={waitReason}
              onChange={(event) => setWaitReason(event.target.value)}
            />
          </Field>
          <Field label="Next review trigger" htmlFor="watch-trigger">
            <Textarea
              id="watch-trigger"
              value={trigger}
              onChange={(event) => setTrigger(event.target.value)}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!idea) return;
              if (waitReason.trim().length < 10) {
                setError("Describe why it is waiting, in at least 10 characters.");
                return;
              }
              if (!Number.isFinite(targetEntry) || targetEntry < 0) {
                setError("Target entry cannot be negative.");
                return;
              }
              onSave(idea, {
                targetEntry,
                waitKind,
                waitReason,
                nextReviewTrigger: trigger,
              });
            }}
          >
            Save watch notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

