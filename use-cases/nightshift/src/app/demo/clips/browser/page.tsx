"use client";

export default function BrowserClipPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] p-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 bg-[#141414] px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <div className="ml-2 flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-black/60 px-3 py-1">
            <span className="font-mono text-[10px] text-emerald-400/80">🔒</span>
            <span className="truncate font-mono text-[10px] text-white/55">
              vendornet.enterprise/ap/invoices
            </span>
          </div>
          <span className="shrink-0 rounded-full border border-[#e8b923]/30 bg-[rgba(232,185,35,0.08)] px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-[#e8b923]">
            recording
          </span>
        </div>
        <iframe
          src="/portal/dashboard"
          title="Vendor portal session"
          className="h-[min(58vh,420px)] w-full bg-[#e8e4dc]"
        />
      </div>
    </div>
  );
}
