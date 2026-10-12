"use client";

import { cn } from "cn";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  EmptyState,
  Field,
  IllustrativeNote,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatDateTime, formatMoney, formatPercent } from "@/lib/format";
import {
  DECISION_LABELS,
  DOCUMENT_TYPE_LABELS,
  MEETING_STATUS_LABELS,
  STAGE_LABELS,
  WAIT_KIND_LABELS,
} from "@/lib/labels";
import { ideaMargin, memberById, unresolvedQuestions, upcomingMeetings } from "@/lib/metrics";
import { useWorkspace } from "@/lib/store";
import {
  DECISION_TYPES,
  type AgendaItem,
  type CommitteeMeeting,
  type DecisionType,
  type WaitKind,
} from "@/lib/types";

export function CommitteeView() {
  const { state, createMeeting, addAgendaCompany, recordDecision } = useWorkspace();
  const upcoming = upcomingMeetings(state.meetings);
  const [selectedId, setSelectedId] = useState(upcoming[0]?.id ?? state.meetings[0]?.id ?? "");
  const selected = state.meetings.find((meeting) => meeting.id === selectedId) ?? state.meetings[0];
  const [dossierId, setDossierId] = useState(upcoming[0]?.agenda[0]?.id ?? "");
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [decisionFor, setDecisionFor] = useState<AgendaItem | null>(null);

  const history = state.meetings
    .flatMap((meeting) =>
      meeting.agenda
        .filter((item) => item.decision)
        .map((item) => ({ meeting, item })),
    )
    .sort((a, b) =>
      (b.item.decision?.decidedAt ?? "").localeCompare(a.item.decision?.decidedAt ?? ""),
    );

  return (
    <div>
      <PageHeader
        title="Investment Committee"
        description="Prepare a session, read a dossier, and record a written decision. Nothing here approves a trade automatically."
        actions={
          <Button onClick={() => setCreating(true)}>Schedule a meeting</Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Surface className="h-fit p-2">
          <ul className="space-y-1">
            {state.meetings
              .slice()
              .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
              .map((meeting) => (
                <li key={meeting.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(meeting.id);
                      setDossierId(meeting.agenda[0]?.id ?? "");
                    }}
                    className={cn(
                      "w-full border-l-2 px-2 py-2 text-left transition-colors",
                      selected?.id === meeting.id
                        ? "border-primary bg-ink-wash"
                        : "border-transparent hover:bg-muted/70",
                    )}
                  >
                    <span className="block text-[13px] font-medium">{meeting.title}</span>
                    <span className="block font-mono text-[11px] text-muted-foreground">
                      {formatDateTime(meeting.scheduledAt)} · {MEETING_STATUS_LABELS[meeting.status]}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </Surface>

        {selected ? (
          <div className="space-y-4">
            <Surface className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold tracking-[-0.01em]">
                    {selected.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDateTime(selected.scheduledAt)} · {selected.location} ·{" "}
                    {MEETING_STATUS_LABELS[selected.status]}
                  </p>
                  {selected.notes ? (
                    <p className="mt-2 max-w-3xl text-sm leading-5">{selected.notes}</p>
                  ) : null}
                </div>
                {selected.status !== "completed" ? (
                  <Button variant="outline" onClick={() => setAdding(true)}>
                    Add company
                  </Button>
                ) : null}
              </div>
              {selected.agenda.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No companies on this agenda yet.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-border border-t border-border">
                  {selected.agenda.map((item) => {
                    const idea = state.ideas.find((entry) => entry.id === item.companyId);
                    const presenter = memberById(state, item.presenterId);
                    if (!idea) return null;
                    const openQuestions = unresolvedQuestions(idea);
                    return (
                      <li key={item.id} className="py-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/companies/${idea.id}`}
                              className="text-sm font-medium hover:text-primary"
                            >
                              {idea.companyName}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {idea.ticker} · Presenter {presenter?.name} · {STAGE_LABELS[idea.stage]} ·{" "}
                              {openQuestions.length} open {openQuestions.length === 1 ? "question" : "questions"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setDossierId((current) => (current === item.id ? "" : item.id))
                              }
                            >
                              {dossierId === item.id ? "Hide dossier" : "Open dossier"}
                            </Button>
                            {!item.decision && selected.status !== "cancelled" ? (
                              <Button size="sm" onClick={() => setDecisionFor(item)}>
                                Record decision
                              </Button>
                            ) : null}
                          </div>
                        </div>
                        {item.decision ? (
                          <p className="mt-2 text-sm leading-5">
                            <span className="font-medium">
                              {DECISION_LABELS[item.decision.type]}.
                            </span>{" "}
                            {item.decision.rationale}
                          </p>
                        ) : null}
                        {dossierId === item.id ? <Dossier item={item} meeting={selected} /> : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Surface>
          </div>
        ) : (
          <EmptyState
            title="No committee meetings"
            body="Schedule a session and add companies from the pipeline."
          />
        )}
      </div>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Decision history</h2>
        <Surface className="overflow-hidden">
          {history.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">No decisions recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {history.map(({ meeting, item }) => {
                const idea = state.ideas.find((entry) => entry.id === item.companyId);
                const actor = memberById(state, item.decision?.decidedBy ?? "");
                if (!item.decision || !idea) return null;
                return (
                  <li key={item.id} className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(item.decision.decidedAt)} · {meeting.title} · {actor?.name}
                    </p>
                    <p className="mt-1 text-sm">
                      <Link href={`/companies/${idea.id}`} className="font-medium hover:text-primary">
                        {idea.companyName}
                      </Link>
                      {" · "}
                      {DECISION_LABELS[item.decision.type]}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {item.decision.rationale}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Surface>
      </section>

      <MeetingDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(input) => {
          const id = createMeeting(input);
          setSelectedId(id);
          setCreating(false);
          toast.success("Meeting scheduled.");
        }}
      />
      {selected ? (
        <AddCompanyDialog
          open={adding}
          meeting={selected}
          onClose={() => setAdding(false)}
          onAdd={(companyId, presenterId) => {
            addAgendaCompany(selected.id, companyId, presenterId);
            setAdding(false);
            toast.success("Company added to the agenda.");
          }}
        />
      ) : null}
      <DecisionDialog
        item={decisionFor}
        onClose={() => setDecisionFor(null)}
        onSave={(input) => {
          if (!selected || !decisionFor) return;
          recordDecision(selected.id, decisionFor.id, input);
          setDecisionFor(null);
          toast.success("Decision recorded.");
        }}
      />
    </div>
  );
}

function Dossier({ item, meeting }: { item: AgendaItem; meeting: CommitteeMeeting }) {
  const { state } = useWorkspace();
  const idea = state.ideas.find((entry) => entry.id === item.companyId);
  if (!idea) return null;
  const presenter = memberById(state, item.presenterId);
  const openQuestions = unresolvedQuestions(idea);
  const currency = state.settings.currency;
  return (
    <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Dossier for {meeting.title}
      </p>
      <p className="mt-1 text-sm">
        Presented by {presenter?.name}. Stage: {STAGE_LABELS[idea.stage]}.
      </p>
      <IllustrativeNote />
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <section>
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Thesis
          </h3>
          <p className="mt-1 text-sm leading-5">{idea.thesis.whyMispriced}</p>
          <p className="mt-2 text-sm leading-5">{idea.thesis.baseCase}</p>
        </section>
        <section>
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Valuation
          </h3>
          <ul className="mt-1 space-y-1 text-sm">
            <li>Price {formatMoney(idea.valuation.currentPrice, currency)}</li>
            <li>
              Bear / base / bull {formatMoney(idea.valuation.bearFairValue, currency)} /{" "}
              {formatMoney(idea.valuation.baseFairValue, currency)} /{" "}
              {formatMoney(idea.valuation.bullFairValue, currency)}
            </li>
            <li>Margin of safety {formatPercent(ideaMargin(idea))}</li>
            <li>Target entry {formatMoney(idea.valuation.targetEntry, currency)}</li>
          </ul>
        </section>
        <section>
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Bull and bear
          </h3>
          <p className="mt-1 text-sm leading-5">{idea.thesis.bullCase}</p>
          <p className="mt-2 text-sm leading-5">{idea.thesis.bearCase}</p>
        </section>
        <section>
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Main risks
          </h3>
          <p className="mt-1 text-sm leading-5">{idea.thesis.mainRisks}</p>
        </section>
      </div>
      <section className="mt-3">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Unresolved questions
        </h3>
        {openQuestions.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">None.</p>
        ) : (
          <ul className="mt-1 list-disc pl-4 text-sm leading-5">
            {openQuestions.map((question) => (
              <li key={question.id}>{question.question}</li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-3">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Documents to review
        </h3>
        {idea.documents.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">No illustrative records stored.</p>
        ) : (
          <ul className="mt-1 space-y-1 text-sm">
            {idea.documents.map((document) => (
              <li key={document.id}>
                {document.title} · {DOCUMENT_TYPE_LABELS[document.type]} ·{" "}
                {formatDate(document.publicationDate)}
              </li>
            ))}
          </ul>
        )}
        {!idea.documents.some((document) => document.type === "valuation_model") ? (
          <p className="mt-2 text-sm text-[#7f2424]">
            The valuation model is not in the file. That gap is visible to the committee on purpose.
          </p>
        ) : null}
      </section>
    </div>
  );
}

function MeetingDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { title: string; scheduledAt: string; location: string; notes: string }) => void;
}) {
  const [title, setTitle] = useState("Investment Committee");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("Amsterdam office, Room 3");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule a meeting</DialogTitle>
          <DialogDescription>
            Creates a session in this browser. It does not send invitations.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="Title" htmlFor="meet-title" error={error}>
            <Input id="meet-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" htmlFor="meet-date">
              <Input id="meet-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </Field>
            <Field label="Time" htmlFor="meet-time">
              <Input id="meet-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </Field>
          </div>
          <Field label="Location" htmlFor="meet-location">
            <Input
              id="meet-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </Field>
          <Field label="Notes" htmlFor="meet-notes">
            <Textarea id="meet-notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (title.trim().length < 3 || !date) {
                setError("A title and a date are required.");
                return;
              }
              onCreate({
                title,
                scheduledAt: new Date(`${date}T${time || "09:00"}`).toISOString(),
                location,
                notes,
              });
            }}
          >
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddCompanyDialog({
  open,
  meeting,
  onClose,
  onAdd,
}: {
  open: boolean;
  meeting: CommitteeMeeting;
  onClose: () => void;
  onAdd: (companyId: string, presenterId: string) => void;
}) {
  const { state } = useWorkspace();
  const candidates = state.ideas.filter(
    (idea) =>
      idea.stage !== "rejected" &&
      idea.stage !== "invested" &&
      !meeting.agenda.some((item) => item.companyId === idea.id),
  );
  const [companyId, setCompanyId] = useState(candidates[0]?.id ?? "");
  const [presenterId, setPresenterId] = useState(state.settings.actingUserId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const first = state.ideas.find(
      (idea) =>
        idea.stage !== "rejected" &&
        idea.stage !== "invested" &&
        !meeting.agenda.some((item) => item.companyId === idea.id),
    );
    setCompanyId(first?.id ?? "");
    setPresenterId(state.settings.actingUserId);
    setError("");
  }, [open, meeting, state.ideas, state.settings.actingUserId]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a company</DialogTitle>
          <DialogDescription>Choose an active research idea and a presenting analyst.</DialogDescription>
        </DialogHeader>
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">Every active idea is already on this agenda.</p>
        ) : (
          <div className="grid gap-3">
            <Field label="Company" htmlFor="agenda-company" error={error}>
              <NativeSelect
                id="agenda-company"
                value={companyId}
                onChange={setCompanyId}
                options={candidates.map((idea) => ({
                  value: idea.id,
                  label: `${idea.companyName} (${idea.ticker})`,
                }))}
              />
            </Field>
            <Field label="Presenting analyst" htmlFor="agenda-presenter">
              <NativeSelect
                id="agenda-presenter"
                value={presenterId}
                onChange={setPresenterId}
                options={state.team.map((member) => ({ value: member.id, label: member.name }))}
              />
            </Field>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={candidates.length === 0}
            onClick={() => {
              if (!companyId) {
                setError("Choose a company.");
                return;
              }
              onAdd(companyId, presenterId);
            }}
          >
            Add to agenda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DecisionDialog({
  item,
  onClose,
  onSave,
}: {
  item: AgendaItem | null;
  onClose: () => void;
  onSave: (input: { type: DecisionType; rationale: string; waitKind?: WaitKind }) => void;
}) {
  const { state } = useWorkspace();
  const idea = state.ideas.find((entry) => entry.id === item?.companyId);
  const [type, setType] = useState<DecisionType>("request_research");
  const [rationale, setRationale] = useState("");
  const [waitKind, setWaitKind] = useState<WaitKind>("price");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!item) return;
    setType("request_research");
    setRationale("");
    setWaitKind("price");
    setError("");
  }, [item]);

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a decision</DialogTitle>
          <DialogDescription>
            {idea
              ? `${idea.companyName}. A written rationale is required. Requesting more research, adding to the watchlist, rejecting, or approving as a candidate also updates the idea’s stage.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="Decision" htmlFor="decision-type">
            <NativeSelect
              id="decision-type"
              value={type}
              onChange={(value) => setType(value as DecisionType)}
              options={DECISION_TYPES.map((decision) => ({
                value: decision,
                label: DECISION_LABELS[decision],
              }))}
            />
          </Field>
          {type === "add_watchlist" ? (
            <Field label="Watchlist reason type" htmlFor="decision-wait">
              <NativeSelect
                id="decision-wait"
                value={waitKind}
                onChange={(value) => setWaitKind(value as WaitKind)}
                options={(Object.keys(WAIT_KIND_LABELS) as WaitKind[]).map((kind) => ({
                  value: kind,
                  label: WAIT_KIND_LABELS[kind],
                }))}
              />
            </Field>
          ) : null}
          <Field label="Rationale" htmlFor="decision-rationale" error={error}>
            <Textarea
              id="decision-rationale"
              className="min-h-28"
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (rationale.trim().length < 20) {
                setError("Write a rationale of at least 20 characters.");
                return;
              }
              onSave({
                type,
                rationale,
                waitKind: type === "add_watchlist" ? waitKind : undefined,
              });
            }}
          >
            Record decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
