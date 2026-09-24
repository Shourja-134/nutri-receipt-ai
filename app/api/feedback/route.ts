import { NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { logFeedback, getSession } from "@/lib/store";
import { feedbackSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = feedbackSchema.parse(await request.json());

    if (payload.sessionId) {
      const session = await getSession(payload.sessionId);
      if (!session) {
        return NextResponse.json({ error: "Unknown anonymous session." }, { status: 401 });
      }
    }

    await logFeedback({
      sessionId: payload.sessionId,
      originalProductId: payload.originalProductId,
      replacementProductId: payload.replacementProductId,
      event: payload.event,
      catalogVersion: payload.catalogVersion
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
