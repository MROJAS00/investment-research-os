"use client";

import Link from "next/link";
import {
  PageHeader,
  PriorityBadge,
  SectionLabel,
  Surface,
} from "@/components/common/ui-bits";
import { formatDate } from "@/lib/format";
import { EVENT_KIND_LABELS, STAGE_LABELS } from "@/lib/labels";
import {
  attentionItems,
  calendarEntries,
  countByStage,
  dashboardMetrics,
  memberById,
  recentTheses,
} from "@/lib/metrics";
import { useWorkspace } from "@/lib/store";
import { ACTIVE_STAGES, type Stage } from "@/lib/types";

export function DashboardView() {
  const { state } = useWorkspace();
  const metrics = dashboardMetrics(state);
  const attention = attentionItems(state.ideas);
  const counts = countByStage(state.ideas);
  const theses = recentTheses(state.ideas);
  const events = calendarEntries(state).slice(0, 8);

  const supporting = [
    {
      label: "Active ideas",
      value: metrics.activeIdeas,
      href: "/pipeline",
    },
    {
      label: "Deep research",
      value: metrics.deepResearch,
      href: "/pipeline?stage=deep_research",
    },
    {
      label: "Upcoming IC",
      value: metrics.upcomingCommittee,
      href: "/committee",
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={state.settings.workspaceName}
        title="Overview"
        description="What needs a portfolio manager’s attention today. Every count is calculated from the ideas, questions, and meetings in this workspace."
      />

      {/* Asymmetric blotter: one dominant figure + inline ticker — not a 4-up card grid */}
      <div className="ticker-strip flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-end sm:gap-8">
        <Link
          href="/pipeline?overdue=1"
          className="group metric-pulse min-w-0 sm:max-w-xs sm:border-r sm:border-rule sm:pr-8"
        >
          <p className="text-[12px] font-medium tracking-tight text-muted-foreground">
            Awaiting analyst action
          </p>
          <p className="mt-1.5 text-[3.1rem] leading-none font-semibold tabular-nums tracking-tight text-primary transition-colors group-hover:text-[#066872]">
            {metrics.awaitingAction}
          </p>
          <p className="mt-2 text-[13px] leading-5 text-foreground/70">
            Active ideas with a research question past its due date.
          </p>
        </Link>
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-7 gap-y-2 sm:pb-1">
          {supporting.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex items-baseline gap-2 border-b border-transparent transition-colors hover:border-primary/50"
            >
              <span className="text-[12px] font-medium tracking-tight text-muted-foreground">
                {item.label}
              </span>
              <span className="text-[1.35rem] font-semibold tabular-nums leading-none">
                {item.value}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-7 grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,0.8fr)]">
        <section className="min-w-0">
          <SectionLabel>Priority attention</SectionLabel>
          <Surface className="overflow-hidden">
            {attention.length === 0 ? (
              <p className="px-4 py-8 text-sm text-muted-foreground">
                Nothing in the current dataset trips a review, earnings, entry,
                or missing-document rule.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="border-b border-rule text-left text-[12px] text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2.5 font-medium">Company</th>
                      <th className="px-3 py-2.5 font-medium">Reason</th>
                      <th className="px-3 py-2.5 font-medium">Owner</th>
                      <th className="px-3 py-2.5 font-medium">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attention.map((item) => {
                      const idea = state.ideas.find(
                        (entry) => entry.id === item.companyId,
                      );
                      const owner = memberById(state, item.ownerId);
                      if (!idea) return null;
                      return (
                        <tr
                          key={item.id}
                          className="blotter-row border-b border-rule/70 last:border-0"
                        >
                          <td className="px-3 py-2.5 align-top">
                            <Link
                              href={`/companies/${idea.id}`}
                              className="text-[13px] font-semibold tracking-tight hover:text-primary"
                            >
                              {idea.companyName}
                            </Link>
                            <div className="font-mono text-[11px] text-muted-foreground">
                              {idea.ticker}
                            </div>
                          </td>
                          <td className="max-w-md px-3 py-2.5 align-top text-[13px] leading-5 whitespace-normal text-foreground/75">
                            {item.reason}
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap text-[13px]">
                            {owner?.name ?? "—"}
                          </td>
                          <td className="px-3 py-2.5 align-top">
                            <PriorityBadge priority={item.priority} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Surface>
        </section>

        <section className="min-w-0">
          <SectionLabel>Upcoming events</SectionLabel>
          <ul className="divide-y divide-rule overflow-hidden rounded-[var(--radius)] border border-rule bg-paper">
            {events.map((event) => (
              <li key={event.id} className="blotter-row px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13px] font-semibold tracking-tight">
                    {event.companyId ? (
                      <Link
                        href={`/companies/${event.companyId}`}
                        className="hover:text-primary"
                      >
                        {event.title}
                      </Link>
                    ) : event.meetingId ? (
                      <Link href="/committee" className="hover:text-primary">
                        {event.title}
                      </Link>
                    ) : (
                      event.title
                    )}
                  </p>
                  <time className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                    {formatDate(event.date)}
                  </time>
                </div>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {EVENT_KIND_LABELS[event.kind]}
                  {event.overdue ? " · Overdue" : ""}
                  {event.detail ? ` · ${event.detail}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8">
        <SectionLabel>Research pipeline</SectionLabel>
        <div className="ticker-strip flex flex-wrap items-baseline gap-x-5 gap-y-2 px-3 py-2.5">
          {ACTIVE_STAGES.map((stage) => (
            <StageCount key={stage} stage={stage} count={counts[stage]} />
          ))}
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">
          Historical outcomes: {counts.invested} invested, {counts.rejected}{" "}
          rejected. Those are filters, not active columns.
        </p>
      </section>

      <section className="mt-8 min-w-0">
        <SectionLabel>Recently updated theses</SectionLabel>
        <Surface className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b border-rule text-left text-[12px] text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Company</th>
                  <th className="px-3 py-2.5 font-medium">Analyst</th>
                  <th className="px-3 py-2.5 font-medium">Updated</th>
                  <th className="px-3 py-2.5 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {theses.map((idea) => {
                  const analyst = memberById(state, idea.leadAnalystId);
                  return (
                    <tr
                      key={idea.id}
                      className="blotter-row border-b border-rule/70 last:border-0"
                    >
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/companies/${idea.id}?tab=thesis`}
                          className="text-[13px] font-semibold tracking-tight hover:text-primary"
                        >
                          {idea.companyName}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap ">
                        {analyst?.name}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-[12px] text-muted-foreground">
                        {formatDate(idea.thesis.lastEditedAt)}
                      </td>
                      <td className="px-3 py-2.5 text-[13px] leading-5 whitespace-normal text-foreground/75">
                        {idea.thesis.changeSummary}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Surface>
      </section>
    </div>
  );
}

function StageCount({ stage, count }: { stage: Stage; count: number }) {
  return (
    <Link
      href={`/pipeline?stage=${stage}`}
      className="inline-flex items-baseline gap-1.5 border-b border-transparent hover:border-foreground/40"
    >
      <span className="text-lg font-semibold tabular-nums leading-none">
        {count}
      </span>
      <span className="text-[12px] font-medium tracking-tight text-muted-foreground">
        {STAGE_LABELS[stage]}
      </span>
    </Link>
  );
}
