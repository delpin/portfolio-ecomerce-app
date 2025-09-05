"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState<boolean>(defaultOpen);

  return (
    <section className="py-4">
      <button
        type="button"
        className="flex w-full items-center justify-between py-3 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="text-heading-5 text-dark-900">{title}</span>
        <ChevronDown
          className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          size={18}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="pt-2 text-body text-dark-800">{children}</div>
      ) : null}
    </section>
  );
}
