"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { HomeLanding } from "./HomeLanding";
import { RunbookPane } from "./RunbookPane";
import { LivePane } from "./LivePane";
import { WorkPane } from "./WorkPane";
import { PortalLoginPrompt } from "./PortalLoginPrompt";
import { runNeedsPortalCredentials } from "@/lib/runbook/portal-credentials";
import { opHeaderBtn, opHeaderBtnGold, opPaneBorder } from "./operator-theme";
import type { NightshiftRun } from "@/lib/types";

type MobileTab = "runbook" | "live" | "work";

function StatusBadge({ status }: { status: NightshiftRun["status"] }) {
  const tone =
    status === "completed"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
      : status === "failed"
        ? "border-red-400/30 bg-red-400/10 text-red-400"
        : status === "running"
          ? "border-[#e8b923]/40 bg-[rgba(232,185,35,0.1)] text-[#e8b923]"
          : "border-white/15 bg-white/5 text-white/50";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${tone}`}
    >
      {status}
    </span>
  );
}

const mobileTabBtn = (active: boolean) =>
  `flex-1 rounded-md px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-wide transition-colors ${
    active
      ? "bg-[#141414] text-white ring-1 ring-white/15"
      : "text-white/40 hover:text-white/70"
  }`;

export function OperatorShell({
  runId,
  initialRun,
}: {
  runId?: string;
  initialRun?: NightshiftRun;
}) {
  const router = useRouter();
  const [run, setRun] = useState<NightshiftRun | null>(initialRun ?? null);
  const [runLoading, setRunLoading] = useState(Boolean(runId && !initialRun));
  const [runMissing, setRunMissing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [byoUrl, setByoUrl] = useState("");
  const [email, setEmail] = useState("");
  const [gallery, setGallery] = useState<NightshiftRun[]>([]);
  const [mobileTab, setMobileTab] = useState<MobileTab>("live");
  const [stats, setStats] = useState({
    demoStarts: 0,
    demoFinishes: 0,
    shareOpens: 0,
    waitlistSignups: 0,
  });

  const loadGallery = useCallback(async () => {
    const res = await fetch("/api/gallery");
    const data = await res.json();
    setGallery(data.runs ?? []);
    setStats(data.summary ?? {
      demoStarts: 0,
      demoFinishes: 0,
      shareOpens: 0,
      waitlistSignups: 0,
    });
  }, []);

  useEffect(() => {
    void loadGallery();
    const t = setInterval(() => void loadGallery(), 15000);
    return () => clearInterval(t);
  }, [loadGallery]);

  useEffect(() => {
    if (!runId) return;

    setRun(initialRun ?? null);
    setRunMissing(false);
    setRunLoading(!initialRun);

    const poll = async () => {
      const res = await fetch(`/api/runs/${runId}`);
      if (res.ok) {
        setRun(await res.json());
        setRunMissing(false);
        setRunLoading(false);
        return;
      }
      if (res.status === 404) {
        setRunMissing(true);
        setRunLoading(false);
      }
    };

    poll();
    const pollInterval = setInterval(() => void poll(), 2000);

    void fetch(`/api/runs/${runId}/start`, { method: "POST" }).catch(() => {
      /* start route is a backup; SSE also kicks off the engine */
    });

    const es = new EventSource(`/api/runs/${runId}/events`);
    es.onmessage = (msg) => {
      const data = JSON.parse(msg.data) as {
        run?: NightshiftRun;
        done?: boolean;
        error?: string;
      };
      if (data.run) {
        setRun(data.run);
        setRunLoading(false);
        setRunMissing(false);
      }
      if (data.done) es.close();
    };
    return () => {
      clearInterval(pollInterval);
      es.close();
    };
  }, [runId, initialRun]);

  useEffect(() => {
    if (!run || window.location.hash !== "#work-pack") return;
    document.getElementById("work-pack")?.scrollIntoView({ behavior: "smooth" });
  }, [run]);

  const copyShareLink = useCallback(async () => {
    if (!run) return;
    const url = `${window.location.origin}/run/${run.id}`;
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 2000);
    void fetch(`/api/runs/${run.id}/share`, { method: "POST" });
  }, [run]);

  const startDemo = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "demo", isPublic: true }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        id?: string;
        error?: string;
        status?: string;
      };
      if (!res.ok) {
        alert(data.error ?? `Failed to start demo (${res.status})`);
        return;
      }
      if (!data.id) {
        alert("Server did not return a run id");
        return;
      }
      router.push(`/run/${data.id}`);
    } catch {
      alert("Could not reach the server. Try again in a moment.");
    } finally {
      setStarting(false);
    }
  };

  const startByo = async () => {
    if (!byoUrl.trim()) return;
    setStarting(true);
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "byo",
          portalUrl: byoUrl,
          isPublic: false,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        id?: string;
        error?: string;
      };
      if (!res.ok) {
        alert(data.error ?? `Failed to start run (${res.status})`);
        return;
      }
      if (!data.id) {
        alert("Server did not return a run id");
        return;
      }
      router.push(`/run/${data.id}`);
    } catch {
      alert("Could not reach the server. Try again in a moment.");
    } finally {
      setStarting(false);
    }
  };

  const joinWaitlist = async () => {
    if (!email.includes("@")) return;
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setEmail("");
    loadGallery();
  };

  if (!runId) {
    return (
      <HomeLanding
        starting={starting}
        byoUrl={byoUrl}
        email={email}
        stats={stats}
        gallery={gallery}
        onStartDemo={() => void startDemo()}
        onByoUrlChange={setByoUrl}
        onStartByo={() => void startByo()}
        onEmailChange={setEmail}
        onJoinWaitlist={() => void joinWaitlist()}
      />
    );
  }

  if (runLoading && !run) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mb-3 h-2 w-2 rounded-full bg-[#e8b923]"
        />
        <p className="font-mono text-xs uppercase tracking-wider text-white/40">
          Loading work pack…
        </p>
      </div>
    );
  }

  if (runMissing || !run) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8b923]">
          Nightshift
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Work pack not found</h1>
        <p className="mt-2 max-w-md text-sm text-white/45">
          Run <code className="text-white/80">{runId}</code> could not be loaded.
          If you just connected Neon Postgres, redeploy so runs persist.
        </p>
        <Link href="/" className={`${opHeaderBtnGold} mt-6`}>
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-dvh min-h-dvh flex-col overflow-hidden">
      <header className={`flex shrink-0 flex-col gap-3 border-b ${opPaneBorder} px-4 py-3 lg:flex-row lg:items-center lg:justify-between`}>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8b923]">
            Nightshift
          </p>
          <h1 className="truncate text-lg font-semibold">{run.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={run.status} />
          {run.status === "running" && (
            <button
              type="button"
              onClick={() => fetch(`/api/runs/${run.id}/pause`, { method: "POST" })}
              className={opHeaderBtn}
            >
              Pause
            </button>
          )}
          {run.status === "paused" && !runNeedsPortalCredentials(run) && (
            <button
              type="button"
              onClick={() => fetch(`/api/runs/${run.id}/resume`, { method: "POST" })}
              className={opHeaderBtnGold}
            >
              Resume
            </button>
          )}
          <button
            type="button"
            onClick={() => void copyShareLink()}
            className={opHeaderBtnGold}
          >
            {shareCopied ? "Link copied" : "Copy share link"}
          </button>
          <Link href="/" className={opHeaderBtn}>
            Home
          </Link>
        </div>
      </header>

      {runNeedsPortalCredentials(run) && (
        <PortalLoginPrompt run={run} variant="banner" />
      )}

      {/* Desktop: three-column layout */}
      <div className="hidden min-h-0 flex-1 lg:grid lg:grid-cols-3">
        <div className={`flex min-h-0 flex-col border-r ${opPaneBorder}`}>
          <RunbookPane steps={run.steps} status={run.status} />
        </div>
        <div className={`flex min-h-0 flex-col border-r ${opPaneBorder}`}>
          <LivePane run={run} />
        </div>
        <div className="flex min-h-0 flex-col">
          <WorkPane run={run} />
        </div>
      </div>

      {/* Mobile: tabbed panes */}
      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <div
          className={`shrink-0 border-b ${opPaneBorder} px-3 py-2`}
          role="tablist"
          aria-label="Run sections"
        >
          <div className="flex gap-1 rounded-lg bg-[#0a0a0a] p-1 ring-1 ring-white/10">
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "runbook"}
              className={mobileTabBtn(mobileTab === "runbook")}
              onClick={() => setMobileTab("runbook")}
            >
              Runbook
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "live"}
              className={mobileTabBtn(mobileTab === "live")}
              onClick={() => setMobileTab("live")}
            >
              Live
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === "work"}
              className={mobileTabBtn(mobileTab === "work")}
              onClick={() => setMobileTab("work")}
            >
              Work pack
            </button>
          </div>
        </div>
        <motion.div
          key={mobileTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="min-h-0 flex-1 overflow-hidden"
        >
          {mobileTab === "runbook" && (
            <RunbookPane steps={run.steps} status={run.status} />
          )}
          {mobileTab === "live" && <LivePane run={run} />}
          {mobileTab === "work" && <WorkPane run={run} layout="tab" />}
        </motion.div>
      </div>
    </div>
  );
}
