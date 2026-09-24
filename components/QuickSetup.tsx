"use client";

import type { Preferences } from "@/lib/types";

const priorities: Array<{ id: Preferences["priority"]; title: string; copy: string }> = [
  { id: "save", title: "Save the most", copy: "Lower the total basket cost." },
  { id: "balanced", title: "Balanced", copy: "Improve nutrition without extra spend." },
  { id: "health", title: "Healthiest possible", copy: "Maximise nutrition gains." }
];

export function QuickSetup({
  value,
  onChange,
  onContinue
}: {
  value: Preferences;
  onChange: (value: Preferences) => void;
  onContinue: () => void;
}) {
  const toggle = (field: "dietaryTags" | "excludedAllergens", item: string) => {
    const current = value[field];
    const next = current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item];
    onChange({ ...value, [field]: next });
  };

  return (
    <section className="card space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#2f7d62]">Quick setup</p>
        <h2 className="mt-1 text-2xl font-bold">What should this basket optimize for?</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {priorities.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange({ ...value, priority: item.id })}
            className={`rounded-2xl border p-4 text-left ${
              value.priority === item.id ? "border-ink bg-mint" : "border-[#dce7df] bg-white"
            }`}
          >
            <strong className="block">{item.title}</strong>
            <span className="mt-1 block text-sm text-[#587066]">{item.copy}</span>
          </button>
        ))}
      </div>

      <label className="block font-semibold">
        Maximum cooking time
        <select
          value={value.maxPrepMinutes}
          onChange={(event) => onChange({ ...value, maxPrepMinutes: Number(event.target.value) })}
          className="ml-3 rounded-xl border border-[#bfd0c5] bg-white px-3 py-2"
        >
          <option value={5}>5 minutes</option>
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
        </select>
      </label>

      <div className="space-y-2">
        <p className="font-semibold">Dietary needs</p>
        <div className="flex flex-wrap gap-2">
          {[
            "vegetarian",
            "vegan"
          ].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggle("dietaryTags", item)}
              className={`chip ${value.dietaryTags.includes(item) ? "bg-mint" : "bg-white"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">Avoid allergens</p>
        <div className="flex flex-wrap gap-2">
          {["gluten", "milk"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggle("excludedAllergens", item)}
              className={`chip ${value.excludedAllergens.includes(item) ? "bg-[#ffe1da]" : "bg-white"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="button-primary w-full" onClick={onContinue}>Continue to basket</button>
    </section>
  );
}
