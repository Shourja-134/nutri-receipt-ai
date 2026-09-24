"use client";

import type { Product, BasketLine } from "@/lib/types";

export type { BasketLine };

export function BasketEditor({
  basket,
  products,
  onChange,
  onAnalyze
}: {
  basket: BasketLine[];
  products: Product[];
  onChange: (basket: BasketLine[]) => void;
  onAnalyze: () => void;
}) {
  const selected = (id: string) => products.find((product) => product.id === id);
  const total = basket.reduce((sum, line) => sum + (selected(line.productId)?.price ?? 0) * line.quantity, 0);

  const update = (index: number, patch: Partial<BasketLine>) => {
    onChange(basket.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)));
  };

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#2f7d62]">Your basket</p>
          <h2 className="text-2xl font-bold">What are you shopping for?</h2>
        </div>
        <strong className="text-lg">${total.toFixed(2)}</strong>
      </div>

      <div className="card space-y-3">
        {basket.length === 0 ? (
          <p className="rounded-2xl bg-mint p-4 text-sm">Your basket is empty. Add an item or try the demo basket.</p>
        ) : (
          basket.map((line, index) => {
            const product = selected(line.productId);

            return (
              <div key={`${line.productId}-${index}`} className="rounded-2xl border border-[#e4ece5] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong>{product?.name}</strong>
                    <p className="text-sm text-[#587066]">
                      ${product?.price.toFixed(2)} · {product?.prepMinutes} min prep
                    </p>
                  </div>
                  <button type="button" className="text-sm font-semibold text-[#a24231]" onClick={() => onChange(basket.filter((_, lineIndex) => lineIndex !== index))}>
                    Remove
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <label className="text-sm">
                    Qty
                    <input
                      aria-label={`Quantity for ${product?.name}`}
                      type="number"
                      min="1"
                      max="100"
                      value={line.quantity}
                      onChange={(event) => update(index, { quantity: Math.max(1, Number(event.target.value)) })}
                      className="ml-1 w-14 rounded-lg border border-[#bfd0c5] px-2 py-1"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => update(index, { isComfortFood: !line.isComfortFood })}
                    className={`chip ${line.isComfortFood ? "bg-[#fff0b7]" : "bg-white"}`}
                  >
                    {line.isComfortFood ? "★ Keeping this" : "Keep comfort food"}
                  </button>
                </div>
              </div>
            );
          })
        )}

        <label className="block">
          <span className="sr-only">Add a product</span>
          <select
            defaultValue=""
            onChange={(event) => {
              const value = event.target.value;
              if (!value) return;
              onChange([...basket, { productId: value, quantity: 1, isComfortFood: false }]);
              event.currentTarget.value = "";
            }}
            className="w-full rounded-xl border border-dashed border-[#7ea98d] bg-[#fbfefb] p-3"
          >
            <option value="">+ Add a grocery item</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button type="button" className="button-primary w-full" onClick={onAnalyze}>
        Analyze basket
      </button>
    </section>
  );
}
