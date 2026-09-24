import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const supportedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const draftSchema = z.object({
  draftItems: z
    .array(
      z.object({
        rawLabel: z.string().min(1).max(160),
        price: z.number().nonnegative().nullable(),
        quantity: z.number().positive().nullable(),
        confidence: z.enum(["high", "medium", "low"])
      })
    )
    .max(100)
});

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["draftItems"],
  properties: {
    draftItems: {
      type: "array",
      maxItems: 100,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["rawLabel", "price", "quantity", "confidence"],
        properties: {
          rawLabel: { type: "string" },
          price: { type: ["number", "null"] },
          quantity: { type: ["number", "null"] },
          confidence: { type: "string", enum: ["high", "medium", "low"] }
        }
      }
    }
  }
};

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const image = form.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Attach a receipt image in the image field." }, { status: 400 });
    }

    if (!supportedTypes.has(image.type) || image.size > MAX_RECEIPT_BYTES) {
      return NextResponse.json({ error: "Use a JPEG, PNG, or WebP receipt image smaller than 5 MB." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "Receipt analysis is temporarily unavailable. Add items manually instead.",
          draftItems: [
            { rawLabel: "Sugary cereal", price: 5, quantity: 1, confidence: "medium" },
            { rawLabel: "Sparkling water", price: 2, quantity: 1, confidence: "medium" }
          ]
        },
        { status: 503 }
      );
    }

    const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini",
      store: false,
      instructions:
        "Extract only grocery line items visibly present on this receipt. Never estimate. Use null for unclear price or quantity, and low confidence for uncertain lines.",
      input: [
        { role: "user", content: [{ type: "input_text", text: "Return the receipt lines." }, { type: "input_image", image_url: `data:${image.type};base64,${base64}`, detail: "high" }] }
      ],
      text: { format: { type: "json_schema", name: "receipt_draft", strict: true, schema: responseSchema } }
    });

    return NextResponse.json(draftSchema.parse(JSON.parse(response.output_text)));
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof z.ZodError) {
      return NextResponse.json({ error: "We could not read this clearly. Add items manually instead." }, { status: 422 });
    }
    return apiError(error);
  }
}
