"use client";

import { cn } from "cn";
import Link from "next/link";
import { PageHeader, PriorityBadge, Surface } from "@/components/common/ui-bits";
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
      detail: "Excludes invested and rejected outcomes.",
      href: "/pipeline",
    },
    {
      label: "Deep research",
      value: metrics.deepResearch,
      detail: "Companies in the deep-research stage.",
      href: "/pipeline?stage=deep_research",
    },
    {
      label: "Upcoming committee",
      value: metrics.upcomingCommittee,
      detail: "Scheduled sessions still ahead.",
      href: "/committee",
    },
    {
      label: "Awaiting analyst action",
      value: metrics.awaitingAction,
      detail: "Active ideas with a research question past its due date.",
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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="group block">
            <Surface className="h-full px-4 py-3 transition-colors group-hover:border-primary/40">
              <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
                {card.value}
              </p>
              <p className="mt-1 text-xs leading-4 text-muted-foreground">{card.detail}</p>
            </Surface>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <section className="min-w-0">
          <h2 className="mb-2 text-sm font-semibold">Priority attention</h2>
          <Surface className="overflow-hidden">
            {attention.length === 0 ? (
              <p className="px-4 py-8 text-sm text-muted-foreground">
                Nothing in the current dataset trips a review, earnings, entry, or missing-document rule.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-xs text-muted-foreground">
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
                        <tr key={item.id} className="border-b border-border last:border-0">
                          <td className="px-3 py-2.5 align-top">
                            <Link
                              href={`/companies/${idea.id}`}
                              className="font-medium text-foreground hover:text-primary"
                            >
                              {idea.companyName}
                            </Link>
                            <div className="text-xs text-muted-foreground">{idea.ticker}</div>
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
          <h2 className="mb-2 text-sm font-semibold">Upcoming events</h2>
          <Surface>
            <ul className="divide-y divide-border">
              {events.map((event) => (
                <li key={event.id} className="px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium">
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
                    <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatDate(event.date)}
                    </time>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
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
        <h2 className="mb-2 text-sm font-semibold">Research pipeline</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
          {ACTIVE_STAGES.map((stage) => (
            <StageCount key={stage} stage={stage} count={counts[stage]} />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Historical outcomes: {counts.invested} invested, {counts.rejected} rejected. Those are filters, not active columns.
        </p>
      </section>

      <section className="mt-6 min-w-0">
        <h2 className="mb-2 text-sm font-semibold">Recently updated theses</h2>
        <Surface className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs text-muted-foreground">
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
                    <tr key={idea.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/companies/${idea.id}?tab=thesis`}
                          className="font-medium hover:text-primary"
                        >
                          {idea.companyName}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{analyst?.name}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
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
    <Link href={`/pipeline?stage=${stage}`} className="group">
      <Surface
        className={cn(
          "px-3 py-2.5 transition-colors group-hover:border-primary/40",
        )}
      >
        <p className="text-lg font-semibold tabular-nums">{count}</p>
        <p className="text-xs leading-4 text-muted-foreground">{STAGE_LABELS[stage]}</p>
      </Surface>
    </Link>
  );
}
