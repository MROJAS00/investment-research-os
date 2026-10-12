"use client";

import { cn } from "cn";
import {
  Bookmark,
  LayoutDashboard,
  Scale,
  Settings,
  Users,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@/lib/store";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/pipeline", label: "Idea Pipeline", icon: Workflow },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/committee", label: "Investment Committee", icon: Scale },
  { href: "/team", label: "Team & Research", icon: Users },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { state } = useWorkspace();

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-5 pb-4">
        <Link href="/dashboard" className="block" onClick={onNavigate}>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Longview
          </span>
          <span className="mt-1 block text-xs leading-4 text-muted-foreground">
            {state.settings.workspaceName}
          </span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-2" aria-label="Primary">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-foreground/80 hover:bg-muted",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-sidebar-border p-3">
        <p className="px-1 pb-2 text-[11px] leading-4 text-muted-foreground">
          Demo data. Companies, people, and figures are fictional.
        </p>
        <Link
          href="/settings"
          onClick={onNavigate}
          aria-current={pathname === "/settings" ? "page" : undefined}
          className={cn(
            "flex h-9 items-center gap-2.5 rounded-md px-2 text-sm",
            pathname === "/settings"
              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "text-foreground/80 hover:bg-muted",
          )}
        >
          <Settings className="size-4" aria-hidden="true" />
          Settings
        </Link>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-sidebar-border bg-sidebar lg:block">
      <SidebarNav />
    </aside>
  );
}
