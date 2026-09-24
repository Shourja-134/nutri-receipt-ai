import { NextResponse } from "next/server";
import { getStoreStats } from "@/lib/store";

export async function GET() {
  const stats = await getStoreStats();
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    database: {
      sessions: stats.sessionCount,
      feedback: stats.feedbackCount
    }
  });
}
