import { z } from "zod";

export const preferenceSchema = z.object({
  priority: z.enum(["save", "balanced", "health"]),
  maxPrepMinutes: z.number().int().min(0).max(240),
  dietaryTags: z.array(z.string().min(1).max(48)).max(12),
  excludedAllergens: z.array(z.string().min(1).max(48)).max(24),
  cuisinePreferences: z.array(z.string().min(1).max(48)).max(12)
});

export const optimizeSchema = z.object({
  basket: z
    .array(
      z.object({
        productId: z.string().min(1).max(80),
        quantity: z.number().int().positive().max(100),
        isComfortFood: z.boolean()
      })
    )
    .min(1)
    .max(100),
  preferences: preferenceSchema,
  catalogVersion: z.string().min(1).max(64)
});

export const catalogMatchSchema = z.object({
  lines: z
    .array(
      z.object({
        rawLabel: z.string().min(1).max(160),
        price: z.number().nonnegative().nullable().optional(),
        quantity: z.number().positive().nullable().optional()
      })
    )
    .min(1)
    .max(100)
});

export const explainSchema = z.object({
  original: z.string().min(1).max(100),
  replacement: z.string().min(1).max(100),
  originalPrice: z.number().nonnegative(),
  replacementPrice: z.number().nonnegative(),
  nutritionGain: z.number().positive().max(9),
  reasons: z.array(z.string().min(1).max(80)).min(1).max(3),
  userPriority: z.enum(["save", "balanced", "health"])
});

export const feedbackSchema = z.object({
  sessionId: z.string().uuid().optional(),
  originalProductId: z.string().min(1).max(80),
  replacementProductId: z.string().min(1).max(80),
  event: z.enum(["accepted", "dismissed"]),
  catalogVersion: z.string().min(1).max(64)
});

export const sessionSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.string().datetime().optional()
});
