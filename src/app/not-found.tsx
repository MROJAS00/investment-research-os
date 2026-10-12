import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That route is not part of the Longview research workspace.
      </p>
      <Button className="mt-4" render={<Link href="/dashboard" />}>
        Back to overview
      </Button>
    </div>
  );
}
