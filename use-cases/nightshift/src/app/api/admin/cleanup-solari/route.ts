import { NextResponse } from "next/server";
import { cleanupStaleSolariSessions } from "@/lib/solari/cleanup";

export const runtime = "nodejs";
export const maxDuration = 60;

/** One-shot cleanup for orphaned Solari sandboxes/desktops. */
export async function POST(req: Request) {
  const secret = process.env.NIGHTSHIFT_ADMIN_SECRET;
  if (secret && req.headers.get("x-nightshift-admin") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await cleanupStaleSolariSessions();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cleanup failed";
    console.error("[nightshift] cleanup-solari failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
