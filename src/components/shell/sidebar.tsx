"use client";

import { cn } from "cn";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { NativeSelect } from "@/components/common/ui-bits";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { copyCurrentUrl } from "@/lib/export";
import { useWorkspace } from "@/lib/store";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/committee", label: "Committee" },
  { href: "/team", label: "Team" },
  { href: "/settings", label: "Settings" },
];

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className={cn("flex flex-wrap items-baseline gap-x-5 gap-y-1", className)}>
      {NAV.map((item) => {
        const active =
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`) ||
          (item.href === "/pipeline" && pathname.startsWith("/companies/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-[13px] tracking-tight transition-colors",
              active
                ? "font-semibold text-primary"
                : "text-foreground/65 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Research masthead — no dark product sidebar. */
export function ResearchMasthead() {
  const { state, updateSettings } = useWorkspace();
  const [open, setOpen] = useState(false);
  const acting = state.team.find((member) => member.id === state.settings.actingUserId);

  async function copyLink() {
    const ok = await copyCurrentUrl();
    if (ok) toast.success("Page link copied.");
    else toast.error("The link could not be copied from this browser.");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur-[1px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-end gap-x-6 gap-y-2 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <Link
              href="/dashboard"
              className="wordmark text-[1.55rem] leading-none font-semibold tracking-[-0.02em] text-foreground"
            >
              Longview
            </Link>
            <span className="hidden font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase sm:inline">
              {state.settings.workspaceName}
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
            Research console · illustrative figures
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
          <label className="sr-only" htmlFor="acting-user">
            Acting as
          </label>
          <span className="hidden text-xs text-muted-foreground md:inline">Acting as</span>
          <NativeSelect
            id="acting-user"
            ariaLabel="Acting as"
            className="w-40 bg-paper"
            value={state.settings.actingUserId}
            onChange={(value) => updateSettings({ actingUserId: value })}
            options={state.team.map((member) => ({
              value: member.id,
              label: member.name,
            }))}
          />
          <span className="sr-only">
            Current acting user is {acting?.name}. Permissions are simulated.
          </span>
          <Button variant="outline" size="sm" onClick={copyLink}>
            Copy link
          </Button>
        </div>
      </div>

      <div className="border-t border-rule/80 bg-[color-mix(in_srgb,var(--paper)_94%,white)]">
        <div className="mx-auto hidden w-full max-w-[1440px] items-center px-4 py-1.5 sm:px-6 lg:flex lg:px-8">
          <NavLinks />
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="top" className="border-b border-rule bg-paper p-4">
          <SheetTitle className="text-base font-semibold">Navigate</SheetTitle>
          <NavLinks className="mt-4 flex-col items-start gap-3" onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return <NavLinks onNavigate={onNavigate} className="flex-col items-start gap-3 p-4" />;
}

export function Sidebar() {
  return null;
}
