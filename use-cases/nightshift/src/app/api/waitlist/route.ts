import { NextResponse } from "next/server";
import { addWaitlist, appendAnalytics } from "@/lib/store";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; note?: string };
  if (!body.email?.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  await addWaitlist({
    email: body.email,
    note: body.note,
    at: new Date().toISOString(),
  });

  await appendAnalytics({
    at: new Date().toISOString(),
    kind: "waitlist_signup",
    meta: { email: body.email },
  });

  return NextResponse.json({ ok: true });
}
