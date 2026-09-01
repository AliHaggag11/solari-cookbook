import type { RunStep } from "../types";

export const DEMO_CLOSE_STEPS: Omit<RunStep, "status">[] = [
  {
    id: "browser-launch",
    label: "Launch stealth browser with recording",
    phase: "browser",
  },
  {
    id: "browser-login",
    label: "Sign in to vendor portal",
    phase: "browser",
  },
  {
    id: "browser-collect",
    label: "Download invoices and mark received",
    phase: "browser",
  },
  {
    id: "sandbox-create",
    label: "Spin up reconciliation sandbox",
    phase: "sandbox",
  },
  {
    id: "sandbox-parse",
    label: "Parse PDFs and reconcile against books",
    phase: "sandbox",
  },
  {
    id: "sandbox-chart",
    label: "Generate exception charts",
    phase: "sandbox",
  },
  {
    id: "desktop-create",
    label: "Resume desktop from prepared snapshot",
    phase: "desktop",
  },
  {
    id: "desktop-file",
    label: "File journal in LibreOffice Calc",
    phase: "desktop",
  },
  {
    id: "desktop-export",
    label: "Export XLSX and PDF pack",
    phase: "desktop",
  },
  {
    id: "pack",
    label: "Publish shareable work pack",
    phase: "pack",
  },
];

export function initialSteps(): RunStep[] {
  return DEMO_CLOSE_STEPS.map((s) => ({ ...s, status: "pending" }));
}
