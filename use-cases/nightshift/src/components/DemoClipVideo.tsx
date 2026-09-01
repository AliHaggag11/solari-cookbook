"use client";

import { useState } from "react";

const CLIPS: Record<
  "browser" | "sandbox" | "desktop",
  { src: string; poster?: string; label: string }
> = {
  browser: {
    src: "/demos/browser.webm",
    label: "Portal login and invoice receipt",
  },
  sandbox: {
    src: "/demos/sandbox.webm",
    poster: "/demos/exceptions.png",
    label: "Python reconciliation output",
  },
  desktop: {
    src: "/demos/desktop.webm",
    poster: "/demos/desktop-screenshot.jpg",
    label: "LibreOffice filing session",
  },
};

export function DemoClipVideo({
  kind,
}: {
  kind: "browser" | "sandbox" | "desktop";
}) {
  const [ready, setReady] = useState(false);
  const clip = CLIPS[kind];

  return (
    <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0d0d0d] shadow-2xl">
      <div className="flex shrink-0 items-center gap-1.5 border-b border-white/[0.06] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-white/30">
          {kind === "browser" ? "portal" : kind === "sandbox" ? "python" : "vnc"}
        </span>
      </div>

      <div className="relative min-h-0 flex-1 bg-black">
        {!ready && clip.poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clip.poster}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <video
          src={clip.src}
          poster={clip.poster}
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setReady(true)}
          className="h-full w-full bg-black object-contain"
          aria-label={clip.label}
        />
      </div>
    </div>
  );
}
