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
        "rounded-lg border border-border bg-card shadow-[0_1px_2px_rgba(28,25,23,0.04)]",
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
    <div className="mb-5 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">
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
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
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
        "h-8 w-full rounded-lg border border-input bg-card px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
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
  high: "bg-[#e6f0ea] text-[#164834]",
  medium: "bg-[#f6f1e6] text-[#6d5420]",
  low: "bg-muted text-muted-foreground",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium",
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
      ? "bg-[#f8ecec] text-[#7f2424]"
      : stage === "invested" || stage === "portfolio_candidate"
        ? "bg-[#e6f0ea] text-[#164834]"
        : "bg-secondary text-secondary-foreground";
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium",
        tone,
      )}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}

export function ConvictionBadge({ conviction }: { conviction: Conviction }) {
  return (
    <span className="inline-flex h-5 items-center rounded-md bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
      {CONVICTION_LABELS[conviction]} conviction
    </span>
  );
}

export function ThesisStatusBadge({ status }: { status: ThesisStatus }) {
  const tone =
    status === "stale" || status === "invalidated"
      ? "bg-[#f8ecec] text-[#7f2424]"
      : status === "under_review"
        ? "bg-[#f6f1e6] text-[#6d5420]"
        : status === "active"
          ? "bg-[#e6f0ea] text-[#164834]"
          : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium",
        tone,
      )}
    >
      {THESIS_STATUS_LABELS[status]}
    </span>
  );
}

export function IllustrativeNote({ children }: { children?: ReactNode }) {
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      {children ??
        "Illustrative demo figures. Not a live price and not an investment recommendation."}
    </p>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-8 w-48 rounded-md bg-muted" />
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-lg bg-card ring-1 ring-border" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-card ring-1 ring-border" />
      <p className="text-sm text-muted-foreground">Loading the demo workspace…</p>
    </div>
  );
}
