import { NextResponse } from "next/server";
import { getAnalyticsSummary, listPublicRuns } from "@/lib/store";

export async function GET() {
  const [summary, runs] = await Promise.all([
    getAnalyticsSummary(),
    listPublicRuns(12),
  ]);
  return NextResponse.json({ summary, runs });
}
