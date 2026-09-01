import Link from "next/link";
import { opHeaderBtnGold } from "@/components/operator-theme";

export default function RunNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8b923]">
        Nightshift
      </p>
      <h1 className="mt-2 text-2xl font-semibold">Work pack not found</h1>
      <p className="mt-2 max-w-md text-sm text-white/45">
        This run may have expired, or it was created before Neon Postgres was
        connected and redeployed. Start a new demo from the home page.
      </p>
      <Link href="/" className={`${opHeaderBtnGold} mt-6`}>
        Back to home
      </Link>
    </div>
  );
}
