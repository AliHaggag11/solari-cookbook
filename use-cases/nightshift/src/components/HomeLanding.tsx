"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { HeroOperatorPreview } from "./HeroOperatorPreview";
import { DemoClipVideo } from "./DemoClipVideo";
import type { NightshiftRun } from "@/lib/types";

const GOLD = "#e8b923";
const GOLD_DIM = "rgba(232, 185, 35, 0.15)";

const pillars = [
  {
    id: "browser",
    env: "ENV 01",
    title: "Cloud Browsers",
    sdk: "@solarisdk/browser",
    metric: "stealth + recording",
    blurb:
      "For agents that need to browse, authenticate, scrape, and interact with the web.",
    nightshift:
      "Signs into a hostile AP portal, marks invoices received, exports CSV — with session replay.",
    features: ["stealth", "recording", "captcha", "Playwright"],
    uiMock: "browser" as const,
  },
  {
    id: "sandbox",
    env: "ENV 02",
    title: "AI Sandboxes",
    sdk: "@solarisdk/sandbox",
    metric: "Python reconcile",
    blurb:
      "For agents that need isolated compute to run code, execute tools, and process workloads.",
    nightshift:
      "Uploads portal + books CSV, runs reconciliation Python, emits exception charts.",
    features: ["runCode", "files", "pause", "2 vCPU"],
    uiMock: "sandbox" as const,
  },
  {
    id: "desktop",
    env: "ENV 03",
    title: "Computer Desktops",
    sdk: "@solarisdk/desktop",
    metric: "live VNC stream",
    blurb:
      "For agents that need to control applications, navigate full operating systems, and complete complex workflows.",
    nightshift:
      "Opens LibreOffice Calc, files the journal, exports ODS — watch it live via noVNC.",
    features: ["VNC", "mouse", "keyboard", "LibreOffice"],
    uiMock: "desktop" as const,
  },
];

const trySteps = [
  {
    n: "01",
    title: "Start the close",
    body: 'Click "Run tonight\'s AP close". No signup — Nightshift runs on our Solari keys.',
  },
  {
    n: "02",
    title: "Watch the operator UI",
    body: "Runbook · live browser/desktop (with logs) · work pack. Mobile uses tabs.",
  },
  {
    n: "03",
    title: "Share the work pack",
    body: "~6 min later: reconciliation, artifacts, browser replay. Completed demos are public.",
  },
];

function SectionTag({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <span
        className="h-2 w-2 shrink-0"
        style={{ backgroundColor: GOLD }}
        aria-hidden
      />
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
        {children}
      </span>
    </div>
  );
}

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export function HomeLanding({
  starting,
  byoUrl,
  email,
  stats,
  gallery,
  onStartDemo,
  onByoUrlChange,
  onStartByo,
  onEmailChange,
  onJoinWaitlist,
}: {
  starting: boolean;
  byoUrl: string;
  email: string;
  stats: {
    demoStarts: number;
    demoFinishes: number;
    shareOpens: number;
    waitlistSignups: number;
  };
  gallery: NightshiftRun[];
  onStartDemo: () => void;
  onByoUrlChange: (v: string) => void;
  onStartByo: () => void;
  onEmailChange: (v: string) => void;
  onJoinWaitlist: () => void;
}) {
  const completionRate =
    stats.demoStarts > 0
      ? Math.round((stats.demoFinishes / stats.demoStarts) * 100)
      : 0;

  const liveUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "https://nightshift-ecru.vercel.app"
  ).replace(/^https?:\/\//, "");

  return (
    <div className="nightshift-home relative min-h-screen bg-[#050505] text-white selection:bg-[rgba(232,185,35,0.25)]">
      {/* Atmospheric layers — Solari earth horizon + subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[100vh] bg-[radial-gradient(ellipse_120%_80%_at_50%_110%,rgba(180,90,35,0.38)_0%,rgba(25,12,5,0.55)_38%,rgba(5,5,5,0.92)_68%,#050505_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_50%_80%_at_50%_-20%,rgba(255,255,255,0.06),transparent)]"
      />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] transition group-hover:border-[#e8b923]/30"
            aria-hidden
          >
            <span
              className="h-3.5 w-3.5 rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${GOLD}, #5a4a10)`,
              }}
            />
          </span>
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">
            Nightshift
          </span>
        </Link>
        <nav className="hidden items-center gap-7 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45 md:flex">
          <a href="#platform" className="transition hover:text-white">
            Why
          </a>
          <a href="#workflow" className="transition hover:text-white">
            Workflow
          </a>
          <a href="#try" className="transition hover:text-white">
            Try it
          </a>
          <a
            href="https://docs.getsolari.com"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-[#e8b923]"
          >
            Docs
          </a>
        </nav>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartDemo}
          disabled={starting}
          className="rounded-md bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-black transition disabled:opacity-50 sm:px-5 sm:text-xs"
        >
          {starting ? "…" : "Run demo"}
        </motion.button>
      </header>

      {/* Hero — split layout, product-first */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-8 lg:grid lg:grid-cols-[1fr_minmax(0,520px)] lg:items-center lg:gap-12 lg:px-10 lg:pb-28 lg:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-left"
        >
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 backdrop-blur-sm"
          >
            <span
              className="relative flex h-2 w-2"
              aria-hidden
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
              Live public demo · Solari SDK
            </span>
          </motion.div>

          <h1 className="mt-8 max-w-xl font-serif text-[2.35rem] leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.35rem]">
            Close the books on{" "}
            <span className="italic text-white/90">portals</span>{" "}
            that were never built for agents.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/58 sm:text-[1.05rem]">
            Nightshift is a reference AP close: one typed runbook chains{" "}
            <span className="text-white/85">browser login</span>,{" "}
            <span className="text-white/85">Python reconciliation</span>, and{" "}
            <span className="text-white/85">desktop filing</span> — then ships a
            shareable work pack with replay.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartDemo}
              disabled={starting}
              className="rounded-md bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-[#e8b923] disabled:opacity-50"
            >
              {starting ? "Starting close…" : "Run tonight's AP close"}
            </motion.button>
            <a
              href="#platform"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-8 py-3.5 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/[0.04]"
            >
              See how it works
              <span aria-hidden className="text-white/40">↓</span>
            </a>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              { k: "~6 min", v: "Full close" },
              { k: "3", v: "Solari envs" },
              { k: "2", v: "Seed mismatches" },
              { k: `${completionRate}%`, v: "Finish rate" },
            ].map((item) => (
              <div key={item.v} className="bg-[#0a0a0a] px-4 py-3">
                <dt className="font-mono text-lg font-medium" style={{ color: GOLD }}>
                  {item.k}
                </dt>
                <dd className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-white/40">
                  {item.v}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-white/30">
            Free on {liveUrl} · no API key · Neon-backed runs
          </p>
        </motion.div>

        <div className="mt-14 lg:mt-0">
          <HeroOperatorPreview />
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        {/* Introduction — editorial + bento problem grid */}
        <section id="platform" className="scroll-mt-8 border-t border-white/[0.08] pt-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
            <motion.div {...fade}>
              <SectionTag>The gap</SectionTag>
              <h2 className="font-serif text-3xl leading-[1.12] sm:text-4xl lg:text-[2.65rem]">
                Ops teams need{" "}
                <span style={{ color: GOLD }}>environments that scale</span>{" "}
                — not another brittle script.
              </h2>
              <blockquote className="mt-8 border-l-2 pl-5 text-lg leading-relaxed text-white/55" style={{ borderColor: GOLD }}>
                Vendor portals have no API. Reconciliation still happens in Python.
                Filing ends in LibreOffice. Nightshift shows what happens when you
                give each step the runtime it actually needs.
              </blockquote>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/45 sm:text-base">
                A single typed runbook orchestrates Solari Browser, Sandbox, and
                Desktop with checkpoints, live streams, session replay, and an
                audit trail you can share with finance.
              </p>
            </motion.div>

            <motion.div
              {...fade}
              transition={{ ...fade.transition, delay: 0.1 }}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"
            >
              {[
                {
                  stat: "0",
                  unit: "APIs",
                  line: "Hostile portals, MFA, CAPTCHA — handled in a stealth browser with recording.",
                },
                {
                  stat: "12",
                  unit: "Invoices",
                  line: "Portal CSV vs books CSV reconciled in an isolated Python sandbox.",
                },
                {
                  stat: "1",
                  unit: "Work pack",
                  line: "Journal filed on a live desktop stream, artifacts published to a public URL.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.unit}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  className="rounded-xl border border-white/[0.08] bg-[#0a0a0a]/80 p-5 backdrop-blur-sm"
                >
                  <p className="font-serif text-4xl" style={{ color: GOLD }}>
                    {item.stat}
                    <span className="ml-2 text-base font-sans font-medium text-white/50">
                      {item.unit}
                    </span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">
                    {item.line}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Three pillars — asymmetric bento */}
          <motion.div {...fade} className="mt-20">
            <SectionTag>Three Solari primitives</SectionTag>
            <h3 className="max-w-2xl text-2xl font-semibold sm:text-3xl">
              One workflow,{" "}
              <span className="text-white/50">three isolated runtimes</span>
            </h3>
          </motion.div>

          <div className="mt-10 grid gap-6 pb-4 lg:grid-cols-3 lg:items-stretch">
            {pillars.map((p, i) => (
              <motion.article
                key={p.id}
                {...fade}
                transition={{ ...fade.transition, delay: i * 0.07 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 lg:p-7"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_50%_100%,rgba(232,185,35,0.14),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="relative flex min-h-[92px] items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                      {p.env}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold sm:text-2xl">{p.title}</h3>
                    <p className="mt-1 font-mono text-[10px] text-white/30">
                      {p.sdk}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider"
                    style={{
                      borderColor: "rgba(232,185,35,0.25)",
                      color: GOLD,
                      backgroundColor: "rgba(232,185,35,0.06)",
                    }}
                  >
                    {p.metric}
                  </span>
                </div>

                <div className="relative my-5 shrink-0">
                  <DemoClipVideo kind={p.uiMock} />
                </div>

                <p className="relative min-h-[4.5rem] text-sm leading-relaxed text-white/50">
                  {p.blurb}
                </p>

                <div className="relative mt-4 min-h-[5.5rem] flex-1 rounded-lg border border-white/[0.06] bg-black/50 p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#e8b923]/70">
                    In this demo
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    {p.nightshift}
                  </p>
                </div>

                <div className="relative mt-auto flex min-h-[1.75rem] flex-wrap gap-1.5 pt-4">
                  {p.features.map((f) => (
                    <span
                      key={f}
                      className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] text-white/40"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Workflow pipeline */}
        <section id="workflow" className="scroll-mt-8 border-t border-white/10 pt-20 mt-16">
          <motion.div {...fade}>
            <SectionTag>One workflow</SectionTag>
            <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
              Everything AI agents need to{" "}
              <span style={{ color: GOLD }}>execute</span> a real close
            </h2>
            <p className="mt-4 max-w-xl text-white/50">
              Give every step the environment it needs without stitching together
              separate infrastructure.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              { phase: "Browser", label: "Portal login + CSV export", time: "~2 min" },
              { phase: "Sandbox", label: "Reconcile + chart exceptions", time: "~1 min" },
              { phase: "Desktop", label: "LibreOffice filing + export", time: "~3 min" },
              { phase: "Pack", label: "Public work pack + replay", time: "instant" },
            ].map((step, i) => (
              <motion.div
                key={step.phase}
                {...fade}
                transition={{ ...fade.transition, delay: i * 0.05 }}
                className="bg-[#0a0a0a] px-5 py-6"
              >
                <p
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: GOLD }}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 font-medium">{step.phase}</p>
                <p className="mt-1 text-sm text-white/45">{step.label}</p>
                <p className="mt-3 font-mono text-[10px] text-white/25">{step.time}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Try it */}
        <section id="try" className="scroll-mt-8 border-t border-white/10 pt-20">
          <motion.div {...fade} className="text-center">
            <SectionTag>Try it</SectionTag>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Public demo — no API key needed
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/50">
              Anyone can run the full close from this page. Watch live, download
              artifacts, share the URL.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {trySteps.map((s, i) => (
              <motion.div
                key={s.n}
                {...fade}
                transition={{ ...fade.transition, delay: i * 0.06 }}
                className="rounded-xl border border-white/[0.08] bg-[#0a0a0a] p-6"
              >
                <span className="font-mono text-2xl" style={{ color: GOLD }}>
                  {s.n}
                </span>
                <h3 className="mt-3 font-medium">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/45">{s.body}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...fade}
            className="mt-10 flex flex-col items-center gap-6 rounded-xl border border-[rgba(232,185,35,0.2)] bg-[rgba(232,185,35,0.04)] p-8 text-center sm:p-10"
          >
            <p className="max-w-lg text-sm text-white/55">
              Keep the tab open — the engine runs over a live event stream. Browser
              replay unlocks after invoice collection. On mobile, use Runbook /
              Live / Work pack tabs.
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartDemo}
              disabled={starting}
              className="rounded-md bg-white px-10 py-3.5 text-sm font-semibold uppercase tracking-wide text-black disabled:opacity-50"
            >
              {starting ? "Launching…" : "Start demo close"}
            </motion.button>
          </motion.div>

          <motion.p {...fade} className="mt-8 text-center text-xs leading-relaxed text-white/30">
            Developers: add{" "}
            <code className="text-[#e8b923]">SOLARI_API_KEY</code> +{" "}
            <code className="text-[#e8b923]">OPENROUTER_API_KEY</code> to{" "}
            <code>.env.local</code>, deploy with Neon Postgres. Solari&apos;s cloud
            browser cannot reach localhost — use Vercel or ngrok.
          </motion.p>
        </section>

        {/* Stats */}
        <motion.section
          {...fade}
          className="mt-16 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { label: "Demo starts", value: stats.demoStarts },
            { label: "Completed", value: stats.demoFinishes },
            { label: "Pack views", value: stats.shareOpens },
            { label: "Finish rate", value: `${completionRate}%` },
          ].map((item) => (
            <div key={item.label} className="bg-[#0a0a0a] px-6 py-5">
              <p className="text-3xl font-semibold" style={{ color: GOLD }}>
                {item.value}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/35">
                {item.label}
              </p>
            </div>
          ))}
        </motion.section>

        {/* BYO + Waitlist */}
        <motion.div {...fade} className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0a] p-6">
            <SectionTag>Connect your portal</SectionTag>
            <p className="text-sm leading-relaxed text-white/45">
              Paste a public vendor portal URL. Runs stay private. Point at Nightshift&apos;s
              VendorNet demo for a full close, or any external AP portal for LLM-guided
              exploration (seed reconciliation if no CSV export is found).
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={byoUrl}
                onChange={(e) => onByoUrlChange(e.target.value)}
                placeholder="https://nightshift-ecru.vercel.app/portal/login"
                className="flex-1 rounded-md border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#e8b923]/40"
              />
              <button
                type="button"
                onClick={onStartByo}
                disabled={starting || !byoUrl.trim()}
                className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium uppercase tracking-wide transition hover:border-white/40 disabled:opacity-40"
              >
                Start
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0a] p-6">
            <SectionTag>Waitlist</SectionTag>
            <p className="text-sm leading-relaxed text-white/45">
              Get notified when BYO onboarding and production runbooks are ready.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 rounded-md border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#e8b923]/40"
              />
              <button
                type="button"
                onClick={onJoinWaitlist}
                disabled={!email.includes("@")}
                className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
              >
                Join
              </button>
            </div>
          </div>
        </motion.div>

        {/* Gallery */}
        {gallery.length > 0 && (
          <motion.section id="gallery" {...fade} className="mt-16 scroll-mt-8">
            <SectionTag>Public closes</SectionTag>
            <h2 className="text-2xl font-semibold sm:text-3xl">Past work packs</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {gallery.map((g, i) => {
                const exceptions =
                  g.reconcile?.filter((r) => r.status !== "matched").length ?? 0;
                return (
                  <motion.li
                    key={g.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={`/run/${g.id}`}
                      className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#0a0a0a] px-5 py-4 transition hover:border-[#e8b923]/30"
                    >
                      <div>
                        <p className="font-medium group-hover:text-[#e8b923]">
                          {g.title}
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-white/35">
                          {new Date(g.updatedAt).toLocaleString()} · run/{g.id}
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2.5 py-1 font-mono text-[10px]"
                        style={{ backgroundColor: GOLD_DIM, color: GOLD }}
                      >
                        {exceptions} exc
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.section>
        )}

        <footer className="mt-20 border-t border-white/10 pt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/35">
              Nightshift · MIT · a{" "}
              <a
                href="https://getsolari.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#e8b923] hover:underline"
              >
                Solari
              </a>{" "}
              use case
            </p>
            <a
              href="https://getsolari.com"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[11px] uppercase tracking-wider text-white/40 transition hover:text-[#e8b923]"
            >
              getsolari.com ↗
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
