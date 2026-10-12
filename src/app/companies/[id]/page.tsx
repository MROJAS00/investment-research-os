import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/common/ui-bits";
import { CompanyView } from "@/components/views/company-view";

export const metadata: Metadata = { title: "Company" };

export default function CompanyPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CompanyView />
    </Suspense>
  );
}
