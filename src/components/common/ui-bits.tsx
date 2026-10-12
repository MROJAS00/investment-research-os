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
    <div className={cn("border border-rule bg-paper", className)}>
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
    <div className="mb-5 flex flex-col gap-3 border-b border-foreground/25 pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-heading text-[1.7rem] leading-[1.15] font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl font-serif text-[14px] leading-6 text-foreground/75">
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
      <p className="mx-auto mt-1 max-w-md font-serif text-sm leading-6 text-foreground/70">{body}</p>
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
      <Label htmlFor={htmlFor} className="font-mono text-[11px] tracking-[0.06em] uppercase">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="font-serif text-xs leading-5 text-muted-foreground">{hint}</p>
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
        "h-8 w-full border border-input bg-paper px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
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
    <span className="font-mono text-[10px] tracking-[0.08em] text-foreground/80 uppercase">
      {STAGE_LABELS[stage]}
    </span>
  );
}

export function ConvictionBadge({ conviction }: { conviction: Conviction }) {
  return (
    <span className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
      {CONVICTION_LABELS[conviction]}
    </span>
  );
}

export function ThesisStatusBadge({ status }: { status: ThesisStatus }) {
  const emphasis =
    status === "stale" || status === "invalidated"
      ? "text-destructive"
      : status === "under_review"
        ? "text-[#5a4a32]"
        : status === "active"
          ? "text-primary"
          : "text-muted-foreground";
  return (
    <span className={cn("font-mono text-[10px] tracking-[0.08em] uppercase", emphasis)}>
      {THESIS_STATUS_LABELS[status]}
    </span>
  );
}

export function IllustrativeNote({ children }: { children?: ReactNode }) {
  return (
    <p className="font-serif text-[12.5px] leading-5 text-muted-foreground">
      {children ??
        "Illustrative demo figures. Not a live price and not an investment recommendation."}
    </p>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-4 page-enter" aria-busy="true" aria-live="polite">
      <div className="h-8 w-48 bg-muted/80" />
      <div className="h-12 border border-rule bg-paper" />
      <div className="h-64 border border-rule bg-paper" />
      <p className="font-serif text-sm text-muted-foreground">Loading the demo workspace…</p>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 font-heading text-[1.05rem] font-semibold tracking-[-0.015em] text-foreground">
      {children}
    </h2>
  );
}
