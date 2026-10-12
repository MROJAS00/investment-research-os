"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Field,
  NativeSelect,
  PageHeader,
  Surface,
} from "@/components/common/ui-bits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import { STAGE_LABELS } from "@/lib/labels";
import { isQuestionOverdue, openQuestionsForMember } from "@/lib/metrics";
import { useWorkspace } from "@/lib/store";
import type { Idea, ResearchQuestion, TeamMember } from "@/lib/types";
import Link from "next/link";

export function TeamView() {
  const { state, reassignIdea, reassignQuestion } = useWorkspace();
  const [ideaTarget, setIdeaTarget] = useState<Idea | null>(null);
  const [questionTarget, setQuestionTarget] = useState<{
    idea: Idea;
    question: ResearchQuestion;
  } | null>(null);

  return (
    <div>
      <PageHeader
        title="Team & Research"
        description="Who is carrying which ideas and questions. Workload is a count of open work, not a score."
      />
      <Surface className="mb-4 px-4 py-3">
        <p className="text-[13px] leading-5 text-muted-foreground">
          Permissions are simulated. The “Acting as” control in the top bar only attributes history in this browser. Production access control is not implemented.
        </p>
      </Surface>
      <div className="grid gap-3 xl:grid-cols-3">
        {state.team.map((member) => {
          const ideas = state.ideas.filter(
            (idea) =>
              idea.leadAnalystId === member.id &&
              idea.stage !== "rejected" &&
              idea.stage !== "invested",
          );
          const questions = openQuestionsForMember(state.ideas, member.id);
          const overdue = questions.filter(({ question }) =>
            isQuestionOverdue(question.status, question.dueDate),
          );
          return (
            <Surface key={member.id} className="p-4">
              <h2 className="font-heading text-lg font-semibold tracking-[-0.01em]">
                {member.name}
              </h2>
              <p className="text-[13px] text-muted-foreground">{member.role}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">{member.email}</p>
              <dl className="mt-3 grid grid-cols-3 divide-x divide-border border-y border-border text-center">
                <div className="px-2 py-2">
                  <dt className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
                    Active ideas
                  </dt>
                  <dd className="font-heading text-xl font-semibold tabular-nums">{ideas.length}</dd>
                </div>
                <div className="px-2 py-2">
                  <dt className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
                    Open questions
                  </dt>
                  <dd className="font-heading text-xl font-semibold tabular-nums">
                    {questions.length}
                  </dd>
                </div>
                <div className="px-2 py-2">
                  <dt className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
                    Overdue
                  </dt>
                  <dd className="font-heading text-xl font-semibold tabular-nums">{overdue.length}</dd>
                </div>
              </dl>
              <h3 className="mt-4 font-mono text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                Ideas
              </h3>
              <ul className="mt-1 space-y-2">
                {ideas.length === 0 ? (
                  <li className="text-sm text-muted-foreground">No active ideas.</li>
                ) : (
                  ideas.map((idea) => (
                    <li key={idea.id} className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/companies/${idea.id}`} className="text-sm font-medium hover:text-primary">
                          {idea.companyName}
                        </Link>
                        <p className="text-xs text-muted-foreground">{STAGE_LABELS[idea.stage]}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setIdeaTarget(idea)}>
                        Reassign
                      </Button>
                    </li>
                  ))
                )}
              </ul>
              <h3 className="mt-4 font-mono text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                Questions
              </h3>
              <ul className="mt-1 space-y-2">
                {questions.length === 0 ? (
                  <li className="text-sm text-muted-foreground">No open questions.</li>
                ) : (
                  questions.map(({ idea, question }) => (
                    <li key={question.id}>
                      <p className="text-sm leading-5">{question.question}</p>
                      <p className="text-xs text-muted-foreground">
                        {idea.companyName} · due {formatDate(question.dueDate)}
                        {isQuestionOverdue(question.status, question.dueDate) ? " · Overdue" : ""}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 px-0"
                        onClick={() => setQuestionTarget({ idea, question })}
                      >
                        Reassign
                      </Button>
                    </li>
                  ))
                )}
              </ul>
            </Surface>
          );
        })}
      </div>

      <ReassignIdeaDialog
        idea={ideaTarget}
        team={state.team}
        onClose={() => setIdeaTarget(null)}
        onSave={(analystId) => {
          if (!ideaTarget) return;
          reassignIdea(ideaTarget.id, analystId);
          toast.success("Lead analyst updated.");
          setIdeaTarget(null);
        }}
      />
      <ReassignQuestionDialog
        target={questionTarget}
        team={state.team}
        onClose={() => setQuestionTarget(null)}
        onSave={(ownerId) => {
          if (!questionTarget) return;
          reassignQuestion(questionTarget.idea.id, questionTarget.question.id, ownerId);
          toast.success("Question owner updated.");
          setQuestionTarget(null);
        }}
      />
    </div>
  );
}

function ReassignIdeaDialog({
  idea,
  team,
  onClose,
  onSave,
}: {
  idea: Idea | null;
  team: TeamMember[];
  onClose: () => void;
  onSave: (analystId: string) => void;
}) {
  const [analystId, setAnalystId] = useState(idea?.leadAnalystId ?? team[0]?.id ?? "");
  useEffect(() => {
    if (idea) setAnalystId(idea.leadAnalystId);
  }, [idea]);
  return (
    <Dialog
      open={Boolean(idea)}
      onOpenChange={(open) => {
        if (open && idea) setAnalystId(idea.leadAnalystId);
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign {idea?.companyName}</DialogTitle>
          <DialogDescription>
            Changes the lead analyst on the research record. It does not change access rights.
          </DialogDescription>
        </DialogHeader>
        <Field label="Lead analyst" htmlFor="reassign-idea">
          <NativeSelect
            id="reassign-idea"
            value={analystId || idea?.leadAnalystId || ""}
            onChange={setAnalystId}
            options={team.map((member) => ({ value: member.id, label: `${member.name} — ${member.role}` }))}
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => analystId && onSave(analystId)}>Reassign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReassignQuestionDialog({
  target,
  team,
  onClose,
  onSave,
}: {
  target: { idea: Idea; question: ResearchQuestion } | null;
  team: TeamMember[];
  onClose: () => void;
  onSave: (ownerId: string) => void;
}) {
  const [ownerId, setOwnerId] = useState(target?.question.ownerId ?? "");
  useEffect(() => {
    if (target) setOwnerId(target.question.ownerId);
  }, [target]);
  return (
    <Dialog
      open={Boolean(target)}
      onOpenChange={(open) => {
        if (open && target) setOwnerId(target.question.ownerId);
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign question</DialogTitle>
          <DialogDescription>{target?.question.question}</DialogDescription>
        </DialogHeader>
        <Field label="Owner" htmlFor="reassign-question">
          <NativeSelect
            id="reassign-question"
            value={ownerId || target?.question.ownerId || ""}
            onChange={setOwnerId}
            options={team.map((member) => ({ value: member.id, label: member.name }))}
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => ownerId && onSave(ownerId)}>Reassign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
