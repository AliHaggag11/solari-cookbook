"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RunLog } from "./RunLog";
import {
  opActionBtn,
  opLabel,
  opPaneBorder,
  opTitle,
} from "./operator-theme";
import type { NightshiftRun } from "@/lib/types";

const DesktopStream = dynamic(
  () => import("./DesktopStream").then((m) => m.DesktopStream),
  { ssr: false },
);

function desktopScreenshot(run: NightshiftRun) {
  return run.artifacts.find((a) => a.name === "desktop-screenshot.jpg")?.content;
}

function FullscreenIcon({ exit }: { exit?: boolean }) {
  if (exit) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M9 4H5v4M15 4h4v4M9 20H5v-4M15 20h4v-4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScreenshotView({
  screenshot,
  label,
}: {
  screenshot: string;
  label: string;
}) {
  return (
    <motion.img
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      src={`data:image/jpeg;base64,${screenshot}`}
      alt={label}
      className="max-h-full max-w-full border border-white/10 object-contain shadow-lg shadow-black/40"
    />
  );
}

function browserReplayReady(run: NightshiftRun) {
  if (!run.solari?.browserSessionId) return false;
  const collect = run.steps.find((s) => s.id === "browser-collect");
  return collect?.status === "done";
}

export function LivePane({ run }: { run: NightshiftRun }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const phase = run.live?.phase ?? "browser";
  const browserShot = run.live?.screenshot;
  const desktopShot = run.live?.screenshot ?? desktopScreenshot(run);
  const streamUrl = run.live?.streamUrl ?? run.solari?.desktopStreamUrl;
  const isWsStream = Boolean(streamUrl && /^wss?:\/\//.test(streamUrl));
  const runActive = run.status === "running" || run.status === "paused";
  const useLiveDesktop =
    phase === "desktop" && streamUrl && isWsStream && runActive;
  const hasVisual =
    useLiveDesktop || (phase === "desktop" && desktopShot) || Boolean(browserShot);
  const showBrowserReplay = browserReplayReady(run);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === viewportRef.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = viewportRef.current;
    if (!el) return;
    if (document.fullscreenElement === el) {
      await document.exitFullscreen();
      return;
    }
    await el.requestFullscreen();
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`flex shrink-0 items-start justify-between gap-3 border-b ${opPaneBorder} px-4 py-3`}>
        <div className="min-w-0">
          <p className={opLabel}>Live surface</p>
          <p className={opTitle}>
            {run.status === "completed" ? `${phase} · replay` : phase}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {showBrowserReplay && (
            <Link
              href={`/run/${run.id}/replay`}
              className={`${opActionBtn} text-[#e8b923] hover:border-[#e8b923]/40 hover:bg-[rgba(232,185,35,0.08)]`}
            >
              Watch browser replay
            </Link>
          )}
          {hasVisual && (
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className={`${opActionBtn} text-white/90 hover:border-white/30 hover:bg-white/5`}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <FullscreenIcon exit={isFullscreen} />
              {isFullscreen ? "Exit" : "Fullscreen"}
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div
          ref={viewportRef}
          className="relative flex min-h-0 flex-[3] flex-col overflow-hidden bg-[#080808] [&:fullscreen]:bg-black [&:fullscreen]:p-2"
        >
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4">
            <AnimatePresence mode="wait">
              {useLiveDesktop ? (
                <motion.div
                  key="desktop-stream"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="h-full w-full"
                >
                  <DesktopStream
                    streamUrl={streamUrl!}
                    fallbackScreenshot={desktopShot}
                  />
                </motion.div>
              ) : phase === "desktop" && desktopShot ? (
                <ScreenshotView
                  key="desktop-shot"
                  screenshot={desktopShot}
                  label="Final desktop snapshot"
                />
              ) : browserShot ? (
                <ScreenshotView
                  key="browser-shot"
                  screenshot={browserShot}
                  label="Browser snapshot"
                />
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-white/35"
                >
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="mx-auto mb-3 h-2 w-2 rounded-full bg-[#e8b923]"
                  />
                  Waiting for {phase} activity…
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <RunLog
          run={run}
          className="min-h-[120px] max-h-[38%] flex-[2] shrink-0"
        />
      </div>
    </div>
  );
}
