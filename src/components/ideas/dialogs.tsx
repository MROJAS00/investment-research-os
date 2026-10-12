"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Field, IllustrativeNote, NativeSelect } from "@/components/common/ui-bits";
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
import { COUNTRIES, SECTORS, STAGE_LABELS, WAIT_KIND_LABELS } from "@/lib/labels";
import { useWorkspace } from "@/lib/store";
import {
  ACTIVE_STAGES,
  CONVICTIONS,
  PRIORITIES,
  STAGES,
  type Conviction,
  type Idea,
  type IdeaDraft,
  type Priority,
  type Stage,
  type WaitKind,
} from "@/lib/types";

const EMPTY_DRAFT: IdeaDraft = {
  companyName: "",
  ticker: "",
  country: "Netherlands",
  sector: "Industrials",
  stage: "discovered",
  leadAnalystId: "",
  priority: "medium",
  conviction: "unformed",
  nextAction: "",
  researchReason: "",
  currentPrice: 0,
  baseFairValue: 0,
};

export function draftFromIdea(idea: Idea): IdeaDraft {
  return {
    companyName: idea.companyName,
    ticker: idea.ticker,
    country: idea.country,
    sector: idea.sector,
    stage: idea.stage,
    leadAnalystId: idea.leadAnalystId,
    priority: idea.priority,
    conviction: idea.conviction,
    nextAction: idea.nextAction,
    researchReason: idea.researchReason,
    currentPrice: idea.valuation.currentPrice,
    baseFairValue: idea.valuation.baseFairValue,
  };
}

export function validateIdeaDraft(
  draft: IdeaDraft,
  ideas: Idea[],
  editingId?: string,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (draft.companyName.trim().length < 2) {
    errors.companyName = "Enter the company name.";
  }
  const ticker = draft.ticker.trim().toUpperCase();
  if (!/^[A-Z0-9.]{2,12}$/.test(ticker)) {
    errors.ticker = "Use 2–12 letters, numbers, or dots.";
  } else if (ideas.some((idea) => idea.ticker === ticker && idea.id !== editingId)) {
    errors.ticker = "That ticker is already in this workspace.";
  }
  if (!draft.country) errors.country = "Choose a country.";
  if (!draft.sector) errors.sector = "Choose a sector.";
  if (draft.researchReason.trim().length < 20) {
    errors.researchReason = "Write at least 20 characters on why this is being researched.";
  }
  if (!Number.isFinite(draft.currentPrice) || draft.currentPrice < 0) {
    errors.currentPrice = "Price cannot be negative.";
  }
  if (!Number.isFinite(draft.baseFairValue) || draft.baseFairValue < 0) {
    errors.baseFairValue = "Fair value cannot be negative.";
  }
  return errors;
}

export function IdeaFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Idea | null;
}) {
  const { state, createIdea, updateIdeaDetails } = useWorkspace();
  const [draft, setDraft] = useState<IdeaDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (editing) {
      setDraft(draftFromIdea(editing));
    } else {
      setDraft({
        ...EMPTY_DRAFT,
        leadAnalystId: state.settings.actingUserId,
      });
    }
  }, [open, editing, state.settings.actingUserId]);

  function set<K extends keyof IdeaDraft>(key: K, value: IdeaDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    const nextErrors = validateIdeaDraft(draft, state.ideas, editing?.id);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (editing) {
      updateIdeaDetails(editing.id, draft);
      toast.success("Research details saved.");
    } else {
      createIdea(draft);
      toast.success(`${draft.companyName.trim()} added to the pipeline.`);
    }
    onOpenChange(false);
  }

  const stageOptions = (editing ? STAGES : ACTIVE_STAGES).map((stage) => ({
    value: stage,
    label: STAGE_LABELS[stage],
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit idea" : "New research idea"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the research record. Change stage from the stage control so a rejection or watchlist reason is captured."
              : "Company name, ticker, and a research rationale are required. Figures are illustrative."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[65vh] gap-3 overflow-y-auto pr-1">
          <Field label="Company name" htmlFor="idea-name" error={errors.companyName}>
            <Input
              id="idea-name"
              value={draft.companyName}
              aria-invalid={Boolean(errors.companyName)}
              onChange={(event) => set("companyName", event.target.value)}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Ticker" htmlFor="idea-ticker" error={errors.ticker}>
              <Input
                id="idea-ticker"
                value={draft.ticker}
                aria-invalid={Boolean(errors.ticker)}
                onChange={(event) => set("ticker", event.target.value.toUpperCase())}
                placeholder="HLDH.AS"
              />
            </Field>
            <Field label="Lead analyst" htmlFor="idea-analyst">
              <NativeSelect
                id="idea-analyst"
                value={draft.leadAnalystId}
                onChange={(value) => set("leadAnalystId", value)}
                options={state.team.map((member) => ({
                  value: member.id,
                  label: member.name,
                }))}
              />
            </Field>
            <Field label="Country" htmlFor="idea-country" error={errors.country}>
              <NativeSelect
                id="idea-country"
                value={draft.country}
                onChange={(value) => set("country", value)}
                options={COUNTRIES.map((country) => ({ value: country, label: country }))}
              />
            </Field>
            <Field label="Sector" htmlFor="idea-sector" error={errors.sector}>
              <NativeSelect
                id="idea-sector"
                value={draft.sector}
                onChange={(value) => set("sector", value)}
                options={SECTORS.map((sector) => ({ value: sector, label: sector }))}
              />
            </Field>
            {editing ? null : (
              <Field label="Stage" htmlFor="idea-stage">
                <NativeSelect
                  id="idea-stage"
                  value={draft.stage}
                  onChange={(value) => set("stage", value as Stage)}
                  options={stageOptions}
                />
              </Field>
            )}
            <Field label="Priority" htmlFor="idea-priority">
              <NativeSelect
                id="idea-priority"
                value={draft.priority}
                onChange={(value) => set("priority", value as Priority)}
                options={PRIORITIES.map((priority) => ({
                  value: priority,
                  label: priority[0].toUpperCase() + priority.slice(1),
                }))}
              />
            </Field>
            <Field label="Conviction" htmlFor="idea-conviction">
              <NativeSelect
                id="idea-conviction"
                value={draft.conviction}
                onChange={(value) => set("conviction", value as Conviction)}
                options={CONVICTIONS.map((conviction) => ({
                  value: conviction,
                  label: conviction[0].toUpperCase() + conviction.slice(1),
                }))}
              />
            </Field>
            {editing ? null : (
              <>
                <Field
                  label="Illustrative price (EUR)"
                  htmlFor="idea-price"
                  error={errors.currentPrice}
                >
                  <Input
                    id="idea-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={draft.currentPrice}
                    onChange={(event) => set("currentPrice", Number(event.target.value))}
                  />
                </Field>
                <Field
                  label="Base fair value (EUR)"
                  htmlFor="idea-fv"
                  error={errors.baseFairValue}
                  hint="Leave at 0 if unknown. Margin of safety stays blank until a base value exists."
                >
                  <Input
                    id="idea-fv"
                    type="number"
                    min={0}
                    step="0.01"
                    value={draft.baseFairValue}
                    onChange={(event) => set("baseFairValue", Number(event.target.value))}
                  />
                </Field>
              </>
            )}
          </div>
          <Field label="Next action" htmlFor="idea-next">
            <Input
              id="idea-next"
              value={draft.nextAction}
              onChange={(event) => set("nextAction", event.target.value)}
            />
          </Field>
          <Field
            label="Research rationale"
            htmlFor="idea-reason"
            error={errors.researchReason}
          >
            <Textarea
              id="idea-reason"
              value={draft.researchReason}
              aria-invalid={Boolean(errors.researchReason)}
              onChange={(event) => set("researchReason", event.target.value)}
              className="min-h-24"
            />
          </Field>
          <IllustrativeNote />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Create idea"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StageChangeDialog({
  idea,
  stage,
  onClose,
}: {
  idea: Idea | null;
  stage: Stage | null;
  onClose: () => void;
}) {
  const { changeStage } = useWorkspace();
  const open = Boolean(idea && stage);
  const [reason, setReason] = useState("");
  const [waitKind, setWaitKind] = useState<WaitKind>("price");
  const [trigger, setTrigger] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !idea) return;
    setReason(idea.waitReason ?? idea.rejectionReason ?? "");
    setWaitKind(idea.waitKind ?? "price");
    setTrigger(idea.nextReviewTrigger ?? "");
    setError("");
  }, [open, idea]);

  function confirm() {
    if (!idea || !stage) return;
    if (stage === "rejected" && reason.trim().length < 10) {
      setError("A rejection reason of at least 10 characters is required.");
      return;
    }
    if (stage === "watchlist" && reason.trim().length < 10) {
      setError("Say why the idea is waiting, in at least 10 characters.");
      return;
    }
    changeStage(idea.id, {
      stage,
      rejectionReason: stage === "rejected" ? reason : undefined,
      waitKind: stage === "watchlist" ? waitKind : undefined,
      waitReason: stage === "watchlist" ? reason : undefined,
      nextReviewTrigger: stage === "watchlist" ? trigger : undefined,
    });
    toast.success(`${idea.companyName} moved to ${STAGE_LABELS[stage]}.`);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {stage === "rejected"
              ? `Reject ${idea?.companyName ?? "idea"}`
              : stage === "watchlist"
                ? `Add ${idea?.companyName ?? "idea"} to the watchlist`
                : `Record ${idea?.companyName ?? "idea"} as invested`}
          </DialogTitle>
          <DialogDescription>
            {stage === "invested"
              ? "This records a research outcome. Longview does not track shares, cost, or performance."
              : stage === "rejected"
                ? "A written reason is required. The idea leaves the active pipeline and stays available as history."
                : "The watchlist is for companies understood, or being understood, that are not yet bought."}
          </DialogDescription>
        </DialogHeader>
        {stage === "watchlist" ? (
          <div className="grid gap-3">
            <Field label="Why it is waiting" htmlFor="wait-kind">
              <NativeSelect
                id="wait-kind"
                value={waitKind}
                onChange={(value) => setWaitKind(value as WaitKind)}
                options={(Object.keys(WAIT_KIND_LABELS) as WaitKind[]).map((kind) => ({
                  value: kind,
                  label: WAIT_KIND_LABELS[kind],
                }))}
              />
            </Field>
            <Field label="Reason" htmlFor="wait-reason" error={error}>
              <Textarea
                id="wait-reason"
                value={reason}
                aria-invalid={Boolean(error)}
                onChange={(event) => setReason(event.target.value)}
                className="min-h-24"
              />
            </Field>
            <Field label="Next review trigger" htmlFor="wait-trigger">
              <Input
                id="wait-trigger"
                value={trigger}
                onChange={(event) => setTrigger(event.target.value)}
              />
            </Field>
          </div>
        ) : null}
        {stage === "rejected" ? (
          <Field label="Rejection reason" htmlFor="reject-reason" error={error}>
            <Textarea
              id="reject-reason"
              value={reason}
              aria-invalid={Boolean(error)}
              onChange={(event) => setReason(event.target.value)}
              className="min-h-24"
            />
          </Field>
        ) : null}
        {stage === "invested" ? (
          <p className="text-sm text-muted-foreground">
            Confirm only if the research process has concluded in an investment decision.
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={stage === "rejected" ? "destructive" : "default"}
            onClick={confirm}
          >
            {stage === "rejected"
              ? "Reject idea"
              : stage === "watchlist"
                ? "Add to watchlist"
                : "Record outcome"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useStageController() {
  const [pending, setPending] = useState<{ idea: Idea; stage: Stage } | null>(null);
  const { changeStage } = useWorkspace();

  function requestStage(idea: Idea, stage: Stage) {
    if (idea.stage === stage) return;
    if (stage === "rejected" || stage === "watchlist" || stage === "invested") {
      setPending({ idea, stage });
      return;
    }
    changeStage(idea.id, { stage });
    toast.success(`${idea.companyName} moved to ${STAGE_LABELS[stage]}.`);
  }

  return {
    pending,
    requestStage,
    close: () => setPending(null),
  };
}
