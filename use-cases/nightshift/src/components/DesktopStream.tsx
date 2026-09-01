"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const CONNECT_TIMEOUT_MS = 10_000;

type RfbClient = InstanceType<(typeof import("@novnc/novnc"))["default"]>;

function rfbState(rfb: RfbClient): string | undefined {
  return (rfb as unknown as { _rfbConnectionState?: string })._rfbConnectionState;
}

function safeDisconnect(rfb: RfbClient | null) {
  if (!rfb) return;
  const state = rfbState(rfb);
  if (state === "disconnected" || state === "disconnecting") return;
  rfb.disconnect();
}

export function DesktopStream({
  streamUrl,
  fallbackScreenshot,
}: {
  streamUrl: string;
  fallbackScreenshot?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rfbRef = useRef<RfbClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !streamUrl) return;

    let cancelled = false;
    let everConnected = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled && !everConnected) setUnavailable(true);
    }, CONNECT_TIMEOUT_MS);

    void (async () => {
      try {
        const mod = await import("@novnc/novnc");
        if (cancelled) return;

        el.replaceChildren();
        const rfb = new mod.default(el, streamUrl, {});
        if (cancelled) {
          safeDisconnect(rfb);
          return;
        }

        rfbRef.current = rfb;
        rfb.viewOnly = true;
        rfb.scaleViewport = true;
        rfb.background = "#080808";
        rfb.addEventListener("connect", () => {
          if (cancelled) return;
          everConnected = true;
          window.clearTimeout(timeout);
          setConnected(true);
          setUnavailable(false);
        });
        rfb.addEventListener("disconnect", () => {
          if (cancelled) return;
          setConnected(false);
          rfbRef.current = null;
          if (!everConnected) setUnavailable(true);
        });
      } catch {
        if (!cancelled) setUnavailable(true);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      safeDisconnect(rfbRef.current);
      rfbRef.current = null;
    };
  }, [streamUrl]);

  if (unavailable && fallbackScreenshot) {
    return (
      <motion.img
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        src={`data:image/jpeg;base64,${fallbackScreenshot}`}
        alt="Desktop snapshot"
        className="max-h-full max-w-full border border-white/10 object-contain shadow-lg shadow-black/40"
      />
    );
  }

  return (
    <div className="relative h-full w-full">
      {!connected && !unavailable && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#080808]/90">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-sm text-white/35"
          >
            Connecting to desktop…
          </motion.div>
        </div>
      )}
      {unavailable && !fallbackScreenshot && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#080808] p-4 text-center text-sm text-white/35">
          Desktop stream unavailable — session may have ended.
        </div>
      )}
      <div
        ref={containerRef}
        className="h-full w-full overflow-hidden border border-white/10 [&_canvas]:mx-auto [&_canvas]:max-h-full [&_canvas]:max-w-full"
      />
    </div>
  );
}
