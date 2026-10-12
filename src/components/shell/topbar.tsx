"use client";

import { Copy, Menu } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SidebarNav } from "@/components/shell/sidebar";
import { NativeSelect } from "@/components/common/ui-bits";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { copyCurrentUrl } from "@/lib/export";
import { useWorkspace } from "@/lib/store";

export function TopBar() {
  const { state, updateSettings } = useWorkspace();
  const [open, setOpen] = useState(false);
  const acting = state.team.find((member) => member.id === state.settings.actingUserId);

  async function copyLink() {
    const ok = await copyCurrentUrl();
    if (ok) toast.success("Page link copied.");
    else toast.error("The link could not be copied from this browser.");
  }

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-3 overflow-hidden border-b border-border bg-background/95 px-4 sm:px-6">
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
      >
        <Menu />
      </Button>
      <p className="hidden min-w-0 text-xs text-muted-foreground sm:block">
        <span className="font-medium text-foreground">Demo data</span>
        <span className="px-1.5">·</span>
        Illustrative figures, not investment advice
      </p>
      <p className="text-xs font-medium text-foreground sm:hidden">Demo data</p>
      <div className="ml-auto flex items-center gap-2">
        <label className="sr-only" htmlFor="acting-user">
          Acting as
        </label>
        <span className="hidden text-xs text-muted-foreground md:inline">Acting as</span>
        <NativeSelect
          id="acting-user"
          ariaLabel="Acting as"
          className="w-40"
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
          <Copy data-icon="inline-start" />
          Copy link
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-60 bg-sidebar p-0 sm:max-w-60">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
