"use client";

import React, { useEffect, useMemo, useState } from "react";

type Slide = {
  title: string;
  text: string;
};

type Props = {
  slides: Slide[];
  intervalMs?: number;
};

export default function AuthPromo({ slides, intervalMs = 5000 }: Props) {
  const items = useMemo(() => slides.filter(Boolean), [slides]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      setIdx((p) => (p + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [items.length, intervalMs]);

  if (!items.length) return null;

  const current = items[idx];

  return (
    <div className="flex flex-col justify-center min-h-[40svh] select-none">
      <div className="transition-opacity duration-500 will-change-opacity">
        <h1 className="text-[var(--text-heading-2)] leading-[var(--text-heading-2--line-height)] font-[var(--text-heading-2--font-weight)]">
          {current.title}
        </h1>
        <p className="mt-3 max-w-md text-dark-500 text-[var(--text-lead)] leading-[var(--text-lead--line-height)] font-[var(--text-lead--font-weight)]">
          {current.text}
        </p>
      </div>

      <div className="mt-6 flex gap-2" aria-hidden="true">
        {items.map((_, i) => (
          <span
            key={i}
            className={
              i === idx
                ? "size-2 rounded-full bg-light-100"
                : "size-2 rounded-full bg-light-100/40"
            }
          />
        ))}
      </div>
    </div>
  );
}
