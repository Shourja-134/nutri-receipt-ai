import { productsById } from "@/lib/catalog";
import type { Product, OptimizationResult, Recommendation } from "@/lib/types";
import type { z } from "zod";
import type { optimizeSchema } from "@/lib/validation";

type OptimizeInput = z.infer<typeof optimizeSchema>;

type Candidate = {
  product: Product;
  savings: number;
  nutritionGain: number;
  cuisineFit: boolean;
};

const rounded = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const overlaps = (left: string[], right: string[]) => left.some((item) => right.includes(item));

function candidateFor(original: Product, replacement: Product, input: OptimizeInput): Candidate | null {
  const { preferences } = input;

  if (replacement.nutritionScore <= original.nutritionScore) return null;
  if (preferences.priority !== "health" && replacement.price > original.price) return null;
  if (replacement.prepMinutes > original.prepMinutes || replacement.prepMinutes > preferences.maxPrepMinutes) return null;
  if (!preferences.dietaryTags.every((tag) => replacement.tags.includes(tag))) return null;
  if (overlaps(replacement.allergens, preferences.excludedAllergens)) return null;

  return {
    product: replacement,
    savings: rounded(original.price - replacement.price),
    nutritionGain: replacement.nutritionScore - original.nutritionScore,
    cuisineFit: preferences.cuisinePreferences.length === 0 || overlaps(replacement.cuisineTags, preferences.cuisinePreferences)
  };
}

function rank(candidates: Candidate[], priority: OptimizeInput["preferences"]["priority"]) {
  return candidates.sort((a, b) => {
    if (priority === "save") return b.savings - a.savings || b.nutritionGain - a.nutritionGain;
    if (priority === "health") return b.nutritionGain - a.nutritionGain || b.savings - a.savings;
    return b.nutritionGain - a.nutritionGain || Number(b.cuisineFit) - Number(a.cuisineFit) || b.savings - a.savings;
  });
}

export function optimizeBasket(input: OptimizeInput): OptimizationResult {
  const originalTotal = rounded(
    input.basket.reduce((total, item) => total + (productsById.get(item.productId)?.price ?? 0) * item.quantity, 0)
  );

  const recommendations: Recommendation[] = [];
  const exclusions: Array<{ originalProductId: string; reason: string }> = [];

  for (const item of input.basket) {
    const original = productsById.get(item.productId);
    if (!original) {
      exclusions.push({ originalProductId: item.productId, reason: "no_verified_match" });
      continue;
    }

    if (item.isComfortFood) {
      exclusions.push({ originalProductId: original.id, reason: "comfort_food" });
      continue;
    }

    const candidates = rank(
      original.healthierSwapIds
        .map((id) => productsById.get(id))
        .filter((product): product is Product => !!product)
        .map((product) => candidateFor(original, product, input))
        .filter((candidate): candidate is Candidate => !!candidate),
      input.preferences.priority
    );

    const best = candidates[0];
    if (!best) {
      exclusions.push({ originalProductId: original.id, reason: "no_eligible_swap" });
      continue;
    }

    recommendations.push({
      originalProductId: original.id,
      replacementProductId: best.product.id,
      savings: rounded(best.savings * item.quantity),
      nutritionGain: best.nutritionGain,
      eligibility: {
        budgetSafe: best.savings >= 0,
        lifestyleSafe: best.cuisineFit,
        effortSafe: true
      },
      matchLevel: best.savings >= 0 && best.cuisineFit ? "perfect" : "optional"
    });
  }

  const savings = rounded(recommendations.reduce((total, recommendation) => total + Number(recommendation.savings), 0));

  return {
    catalogVersion: input.catalogVersion,
    totals: {
      current: originalTotal,
      projected: rounded(originalTotal - savings),
      savings
    },
    recommendations,
    exclusions
  };
}
