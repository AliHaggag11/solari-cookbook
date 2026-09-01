"use client";

import { motion } from "framer-motion";
import type { RunStep } from "@/lib/types";
import {
  opCard,
  opCardActive,
  opLabel,
  opPaneBorder,
  opTitle,
} from "./operator-theme";

const statusColor: Record<string, string> = {
  pending: "text-white/30",
  running: "text-[#e8b923]",
  paused: "text-white/45",
  done: "text-emerald-400",
  error: "text-red-400",
};

export function RunbookPane({
  steps,
  status,
}: {
  steps: RunStep[];
  status: string;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`shrink-0 border-b ${opPaneBorder} px-4 py-3`}>
        <p className={opLabel}>Runbook</p>
        <p className={opTitle}>{status}</p>
      </div>
      <ol className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {steps.map((step, i) => (
          <motion.li
            key={step.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.25 }}
            className={step.status === "running" ? opCardActive : opCard}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-white/90">{step.label}</span>
              <span className={`font-mono text-[10px] uppercase tracking-wide ${statusColor[step.status]}`}>
                {step.status}
              </span>
            </div>
            {step.detail && (
              <p className="mt-1 text-xs text-white/55">{step.detail}</p>
            )}
            <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-white/40">
              {step.phase}
            </p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
