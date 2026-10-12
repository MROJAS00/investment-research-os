import type { Metadata } from "next";
import { CommitteeView } from "@/components/views/committee-view";

export const metadata: Metadata = { title: "Investment Committee" };

export default function CommitteePage() {
  return <CommitteeView />;
}
