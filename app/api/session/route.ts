import { NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { createSession } from "@/lib/store";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await createSession();
    return NextResponse.json({ ok: true, session });
  } catch (error) {
    return apiError(error);
  }
}
