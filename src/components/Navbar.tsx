"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type NavItem = { label: string; href?: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Men", href: "#" },
  { label: "Women", href: "#" },
  { label: "Kids", href: "#" },
  { label: "Collections", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      const t = e.target as Node;
      if (open && panelRef.current && !panelRef.current.contains(t) && !btnRef.current?.contains(t)) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [open]);

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="w-full bg-light-100 border-b border-light-300 text-dark-900"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link href="#" aria-label="Home" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Brand logo" width={32} height={32} priority />
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href ?? "#"}
                  className="text-[var(--text-body)] leading-[var(--text-body--line-height)] font-[var(--text-body--font-weight)] hover:text-dark-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-900 rounded-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-6">
            <button
              type="button"
              className="text-[var(--text-body)] leading-[var(--text-body--line-height)] font-[var(--text-body--font-weight)] text-dark-900 hover:text-dark-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-900 rounded-sm"
            >
              Search
            </button>
            <button
              type="button"
              className="text-[var(--text-body)] leading-[var(--text-body--line-height)] font-[var(--text-body--font-weight)] text-dark-900 hover:text-dark-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-900 rounded-sm"
              aria-label="View cart"
            >
              My Cart (2)
            </button>
          </div>

          <button
            ref={btnRef}
            type="button"
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-md border border-light-300 p-2 text-dark-900 hover:bg-light-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
          >
            <span className="sr-only">Menu</span>
            <svg width="24" height="24" viewBox="0 0 24 24" className="fill-current">
              {open ? (
                <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" />
              ) : (
                <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        className={`md:hidden border-t border-light-300 bg-light-100 ${open ? "block" : "hidden"}`}
      >
        <div className="px-4 py-3 space-y-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href ?? "#"}
              onClick={() => setOpen(false)}
              className="block text-dark-900 hover:text-dark-700 text-[var(--text-body)] leading-[var(--text-body--line-height)] font-[var(--text-body--font-weight)]"
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-2 mt-2 border-t border-light-300 flex items-center gap-6">
            <button
              type="button"
              className="text-dark-900 hover:text-dark-700 text-[var(--text-body)] leading-[var(--text-body--line-height)] font-[var(--text-body--font-weight)]"
            >
              Search
            </button>
            <button
              type="button"
              aria-label="View cart"
              className="text-dark-900 hover:text-dark-700 text-[var(--text-body)] leading-[var(--text-body--line-height)] font-[var(--text-body--font-weight)]"
            >
              My Cart (2)
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
