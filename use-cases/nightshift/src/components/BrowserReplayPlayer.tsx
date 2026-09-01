"use client";

import { useEffect, useRef } from "react";
import { Replayer, type eventWithTime } from "rrweb";
import { ReplayerEvents } from "@rrweb/types";
import "rrweb/dist/style.css";

function viewportFromEvents(events: eventWithTime[]) {
  for (const event of events) {
    if (event.type === 4 && event.data && typeof event.data === "object") {
      const data = event.data as { width?: number; height?: number };
      if (data.width && data.height) {
        return { width: data.width, height: data.height };
      }
    }
  }
  return { width: 1280, height: 720 };
}

export function BrowserReplayPlayer({ events }: { events: unknown[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sizerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroll = scrollRef.current;
    const sizer = sizerRef.current;
    const mount = mountRef.current;
    const typedEvents = events as eventWithTime[];
    if (!scroll || !sizer || !mount || typedEvents.length === 0) return;

    mount.replaceChildren();
    const replayer = new Replayer(typedEvents, {
      root: mount,
      showWarning: false,
      showDebug: false,
      insertStyleRules: [
        "html, body { background: #e8e4dc !important; }",
      ],
      mouseTail: {
        strokeStyle: "#b5651d",
      },
    });

    const fitReplay = () => {
      if (!scroll || !sizer || !mount) return;

      const fallback = viewportFromEvents(typedEvents);
      const iframe = replayer.iframe;
      const recordedW =
        iframe?.clientWidth ||
        Number(iframe?.width) ||
        fallback.width;
      const recordedH =
        iframe?.clientHeight ||
        Number(iframe?.height) ||
        fallback.height;

      const availableW = scroll.clientWidth;
      const scale = availableW / recordedW;
      const scaledW = recordedW * scale;
      const scaledH = recordedH * scale;

      mount.style.width = `${recordedW}px`;
      mount.style.height = `${recordedH}px`;
      mount.style.transform = `scale(${scale})`;
      mount.style.transformOrigin = "top left";

      sizer.style.width = `${scaledW}px`;
      sizer.style.height = `${scaledH}px`;
    };

    replayer.on(ReplayerEvents.FullsnapshotRebuilded, fitReplay);
    replayer.on(ReplayerEvents.Resize, fitReplay);
    window.addEventListener("resize", fitReplay);

    replayer.play();
    const retryFit = window.setTimeout(fitReplay, 400);

    return () => {
      window.clearTimeout(retryFit);
      window.removeEventListener("resize", fitReplay);
      replayer.destroy();
    };
  }, [events]);

  return (
    <div
      ref={scrollRef}
      className="max-h-[calc(100vh-13rem)] overflow-x-hidden overflow-y-auto rounded-md border border-white/10 bg-[#080808]"
    >
      <div ref={sizerRef} className="mx-auto overflow-hidden">
        <div ref={mountRef} className="relative" />
      </div>
    </div>
  );
}
