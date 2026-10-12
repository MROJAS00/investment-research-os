import type { Metadata } from "next";
import { TeamView } from "@/components/views/team-view";

export const metadata: Metadata = { title: "Team & Research" };

export default function TeamPage() {
  return <TeamView />;
}
