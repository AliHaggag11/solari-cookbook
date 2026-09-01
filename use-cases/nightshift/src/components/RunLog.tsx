"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { NightshiftRun } from "@/lib/types";
import { opLabel, opPaneBorder } from "./operator-theme";

export function RunLog({
  run,
  className = "",
}: {
  run: NightshiftRun;
  className?: string;
}) {
  const logRef = useRef<HTMLDivElement>(null);
  const lastEvent = run.events.at(-1);

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [run.events.length, lastEvent?.at, lastEvent?.message]);

  return (
    <section
      className={`flex min-h-0 flex-col border-t bg-[#0c0c0c] ${opPaneBorder} ${className}`}
    >
      <h3 className={`shrink-0 px-4 pb-2 pt-3 ${opLabel}`}>Log</h3>
      <div
        ref={logRef}
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 font-mono text-[11px] leading-[1.65]"
      >
        {run.events.length === 0 ? (
          <p className="px-1 text-white/50">Waiting for run events…</p>
        ) : (
          run.events.map((e, i) => (
            <motion.div
              key={`${e.at}-${i}`}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`rounded px-2 py-0.5 ${
                i % 2 === 0 ? "bg-white/[0.03]" : ""
              }`}
            >
              <span className="text-white/45 tabular-nums">
                [{new Date(e.at).toLocaleTimeString()}]
              </span>{" "}
              <span className="text-white/82">{e.message}</span>
            </motion.div>
          ))
        )}
      </div>
      {run.error && (
        <p
          className={`shrink-0 border-t bg-red-950/30 px-4 py-2 text-sm text-red-300 ${opPaneBorder}`}
        >
          {run.error}
        </p>
      )}
    </section>
  );
}
