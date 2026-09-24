"use client";

export type ReceiptLine = {
  rawLabel: string;
  price: number | null;
  quantity: number | null;
  confidence: "high" | "medium" | "low";
};

export function ReceiptReview({
  items,
  onChange,
  onConfirm,
  onBack
}: {
  items: ReceiptLine[];
  onChange: (items: ReceiptLine[]) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <section className="card space-y-5">
      <div>
        <p className="text-sm font-semibold text-[#2f7d62]">Receipt review</p>
        <h2 className="text-2xl font-bold">Check every item before we continue</h2>
        <p className="mt-1 text-sm text-[#587066]">We never optimize directly from an unreviewed receipt.</p>
      </div>

      {items.map((item, index) => (
        <div key={index} className="rounded-2xl border border-[#dce7df] p-3">
          <div className="flex gap-2">
            <input
              value={item.rawLabel}
              onChange={(event) =>
                onChange(
                  items.map((line, lineIndex) =>
                    lineIndex === index ? { ...line, rawLabel: event.target.value } : line
                  )
                )
              }
              className="min-w-0 flex-1 rounded-lg border border-[#bfd0c5] px-2 py-1"
            />
            <button type="button" onClick={() => onChange(items.filter((_, lineIndex) => lineIndex !== index))} className="text-sm text-[#a24231]">
              Delete
            </button>
          </div>

          <p className="mt-2 text-sm text-[#587066]">
            {item.price === null ? "Price unclear" : `$${item.price.toFixed(2)}`} · {item.quantity ?? 1} item · {" "}
            <span className={item.confidence === "low" ? "text-[#a24231]" : "text-[#2f7d62]"}>{item.confidence} confidence</span>
          </p>
        </div>
      ))}

      <button type="button" onClick={() => onChange([...items, { rawLabel: "", price: null, quantity: 1, confidence: "low" }])} className="button-secondary w-full">
        Add missing item
      </button>

      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" className="button-secondary" onClick={onBack}>
          Back
        </button>
        <button type="button" disabled={!items.some((item) => item.rawLabel.trim())} className="button-primary" onClick={onConfirm}>
          Confirm items
        </button>
      </div>
    </section>
  );
}
