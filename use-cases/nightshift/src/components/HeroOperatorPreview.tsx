"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const GOLD = "#e8b923";
const PHASES = ["browser", "sandbox", "desktop"] as const;
type Phase = (typeof PHASES)[number];

const phaseMeta: Record<
  Phase,
  { label: string; live: string; step: string; exception?: string }
> = {
  browser: {
    label: "Browser",
    live: "Portal login · CSV export",
    step: "Mark invoices received",
  },
  sandbox: {
    label: "Sandbox",
    live: "Python reconcile",
    step: "2 exceptions found",
    exception: "Meridian IT · −$24.75",
  },
  desktop: {
    label: "Desktop",
    live: "LibreOffice filing",
    step: "Export journal ODS",
  },
};

const runbookSteps = [
  { id: "b1", label: "Launch stealth browser", phase: "browser" as Phase },
  { id: "b2", label: "Portal login + export", phase: "browser" as Phase },
  { id: "s1", label: "Spin up sandbox", phase: "sandbox" as Phase },
  { id: "s2", label: "Reconcile CSVs", phase: "sandbox" as Phase },
  { id: "d1", label: "Open desktop session", phase: "desktop" as Phase },
  { id: "d2", label: "File in LibreOffice", phase: "desktop" as Phase },
];

function PhaseIndicator({ active }: { active: Phase }) {
  return (
    <div className="flex gap-1.5">
      {PHASES.map((p) => (
        <span
          key={p}
          className="rounded-full px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider transition-all duration-500"
          style={{
            backgroundColor: p === active ? "rgba(232,185,35,0.15)" : "rgba(255,255,255,0.04)",
            color: p === active ? GOLD : "rgba(255,255,255,0.25)",
            border: p === active ? "1px solid rgba(232,185,35,0.35)" : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {phaseMeta[p].label}
        </span>
      ))}
    </div>
  );
}

export function HeroOperatorPreview() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const phase = PHASES[phaseIdx];
  const meta = phaseMeta[phase];

  useEffect(() => {
    const t = window.setInterval(() => {
      setPhaseIdx((i) => (i + 1) % PHASES.length);
    }, 3800);
    return () => window.clearInterval(t);
  }, []);

  const activeStepIdx = runbookSteps.findIndex((s) => s.phase === phase) + 1;

  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      {/* Glow frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-2xl bg-[radial-gradient(ellipse_at_50%_100%,rgba(232,185,35,0.18),transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-b from-white/10 via-white/5 to-transparent"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-xl border border-white/10 bg-[#070707] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.85)]"
      >
        {/* Chrome bar */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
            Operator · live
          </span>
          <PhaseIndicator active={phase} />
        </div>

        {/* Three-pane mini UI */}
        <div className="grid grid-cols-[88px_1fr_96px] gap-px bg-white/[0.04]">
          {/* Runbook */}
          <div className="bg-[#0a0a0a] p-2">
            <p className="mb-1.5 font-mono text-[7px] uppercase tracking-wider text-white/35">
              Runbook
            </p>
            <ol className="space-y-1">
              {runbookSteps.slice(0, 4).map((step, i) => {
                const isActive = i === activeStepIdx - 1;
                const isDone = i < activeStepIdx - 1;
                return (
                  <li
                    key={step.id}
                    className="rounded px-1 py-0.5 text-[7px] leading-tight transition-colors duration-500"
                    style={{
                      backgroundColor: isActive
                        ? "rgba(232,185,35,0.1)"
                        : "transparent",
                      color: isDone
                        ? "rgba(110,231,160,0.85)"
                        : isActive
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(255,255,255,0.28)",
                    }}
                  >
                    {step.label}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Live surface */}
          <div className="relative flex min-h-[140px] flex-col bg-[#080808]">
            <div className="border-b border-white/[0.05] px-2 py-1">
              <p className="font-mono text-[7px] uppercase tracking-wider text-white/35">
                Live
              </p>
            </div>
            <div className="relative flex flex-1 items-center justify-center p-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.45 }}
                  className="w-full"
                >
                  {phase === "browser" && (
                    <div className="mx-auto w-full max-w-[160px] rounded border border-white/10 bg-[#0d0d0d] p-2">
                      <div className="mb-1 h-1.5 w-2/3 rounded bg-white/10" />
                      <div className="grid grid-cols-3 gap-0.5">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <div
                            key={n}
                            className="h-4 rounded-sm bg-white/[0.04]"
                            style={{
                              backgroundColor:
                                n <= 2 ? "rgba(232,185,35,0.12)" : undefined,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {phase === "sandbox" && (
                    <div className="mx-auto font-mono text-[8px] leading-relaxed">
                      <p className="text-emerald-400/90">matched: 10</p>
                      <p className="text-red-300/90">mismatch: 2</p>
                      <div className="mt-1 flex h-8 items-end gap-0.5">
                        {[6, 2, 1].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-sm"
                            style={{
                              height: `${h * 4}px`,
                              backgroundColor:
                                i === 1
                                  ? "rgba(248,113,113,0.6)"
                                  : i === 0
                                    ? "rgba(110,231,160,0.5)"
                                    : "rgba(255,255,255,0.15)",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {phase === "desktop" && (
                    <div className="mx-auto w-full max-w-[140px]">
                      <div className="mb-1 flex gap-1">
                        <div className="h-5 w-5 rounded bg-white/5" />
                        <div className="h-5 flex-1 rounded border border-white/5 bg-white/[0.02]" />
                      </div>
                      <div className="h-14 rounded border border-white/5 bg-white/[0.03]" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <motion.div
                animate={{ opacity: [0.35, 0.7, 0.35] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: GOLD }}
              />
            </div>
            <div className="border-t border-white/[0.05] px-2 py-1 font-mono text-[6px] leading-relaxed text-white/40">
              <p>[live] {meta.live}</p>
            </div>
          </div>

          {/* Work pack */}
          <div className="bg-[#0a0a0a] p-2">
            <p className="mb-1.5 font-mono text-[7px] uppercase tracking-wider text-white/35">
              Pack
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.35 }}
              >
                {meta.exception ? (
                  <div
                    className="rounded border-l-2 px-1 py-0.5 text-[7px] leading-tight"
                    style={{
                      borderColor: "#f87171",
                      backgroundColor: "rgba(248,113,113,0.1)",
                      color: "rgba(252,165,165,0.95)",
                    }}
                  >
                    {meta.exception}
                  </div>
                ) : (
                  <p className="text-[7px] text-white/35">{meta.step}</p>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="mt-2 space-y-0.5">
              {["replay.ndjson", "journal.ods"].map((f) => (
                <div
                  key={f}
                  className="truncate rounded bg-white/[0.03] px-1 py-0.5 font-mono text-[6px] text-white/30"
                >
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating caption */}
      <motion.p
        key={phase}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/40"
      >
        Now running · <span style={{ color: GOLD }}>{meta.label}</span>
      </motion.p>
    </div>
  );
}
