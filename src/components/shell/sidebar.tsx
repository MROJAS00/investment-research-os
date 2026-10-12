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
      <div className="border-b border-sidebar-border px-4 pt-5 pb-4">
        <Link href="/dashboard" className="block" onClick={onNavigate}>
          <span className="font-heading text-[1.35rem] leading-none font-semibold tracking-[-0.02em] text-sidebar-accent-foreground">
            Longview
          </span>
          <span className="mt-2 block font-mono text-[10px] tracking-[0.1em] text-sidebar-foreground/65 uppercase">
            {state.settings.workspaceName}
          </span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-2 pt-3" aria-label="Primary">
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
                "group flex h-8 items-center gap-2.5 border-l-2 px-2.5 text-[13px] transition-colors",
                active
                  ? "border-sidebar-primary bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "border-transparent text-sidebar-foreground/80 hover:border-sidebar-border hover:bg-sidebar-accent/55 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-sidebar-border p-3">
        <p className="px-1 pb-2 font-mono text-[10px] leading-4 tracking-[0.04em] text-sidebar-foreground/55 uppercase">
          Demo figures · fictional names
        </p>
        <Link
          href="/settings"
          onClick={onNavigate}
          aria-current={pathname === "/settings" ? "page" : undefined}
          className={cn(
            "flex h-8 items-center gap-2.5 border-l-2 px-2 text-[13px] transition-colors",
            pathname === "/settings"
              ? "border-sidebar-primary bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "border-transparent text-sidebar-foreground/80 hover:border-sidebar-border hover:bg-sidebar-accent/55 hover:text-sidebar-accent-foreground",
          )}
        >
          <Settings className="size-3.5" aria-hidden="true" />
          Settings
        </Link>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[13.5rem] border-r border-sidebar-border bg-sidebar lg:block">
      <SidebarNav />
    </aside>
  );
}
