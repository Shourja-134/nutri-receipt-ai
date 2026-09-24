"use client";

import type { OptimizationResult } from "@/lib/types";

export function ResultsPanel({
  result,
  names,
  applied,
  onApply,
  onApplyAll,
  onRestart
}: {
  result: OptimizationResult;
  names: Map<string, string>;
  applied: Set<string>;
  onApply: (original: string) => void;
  onApplyAll: () => void;
  onRestart: () => void;
}) {
  const appliedSavings = result.recommendations
    .filter((item) => applied.has(item.originalProductId))
    .reduce((total, item) => total + item.savings, 0);

  return (
    <section className="space-y-4">
      <div className="card bg-ink text-white" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-lime">Your basket impact</p>
            <h2 className="mt-1 text-2xl font-bold">Make the change that fits</h2>
            <p className="mt-1 max-w-md text-sm text-[#d8e7db]">
              Apply swaps below to update your basket total.
            </p>
          </div>
          <div className="rounded-2xl bg-lime px-4 py-3 text-right text-ink">
            <p className="text-xs font-semibold uppercase tracking-wide">Available savings</p>
            <strong className="mt-1 block text-2xl">${result.totals.savings.toFixed(2)}</strong>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="text-xs text-[#d8e7db]">Current basket</p>
            <strong className="mt-1 block text-xl">${result.totals.current.toFixed(2)}</strong>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="text-xs text-[#d8e7db]">After applied swaps</p>
            <strong className="mt-1 block text-xl">${(result.totals.current - appliedSavings).toFixed(2)}</strong>
          </div>
          <div className="rounded-xl border border-lime/40 bg-lime/10 p-3">
            <p className="text-xs text-[#d8e7db]">Saved so far</p>
            <strong className="mt-1 block text-xl text-lime">${appliedSavings.toFixed(2)}</strong>
          </div>
        </div>

        <p className="mt-3 text-xs text-[#d8e7db]">
          {appliedSavings > 0
            ? `${appliedSavings.toFixed(2)} saved with the swaps you applied.`
            : "No swaps applied yet."}
        </p>
      </div>

      {result.recommendations.length > 0 && (
        <button type="button" className="button-primary w-full" onClick={onApplyAll}>
          Apply all eligible swaps
        </button>
      )}

      {result.recommendations.map((item) => (
        <article key={item.originalProductId} className="card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-[#587066]">{names.get(item.originalProductId)}</p>
              <h3 className="text-lg font-bold">→ {names.get(item.replacementProductId)}</h3>
            </div>
            <span className="rounded-full bg-mint px-3 py-1 text-sm font-semibold">${item.savings.toFixed(2)} less</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="chip bg-white">+{item.nutritionGain} nutrition</span>
            <span className="chip bg-white">Fits preferences</span>
            <span className="chip bg-white">No extra prep</span>
          </div>

          <p className="mt-3 text-sm text-[#587066]">A verified alternative that fits the rules you selected.</p>

          <button
            type="button"
            className={applied.has(item.originalProductId) ? "button-secondary mt-4 w-full" : "button-primary mt-4 w-full"}
            onClick={() => onApply(item.originalProductId)}
          >
            {applied.has(item.originalProductId) ? "Applied · Undo" : "Apply swap"}
          </button>
        </article>
      ))}

      {result.exclusions.length > 0 && (
        <div className="rounded-2xl bg-mint p-4 text-sm">Some items stay as they are because there is no verified swap that fits your rules.</div>
      )}

      <button type="button" onClick={onRestart} className="button-secondary w-full">
        Start a new basket
      </button>
    </section>
  );
}
