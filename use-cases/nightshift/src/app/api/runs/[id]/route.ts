import { NextResponse } from "next/server";
import { getRun, getRunFromStorage, sanitizeRunForClient, STORAGE_ONLY_HEADER } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const storageOnly = req.headers.get(STORAGE_ONLY_HEADER) === "1";
  const run = storageOnly ? await getRunFromStorage(id) : await getRun(id);
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(sanitizeRunForClient(run));
}
