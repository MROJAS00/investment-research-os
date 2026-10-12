import { cn } from "cn";
import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import {
  CONVICTION_LABELS,
  PRIORITY_LABELS,
  STAGE_LABELS,
  THESIS_STATUS_LABELS,
} from "@/lib/labels";
import type { Conviction, Priority, Stage, ThesisStatus } from "@/lib/types";

export function Surface({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-border bg-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-rule pb-3.5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-heading text-[1.55rem] leading-tight font-semibold tracking-[-0.01em] text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Surface className="px-6 py-10 text-center">
      <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </Surface>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function NativeSelect({
  id,
  value,
  onChange,
  options,
  ariaLabel,
  className,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "h-8 w-full rounded-[var(--radius)] border border-input bg-card px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

const priorityClass: Record<Priority, string> = {
  high: "border-primary/35 bg-ink-wash text-primary",
  medium: "border-[#6b5e45]/30 bg-amber-wash text-[#4f4638]",
  low: "border-border bg-muted/70 text-muted-foreground",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-[2px] border px-1.5 font-mono text-[10px] tracking-[0.04em] uppercase",
        priorityClass[priority],
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function StageBadge({ stage }: { stage: Stage }) {
  const tone =
    stage === "rejected"
      ? "border-destructive/30 bg-rose-wash text-[#7f2424]"
      : stage === "invested" || stage === "portfolio_candidate"
        ? "border-primary/30 bg-ink-wash text-primary"
        : "border-border bg-secondary text-secondary-foreground";
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-[2px] border px-1.5 font-mono text-[10px] tracking-[0.04em] uppercase",
        tone,
      )}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}

export function ConvictionBadge({ conviction }: { conviction: Conviction }) {
  return (
    <span className="inline-flex h-5 items-center rounded-[2px] border border-border bg-muted/70 px-1.5 font-mono text-[10px] tracking-[0.04em] text-muted-foreground uppercase">
      {CONVICTION_LABELS[conviction]}
    </span>
  );
}

export function ThesisStatusBadge({ status }: { status: ThesisStatus }) {
  const tone =
    status === "stale" || status === "invalidated"
      ? "border-destructive/30 bg-rose-wash text-[#7f2424]"
      : status === "under_review"
        ? "border-[#6b5e45]/30 bg-amber-wash text-[#4f4638]"
        : status === "active"
          ? "border-primary/30 bg-ink-wash text-primary"
          : "border-border bg-muted/70 text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-[2px] border px-1.5 font-mono text-[10px] tracking-[0.04em] uppercase",
        tone,
      )}
    >
      {THESIS_STATUS_LABELS[status]}
    </span>
  );
}

export function IllustrativeNote({ children }: { children?: ReactNode }) {
  return (
    <p className="text-[12px] leading-5 text-muted-foreground">
      {children ??
        "Illustrative demo figures. Not a live price and not an investment recommendation."}
    </p>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-4 page-enter" aria-busy="true" aria-live="polite">
      <div className="h-7 w-40 bg-muted" />
      <div className="h-14 border border-border bg-card" />
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <div className="h-56 border border-border bg-card" />
        <div className="h-56 border border-border bg-card" />
      </div>
      <p className="text-sm text-muted-foreground">Loading the demo workspace…</p>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
      {children}
    </h2>
  );
}
