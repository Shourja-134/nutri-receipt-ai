import { NextResponse } from "next/server";
import { products } from "@/lib/catalog";
import { apiError } from "@/lib/http";
import { catalogMatchSchema } from "@/lib/validation";

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);

function confidence(label: string, name: string) {
  const words = normalise(label);
  const target = normalise(name);
  return words.length ? words.filter((word) => target.includes(word)).length / words.length : 0;
}

export async function POST(request: Request) {
  try {
    const { lines } = catalogMatchSchema.parse(await request.json());

    const matches = lines.map((line) => ({
      rawLabel: line.rawLabel,
      candidates: products
        .map((product) => ({
          productId: product.id,
          name: product.name,
          confidence: Number(confidence(line.rawLabel, product.name).toFixed(2))
        }))
        .filter((candidate) => candidate.confidence > 0)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3)
    }));

    return NextResponse.json({ matches });
  } catch (error) {
    return apiError(error);
  }
}
