"use client";

import { useEffect, useState } from "react";

const LINES = [
  { text: "$ python reconcile.py", delay: 0 },
  { text: "→ loading portal-invoices.csv (12 rows)", delay: 400, dim: true },
  { text: "→ loading books.csv (12 rows)", delay: 700, dim: true },
  { text: "matched: 10", delay: 1200, ok: true },
  { text: "mismatch: 2", delay: 1600, warn: true },
  { text: "  · Meridian IT      portal $875.25  books $900.00", delay: 2000, warn: true },
  { text: "  · Silverline Mktg  portal $1750.00 books $1700.00", delay: 2400, warn: true },
  { text: "→ writing exceptions.png", delay: 3000, dim: true },
  { text: "done in 1.2s", delay: 3600, ok: true },
];

export default function SandboxClipPage() {
  const [visible, setVisible] = useState(0);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const timers = LINES.map((line, i) =>
      window.setTimeout(() => setVisible(i + 1), line.delay),
    );
    const chart = window.setTimeout(() => setShowChart(true), 4200);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(chart);
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] p-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 font-mono text-[10px] text-white/35">
            sandbox · reconcile.py
          </span>
        </div>
        <div className="p-4 font-mono text-[13px] leading-relaxed sm:text-sm">
          {LINES.slice(0, visible).map((line, i) => (
            <p
              key={i}
              className={
                line.ok
                  ? "text-emerald-400"
                  : line.warn
                    ? "text-red-300"
                    : line.dim
                      ? "text-white/45"
                      : "text-white/90"
              }
            >
              {line.text}
            </p>
          ))}
          {showChart && (
            <div className="mt-4 rounded border border-white/10 bg-black/40 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/demos/exceptions.png"
                alt="Exception chart"
                className="mx-auto max-h-48 w-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
