import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Invalid request", details: error.flatten() }, { status: 400 });
  }

  console.error("API request failed:", error);
  return NextResponse.json({ error: "Unable to complete this request. Please try again." }, { status: 500 });
}
