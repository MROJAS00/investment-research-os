"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { LoadingState } from "@/components/common/ui-bits";
import { Sidebar } from "@/components/shell/sidebar";
import { TopBar } from "@/components/shell/topbar";
import { useStore } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, state, loadNote } = useStore();

  useEffect(() => {
    if (loadNote) toast.error(loadNote);
  }, [loadNote]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-[var(--radius)] focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      {ready && state ? (
        <>
          <Sidebar />
          <div className="min-w-0 lg:pl-[13.5rem]">
            <TopBar />
            <main
              id="main"
              className="page-enter mx-auto w-full max-w-[1440px] min-w-0 overflow-x-hidden px-4 py-5 sm:px-6 lg:px-7"
            >
              {children}
            </main>
          </div>
        </>
      ) : (
        <main id="main" className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
          <LoadingState />
        </main>
      )}
    </div>
  );
}
