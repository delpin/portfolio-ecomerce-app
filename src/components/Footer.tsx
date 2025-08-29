import React from "react";
import Image from "next/image";
import Link from "next/link";

type LinkItem = { label: string; href?: string };
type LinkGroup = { title: string; items: LinkItem[] };

const GROUPS: LinkGroup[] = [
  {
    title: "Featured",
    items: [{ label: "Air Force 1" }, { label: "Huarache" }, { label: "Air Max 90" }, { label: "Air Max 95" }],
  },
  {
    title: "Shoes",
    items: [{ label: "All Shoes" }, { label: "Custom Shoes" }, { label: "Jordan Shoes" }, { label: "Running Shoes" }],
  },
  {
    title: "Clothing",
    items: [
      { label: "All Clothing" },
      { label: "Modest Wear" },
      { label: "Hoodies & Pullovers" },
      { label: "Shirts & Tops" },
    ],
  },
  {
    title: "Kids'",
    items: [
      { label: "Infant & Toddler Shoes" },
      { label: "Kids' Shoes" },
      { label: "Kids' Jordan Shoes" },
      { label: "Kids' Basketball Shoes" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-light-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10">
          <div className="flex items-start">
            <Image src="/logo.svg" alt="Brand" width={44} height={44} className="invert" />
          </div>

          <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {GROUPS.map((group) => (
              <div key={group.title}>
                <h4 className="mb-4 text-[var(--text-heading-3)] leading-[var(--text-heading-3--line-height)] font-[var(--text-heading-3--font-weight)]">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.items.map((it) => (
                    <li key={it.label}>
                      <Link
                        href={it.href ?? "#"}
                        className="text-dark-500 hover:text-light-100 text-[var(--text-body)] leading-[var(--text-body--line-height)] font-[var(--text-body--font-weight)]"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex md:justify-end items-start gap-4">
            {[
              { src: "/x.svg", alt: "X" },
              { src: "/facebook.svg", alt: "Facebook" },
              { src: "/instagram.svg", alt: "Instagram" },
            ].map((icon) => (
              <a
                key={icon.alt}
                href="#"
                aria-label={icon.alt}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-light-100 text-dark-900 hover:opacity-90"
              >
                <Image src={icon.src} alt={icon.alt} width={18} height={18} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-dark-700/30 pt-6">
          <p className="text-dark-500 text-[var(--text-footnote)] leading-[var(--text-footnote--line-height)] font-[var(--text-footnote--font-weight)]">
            © {new Date().getFullYear()} Your Brand. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
