import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/ui-bits";
import { PipelineView } from "@/components/views/pipeline-view";

export const metadata: Metadata = { title: "Idea Pipeline" };

export default function PipelinePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PipelineView />
    </Suspense>
  );
}
