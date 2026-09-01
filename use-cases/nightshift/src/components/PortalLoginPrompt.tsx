"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  portalCredentialHost,
  runNeedsPortalCredentials,
} from "@/lib/runbook/portal-credentials";
import { opHeaderBtnGold, opPaneBorder } from "./operator-theme";
import type { NightshiftRun } from "@/lib/types";

export function PortalLoginPrompt({
  run,
  variant = "banner",
  onSubmitted,
}: {
  run: NightshiftRun;
  variant?: "banner" | "overlay";
  onSubmitted?: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!runNeedsPortalCredentials(run)) return null;

  const host = portalCredentialHost(run);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/runs/${run.id}/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not submit credentials");
        return;
      }
      setPassword("");
      onSubmitted?.();
    } catch {
      setError("Network error — try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const shellClass =
    variant === "banner"
      ? `shrink-0 border-b ${opPaneBorder} bg-[#0d0d0d] px-4 py-4`
      : `absolute inset-0 z-30 flex items-end justify-center bg-black/55 p-4 backdrop-blur-[2px]`;

  const panelClass =
    variant === "banner"
      ? "mx-auto w-full max-w-4xl"
      : `w-full max-w-lg rounded-xl border ${opPaneBorder} bg-[#0a0a0a] p-4 shadow-2xl shadow-black/60`;

  return (
    <motion.div
      initial={{ opacity: 0, y: variant === "banner" ? -6 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={shellClass}
      role="region"
      aria-label="Portal sign-in"
    >
      <div className={panelClass}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 lg:max-w-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e8b923]">
              Portal sign-in required
            </p>
            <h3 className="mt-1 text-sm font-semibold text-white">
              Enter credentials for {host}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-white/45">
              You can&apos;t control the cloud browser directly — type your login here.
              Nightshift signs in for you and saves a Solari profile for next time.
            </p>
          </div>

          <form
            onSubmit={(e) => void submit(e)}
            className="grid flex-1 gap-3 sm:grid-cols-[1fr_1fr_auto] lg:max-w-2xl"
          >
            <label className="block min-w-0">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-white/40">
                Email or username
              </span>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none ring-[#e8b923]/30 focus:ring-2"
                placeholder="you@company.com"
                required
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-white/40">
                Password
              </span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none ring-[#e8b923]/30 focus:ring-2"
                required
              />
            </label>
            <div className="flex flex-col justify-end gap-1">
              <button
                type="submit"
                disabled={submitting}
                className={`${opHeaderBtnGold} w-full whitespace-nowrap sm:w-auto`}
              >
                {submitting ? "Signing in…" : "Sign in & continue"}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <p className="mt-3 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
}
