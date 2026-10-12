"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Field, NativeSelect, PageHeader, Surface } from "@/components/common/ui-bits";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadText, ideasToCsv, stateToJson } from "@/lib/export";
import { DISPLAY_RATES } from "@/lib/format";
import { CURRENCY_LABELS } from "@/lib/labels";
import { useWorkspace } from "@/lib/store";
import { CURRENCIES, type Currency } from "@/lib/types";

export function SettingsView() {
  const { state, updateSettings, reset } = useWorkspace();
  const [name, setName] = useState(state.settings.workspaceName);
  const [confirmReset, setConfirmReset] = useState(false);
  const [nameError, setNameError] = useState("");

  function saveName() {
    if (name.trim().length < 3) {
      setNameError("The workspace name needs at least 3 characters.");
      return;
    }
    setNameError("");
    updateSettings({ workspaceName: name.trim() });
    toast.success("Workspace name saved in this browser.");
  }

  function exportJson() {
    downloadText(
      "longview-research.json",
      stateToJson(state),
      "application/json",
    );
    toast.success("JSON export downloaded.");
  }

  function exportCsv() {
    downloadText("longview-ideas.csv", ideasToCsv(state), "text/csv");
    toast.success("CSV export downloaded. Amounts are source EUR.");
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Demo preferences for this browser. Nothing here is an account, a permission, or a market-data connection."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Surface className="space-y-4 p-4">
          <h2 className="font-mono text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Workspace
          </h2>
          <Field label="Demo workspace name" htmlFor="workspace-name" error={nameError}>
            <Input
              id="workspace-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Button onClick={saveName}>Save name</Button>
          <Field
            label="Currency display"
            htmlFor="currency"
            hint="Figures are stored in EUR. Other currencies use a fixed illustrative rate and are not market FX."
          >
            <NativeSelect
              id="currency"
              value={state.settings.currency}
              onChange={(value) => {
                updateSettings({ currency: value as Currency });
                toast.success("Display currency updated.");
              }}
              options={CURRENCIES.map((currency) => ({
                value: currency,
                label: `${CURRENCY_LABELS[currency]} · €1 = ${DISPLAY_RATES[currency]} ${currency}`,
              }))}
            />
          </Field>
          <Field label="Default pipeline view" htmlFor="pipeline-view">
            <NativeSelect
              id="pipeline-view"
              value={state.settings.defaultPipelineView}
              onChange={(value) => {
                updateSettings({
                  defaultPipelineView: value as "kanban" | "table",
                });
                toast.success("Default pipeline view saved.");
              }}
              options={[
                { value: "kanban", label: "Board" },
                { value: "table", label: "Table" },
              ]}
            />
          </Field>
        </Surface>
        <Surface className="space-y-4 p-4">
          <h2 className="font-mono text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Research data
          </h2>
          <p className="text-sm leading-5 text-muted-foreground">
            Exports include the fictional companies, theses, questions, documents, meetings, and history stored in this browser.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportJson}>
              Export JSON
            </Button>
            <Button variant="outline" onClick={exportCsv}>
              Export CSV
            </Button>
          </div>
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium">Reset demo data</h3>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Replaces every local change with the original Longview Capital dataset. This cannot be undone from the app.
            </p>
            <Button className="mt-3" variant="destructive" onClick={() => setConfirmReset(true)}>
              Reset demo data
            </Button>
          </div>
        </Surface>
      </div>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset the demo workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Ideas you added, thesis edits, committee decisions, and settings stored in this browser will be replaced by the original fictional dataset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                reset();
                setName("Longview Capital — Demo");
                setConfirmReset(false);
                toast.success("Demo data restored.");
              }}
            >
              Reset demo data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
