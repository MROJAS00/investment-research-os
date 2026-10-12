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

  const cards = [
    {
      label: "Active ideas",
      value: metrics.activeIdeas,
      detail: "Excludes invested and rejected",
      href: "/pipeline",
    },
    {
      label: "Deep research",
      value: metrics.deepResearch,
      detail: "In deep-research stage",
      href: "/pipeline?stage=deep_research",
    },
    {
      label: "Upcoming IC",
      value: metrics.upcomingCommittee,
      detail: "Sessions still ahead",
      href: "/committee",
    },
    {
      label: "Awaiting action",
      value: metrics.awaitingAction,
      detail: "Overdue research questions",
      href: "/pipeline?overdue=1",
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={state.settings.workspaceName}
        title="Overview"
        description="What needs a portfolio manager’s attention today. Every count is calculated from the ideas, questions, and meetings in this workspace."
      />

      <Surface className="overflow-hidden">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="metric-cell blotter-row block px-4 py-3 focus-visible:outline-none"
            >
              <p className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
                {card.label}
              </p>
              <p className="mt-1 font-heading text-[1.75rem] leading-none font-semibold tabular-nums tracking-tight">
                {card.value}
              </p>
              <p className="mt-1.5 text-[12px] leading-4 text-muted-foreground">{card.detail}</p>
            </Link>
          ))}
        </div>
      </Surface>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)]">
        <section className="min-w-0">
          <SectionLabel>Priority attention</SectionLabel>
          <Surface className="overflow-hidden">
            {attention.length === 0 ? (
              <p className="px-4 py-8 text-sm text-muted-foreground">
                Nothing in the current dataset trips a review, earnings, entry, or missing-document rule.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="border-b border-rule text-left font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
                    <tr>
                      <th className="px-3 py-2 font-medium">Company</th>
                      <th className="px-3 py-2 font-medium">Reason</th>
                      <th className="px-3 py-2 font-medium">Owner</th>
                      <th className="px-3 py-2 font-medium">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attention.map((item) => {
                      const idea = state.ideas.find((entry) => entry.id === item.companyId);
                      const owner = memberById(state, item.ownerId);
                      if (!idea) return null;
                      return (
                        <tr key={item.id} className="blotter-row border-b border-border/80 last:border-0">
                          <td className="px-3 py-2.5 align-top">
                            <Link
                              href={`/companies/${idea.id}`}
                              className="font-medium text-foreground hover:text-primary"
                            >
                              {idea.companyName}
                            </Link>
                            <div className="font-mono text-[11px] text-muted-foreground">
                              {idea.ticker}
                            </div>
                          </td>
                          <td className="max-w-md px-3 py-2.5 align-top whitespace-normal text-muted-foreground">
                            {item.reason}
                          </td>
                          <td className="px-3 py-2.5 align-top whitespace-nowrap">
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
          <Surface>
            <ul className="divide-y divide-border/80">
              {events.map((event) => (
                <li key={event.id} className="blotter-row px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[13px] font-medium">
                      {event.companyId ? (
                        <Link href={`/companies/${event.companyId}`} className="hover:text-primary">
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
          </Surface>
        </section>
      </div>

      <section className="mt-6">
        <SectionLabel>Research pipeline</SectionLabel>
        <Surface className="overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
            {ACTIVE_STAGES.map((stage) => (
              <StageCount key={stage} stage={stage} count={counts[stage]} />
            ))}
          </div>
        </Surface>
        <p className="mt-2 text-[12px] text-muted-foreground">
          Historical outcomes: {counts.invested} invested, {counts.rejected} rejected. Those are filters, not active columns.
        </p>
      </section>

      <section className="mt-6 min-w-0">
        <SectionLabel>Recently updated theses</SectionLabel>
        <Surface className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b border-rule text-left font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Company</th>
                  <th className="px-3 py-2 font-medium">Analyst</th>
                  <th className="px-3 py-2 font-medium">Updated</th>
                  <th className="px-3 py-2 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {theses.map((idea) => {
                  const analyst = memberById(state, idea.leadAnalystId);
                  return (
                    <tr key={idea.id} className="blotter-row border-b border-border/80 last:border-0">
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/companies/${idea.id}?tab=thesis`}
                          className="font-medium hover:text-primary"
                        >
                          {idea.companyName}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{analyst?.name}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-[12px] text-muted-foreground">
                        {formatDate(idea.thesis.lastEditedAt)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-normal text-muted-foreground">
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
      className="metric-cell blotter-row block px-3 py-2.5 focus-visible:outline-none"
    >
      <p className="font-heading text-xl font-semibold tabular-nums leading-none">{count}</p>
      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{STAGE_LABELS[stage]}</p>
    </Link>
  );
}
