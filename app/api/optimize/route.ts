import { NextResponse } from "next/server";
import { CATALOG_VERSION } from "@/lib/catalog";
import { apiError } from "@/lib/http";
import { optimizeBasket } from "@/lib/optimizer";
import { optimizeSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = optimizeSchema.parse(await request.json());

    if (input.catalogVersion !== CATALOG_VERSION) {
      return NextResponse.json(
        { error: "Catalog has changed. Refresh and try again.", catalogVersion: CATALOG_VERSION },
        { status: 409 }
      );
    }

    return NextResponse.json(optimizeBasket(input));
  } catch (error) {
    return apiError(error);
  }
}
