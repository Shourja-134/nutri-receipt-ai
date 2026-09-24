export type Product = {
  id: string;
  name: string;
  category: "breakfast" | "drink" | "snack" | "bread" | "staple" | "frozen";
  price: number;
  currency: string;
  nutritionScore: number;
  tags: string[];
  prepMinutes: number;
  cuisineTags: string[];
  allergens: string[];
  healthierSwapIds: string[];
  packSizeLabel: string;
  catalogVersion: string;
};

export type BasketLine = {
  productId: string;
  quantity: number;
  isComfortFood: boolean;
};

export type Preferences = {
  priority: "save" | "balanced" | "health";
  maxPrepMinutes: number;
  dietaryTags: string[];
  excludedAllergens: string[];
  cuisinePreferences: string[];
};

export type ReceiptLine = {
  rawLabel: string;
  price: number | null;
  quantity: number | null;
  confidence: "high" | "medium" | "low";
};

export type Recommendation = {
  originalProductId: string;
  replacementProductId: string;
  savings: number;
  nutritionGain: number;
  eligibility: {
    budgetSafe: boolean;
    lifestyleSafe: boolean;
    effortSafe: boolean;
  };
  matchLevel: "perfect" | "strong" | "optional";
};

export type OptimizationResult = {
  catalogVersion: string;
  totals: {
    current: number;
    projected: number;
    savings: number;
  };
  recommendations: Recommendation[];
  exclusions: Array<{ originalProductId: string; reason: string }>;
};
