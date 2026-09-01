"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BrowserReplayPlayer } from "@/components/BrowserReplayPlayer";
import { opHeaderBtn, opPaneBorder } from "@/components/operator-theme";

export function BrowserReplayPage({ runId }: { runId: string }) {
  const [events, setEvents] = useState<unknown[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/runs/${runId}/replay`);
      const data = (await res.json()) as {
        events?: unknown[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not load replay");
        return;
      }
      setEvents(data.events ?? []);
    })();
  }, [runId]);

  return (
    <div className="min-h-dvh">
      <header className={`border-b ${opPaneBorder} px-6 py-4`}>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8b923]">
          Nightshift
        </p>
        <h1 className="text-2xl font-semibold">Browser replay</h1>
        <p className="mt-1 max-w-2xl text-sm text-white/45">
          Solari records browser sessions as rrweb DOM events (the .ndjson.gz
          file), not video. This player reconstructs the session in your
          browser.
        </p>
        <Link href={`/run/${runId}`} className={`${opHeaderBtn} mt-3`}>
          ← Back to run
        </Link>
      </header>

      <main className="px-6 py-8 pb-16">
        {!events && !error && (
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-sm text-white/35"
          >
            Loading replay…
          </motion.p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {events && events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <BrowserReplayPlayer events={events} />
          </motion.div>
        )}
        {events && events.length === 0 && (
          <p className="text-sm text-white/35">Replay file was empty.</p>
        )}
      </main>
    </div>
  );
}
