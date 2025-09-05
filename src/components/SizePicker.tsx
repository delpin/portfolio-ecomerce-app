"use client";

import React from "react";

export default function SizePicker({
  sizes,
  onChange,
}: {
  sizes: string[];
  onChange?: (size: string | null) => void;
}) {
  const [active, setActive] = React.useState<string | null>(null);

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!sizes.length) return;
    const idx = active ? sizes.indexOf(active) : 0;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = sizes[(idx + 1) % sizes.length];
      setActive(next);
      onChange?.(next);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = sizes[(idx - 1 + sizes.length) % sizes.length];
      setActive(prev);
      onChange?.(prev);
    }
  };

  return (
    <div
      className="grid grid-cols-5 gap-2"
      role="listbox"
      aria-label="Select size"
      tabIndex={0}
      onKeyDown={onKey}
    >
      {sizes.map((size) => {
        const selected = active === size;
        return (
          <button
            key={size}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => {
              setActive(size);
              onChange?.(size);
            }}
            className={`rounded-md border px-3 py-2 text-button ${
              selected
                ? "border-dark-900 bg-dark-900 text-light-100"
                : "border-light-300 bg-light-100 text-dark-900"
            } focus:outline-none focus:ring-2 focus:ring-dark-900`}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
