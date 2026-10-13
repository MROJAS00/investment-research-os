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
    <div className={cn("rounded-[var(--radius)] border border-rule bg-paper", className)}>
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
    <div className="mb-5 flex flex-col gap-2 pb-1 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[12px] font-medium tracking-tight text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[1.4rem] leading-tight font-semibold tracking-tight text-foreground">
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
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-5 text-muted-foreground">{body}</p>
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
      <Label htmlFor={htmlFor} className="text-[12px] font-medium tracking-tight">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
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
        "h-8 w-full rounded-[var(--radius)] border border-input bg-paper px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50",
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

/** Plain typographic mark — no pills, no filled chips. */
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className="mark-priority" data-level={priority}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className="text-[12px] font-medium tracking-tight text-foreground/80">
      {STAGE_LABELS[stage]}
    </span>
  );
}

export function ConvictionBadge({ conviction }: { conviction: Conviction }) {
  return (
    <span className="text-[12px] font-medium tracking-tight text-muted-foreground">
      {CONVICTION_LABELS[conviction]}
    </span>
  );
}

export function ThesisStatusBadge({ status }: { status: ThesisStatus }) {
  const emphasis =
    status === "stale" || status === "invalidated"
      ? "text-destructive"
      : status === "under_review"
        ? "text-[#4a5563]"
        : status === "active"
          ? "text-primary"
          : "text-muted-foreground";
  return (
    <span className={cn("text-[12px] font-medium tracking-tight", emphasis)}>
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
      <div className="h-7 w-44 bg-muted/80" />
      <div className="h-12 border border-rule bg-paper" />
      <div className="h-64 border border-rule bg-paper" />
      <p className="text-sm text-muted-foreground">Loading the demo workspace…</p>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2.5 text-[13px] font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  );
}
