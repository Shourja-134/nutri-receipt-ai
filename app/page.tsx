"use client";

import { useRef, useState } from "react";
import { products, CATALOG_VERSION } from "@/lib/catalog";
import type { BasketLine, Preferences, ReceiptLine, OptimizationResult } from "@/lib/types";
import { BasketEditor } from "@/components/BasketEditor";
import { QuickSetup } from "@/components/QuickSetup";
import { ReceiptReview } from "@/components/ReceiptReview";
import { ResultsPanel } from "@/components/ResultsPanel";

const defaults: Preferences = {
  priority: "balanced",
  maxPrepMinutes: 15,
  dietaryTags: [],
  excludedAllergens: [],
  cuisinePreferences: ["Indian-friendly"]
};

const demoBasket: BasketLine[] = [
  { productId: "sugary-cereal", quantity: 1, isComfortFood: false },
  { productId: "soda", quantity: 1, isComfortFood: false },
  { productId: "potato-chips", quantity: 1, isComfortFood: false }
];

type Stage = "landing" | "setup" | "basket" | "receipt-review" | "results";

export default function Home() {
  const [stage, setStage] = useState<Stage>("landing");
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [basket, setBasket] = useState<BasketLine[]>([]);
  const [draftItems, setDraftItems] = useState<ReceiptLine[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const names = new Map(products.map((product) => [product.id, product.name]));

  const begin = (source: "demo" | "manual" | "receipt") => {
    setNotice(null);

    if (source === "receipt") {
      inputRef.current?.click();
      return;
    }

    setBasket(source === "demo" ? demoBasket : []);
    setStage("setup");
  };

  const uploadReceipt = async (file: File) => {
    setLoading(true);
    setNotice(null);

    try {
      const form = new FormData();
      form.set("image", file);

      const response = await fetch("/api/receipt", { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "We could not read that receipt.");

      setDraftItems(body.draftItems ?? []);
      setStage("receipt-review");
    } catch (error) {
      const message = error instanceof Error ? error.message : "We could not read that receipt.";
      setNotice(message);
      setStage("landing");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const confirmReceipt = async () => {
    setLoading(true);
    setNotice(null);

    try {
      const usable = draftItems.filter((item) => item.rawLabel.trim());
      const response = await fetch("/api/catalog-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: usable })
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "We could not match those items.");

      const matched = body.matches.flatMap((match: { candidates: Array<{ productId: string }> }) =>
        match.candidates[0] ? [{ productId: match.candidates[0].productId, quantity: 1, isComfortFood: false }] : []
      );

      setBasket(matched);
      setNotice(matched.length === usable.length ? null : "Some receipt lines need a manual product choice. Review them from the basket list.");
      setStage("setup");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not match those items.";
      setNotice(message);
    } finally {
      setLoading(false);
    }
  };

  const analyze = async () => {
    setLoading(true);
    setNotice(null);

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basket, preferences, catalogVersion: CATALOG_VERSION })
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not analyze this basket.");

      setResult(body);
      setApplied(new Set());
      setStage("results");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not analyze this basket.";
      setNotice(message);
    } finally {
      setLoading(false);
    }
  };

  const applySingleSwap = (originalProductId: string) => {
    setApplied((current) => {
      const next = new Set(current);
      if (next.has(originalProductId)) {
        next.delete(originalProductId);
      } else {
        next.add(originalProductId);
      }
      return next;
    });
  };

  const applyAllSwaps = () => {
    if (!result) return;
    setApplied(new Set(result.recommendations.map((item) => item.originalProductId)));
  };

  const restart = () => {
    setBasket([]);
    setResult(null);
    setApplied(new Set());
    setStage("landing");
    setNotice(null);
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-8 flex items-center justify-between">
        <button type="button" onClick={restart} className="text-left">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-lime text-xl">✦</span>
          <span className="ml-2 text-lg font-bold">Nutri-Receipt AI</span>
        </button>
        <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold">No judgment. Just options.</span>
      </header>

      {loading && (
        <div role="status" className="mb-4 rounded-2xl bg-[#fff0b7] p-3 text-sm font-medium">
          Checking price, preferences, and prep time…
        </div>
      )}

      {notice && (
        <div role="alert" className="mb-4 rounded-2xl bg-[#ffe1da] p-3 text-sm">
          {notice}
        </div>
      )}

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) uploadReceipt(file);
        }}
      />

      {stage === "landing" && (
        <section className="space-y-6">
          <div className="pt-6">
            <p className="font-semibold text-[#2f7d62]">Healthy choices, real-life rules</p>
            <h1 className="mt-2 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">Better groceries without spending more.</h1>
            <p className="mt-4 max-w-lg text-lg text-[#587066]">Find practical swaps that fit your budget, preferences, and time.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={() => begin("demo")} className="card text-left hover:-translate-y-0.5">
              <span className="text-2xl">✦</span>
              <strong className="mt-3 block">Try demo</strong>
              <span className="mt-1 block text-sm text-[#587066]">See results in seconds.</span>
            </button>

            <button type="button" onClick={() => begin("manual")} className="card text-left hover:-translate-y-0.5">
              <span className="text-2xl">＋</span>
              <strong className="mt-3 block">Add items</strong>
              <span className="mt-1 block text-sm text-[#587066]">Build your own basket.</span>
            </button>

            <button type="button" onClick={() => begin("receipt")} className="card text-left hover:-translate-y-0.5">
              <span className="text-2xl">⌁</span>
              <strong className="mt-3 block">Receipt scan</strong>
              <span className="mt-1 block text-sm text-[#587066]">Upload a receipt image.</span>
            </button>
          </div>
        </section>
      )}

      {stage === "setup" && (
        <QuickSetup
          value={preferences}
          onChange={setPreferences}
          onContinue={() => setStage("basket")}
        />
      )}

      {stage === "basket" && (
        <BasketEditor
          basket={basket}
          products={products}
          onChange={setBasket}
          onAnalyze={analyze}
        />
      )}

      {stage === "receipt-review" && (
        <ReceiptReview
          items={draftItems}
          onChange={setDraftItems}
          onConfirm={confirmReceipt}
          onBack={() => setStage("landing")}
        />
      )}

      {stage === "results" && result && (
        <ResultsPanel
          result={result}
          names={names}
          applied={applied}
          onApply={applySingleSwap}
          onApplyAll={applyAllSwaps}
          onRestart={restart}
        />
      )}
    </main>
  );
}
