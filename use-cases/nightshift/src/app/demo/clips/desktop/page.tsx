"use client";

import { motion } from "framer-motion";

export default function DesktopClipPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] p-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/35">
            noVNC · LibreOffice Calc
          </span>
          <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 font-mono text-[9px] text-emerald-400">
            live
          </span>
        </div>
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="overflow-hidden bg-[#1a1a1a]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/demos/desktop-screenshot.jpg"
            alt="Desktop session filing journal in LibreOffice"
            className="w-full object-contain"
          />
        </motion.div>
      </div>
    </div>
  );
}
