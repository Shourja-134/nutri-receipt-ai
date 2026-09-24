import OpenAI from "openai";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { explainSchema } from "@/lib/validation";

const fallback = (facts: {
  original: string;
  replacement: string;
  originalPrice: number;
  replacementPrice: number;
  nutritionGain: number;
  reasons: string[];
}) =>
  `${facts.replacement} replaces ${facts.original}, changing the price from $${facts.originalPrice.toFixed(2)} to $${facts.replacementPrice.toFixed(2)}. It improves the demo nutrition score by ${facts.nutritionGain} point${facts.nutritionGain === 1 ? "" : "s"} and ${facts.reasons.join(", ")}.`;

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const facts = explainSchema.parse(await request.json());

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        explanation: fallback(facts),
        factKeysUsed: ["originalPrice", "replacementPrice", "nutritionGain", "reasons"],
        source: "template"
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      store: false,
      instructions:
        "Write at most two plain-language sentences. Use only the supplied facts. Do not add health, ingredient, price, or preparation claims.",
      input: JSON.stringify(facts)
    });

    return NextResponse.json({
      explanation: response.output_text.trim(),
      factKeysUsed: ["originalPrice", "replacementPrice", "nutritionGain", "reasons"],
      source: "ai"
    });
  } catch (error) {
    return apiError(error);
  }
}
