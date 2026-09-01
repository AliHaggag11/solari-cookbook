export type StepStatus = "pending" | "running" | "paused" | "done" | "error";

export type RunMode = "demo" | "byo";

export type RunStep = {
  id: string;
  label: string;
  phase: "browser" | "sandbox" | "desktop" | "pack";
  status: StepStatus;
  detail?: string;
  startedAt?: string;
  finishedAt?: string;
};

export type ReconcileRow = {
  invoiceId: string;
  vendor: string;
  portalAmount: number;
  booksAmount: number;
  status: "matched" | "mismatch" | "missing";
};

export type RunArtifact = {
  name: string;
  type: "csv" | "pdf" | "json" | "png" | "xlsx" | "url";
  content?: string;
  url?: string;
};

export type RunEvent = {
  at: string;
  kind: "step" | "log" | "screenshot" | "artifact" | "error" | "pause";
  message: string;
  data?: Record<string, unknown>;
};

export type NightshiftRun = {
  id: string;
  mode: RunMode;
  title: string;
  status: "queued" | "running" | "paused" | "completed" | "failed";
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  portalUrl?: string;
  profileId?: string;
  /** Set while the run is paused for BYO portal sign-in. */
  awaitingPortalLogin?: boolean;
  portalLoginHost?: string;
  /** Server-only: cleared immediately after the engine consumes them. */
  portalLoginCreds?: { username: string; password: string };
  steps: RunStep[];
  events: RunEvent[];
  artifacts: RunArtifact[];
  reconcile?: ReconcileRow[];
  solari?: {
    browserSessionId?: string;
    browserReplayUrl?: string;
    sandboxSessionId?: string;
    desktopSessionId?: string;
    desktopStreamUrl?: string;
  };
  live?: {
    phase?: "browser" | "sandbox" | "desktop";
    screenshot?: string;
    streamUrl?: string;
  };
  error?: string;
};

export type AnalyticsEvent = {
  at: string;
  kind: "demo_start" | "demo_finish" | "share_open" | "waitlist_signup";
  runId?: string;
  meta?: Record<string, unknown>;
};

export type WaitlistEntry = {
  email: string;
  at: string;
  note?: string;
};
