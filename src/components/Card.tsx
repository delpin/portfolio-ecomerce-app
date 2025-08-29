import React from "react";
import Image from "next/image";
import Link from "next/link";

export type BadgeTone = "orange" | "green" | "red";

export interface CardProps {
  title: string;
  subtitle?: string;
  price?: string | number;
  imageSrc: string;
  imageAlt?: string;
  badge?: { text: string; tone?: BadgeTone };
  colorsCount?: number;
  href?: string;
  className?: string;
}

function toneClasses(tone: BadgeTone = "orange") {
  if (tone === "green") {
    return "text-[--color-green] bg-[color:oklch(0_0_0/_0.06)]";
  }
  if (tone === "red") {
    return "text-[--color-red] bg-[color:oklch(0_0_0/_0.06)]";
  }
  return "text-[--color-orange] bg-[color:oklch(0_0_0/_0.06)]";
}

export default function Card({
  title,
  subtitle,
  price,
  imageSrc,
  imageAlt = "",
  badge,
  colorsCount,
  href,
  className,
}: CardProps) {
  const baseClass =
    [
      "group block overflow-hidden rounded-xl bg-light-100 text-dark-900 transition-shadow duration-200 hover:shadow-lg",
      className ?? "",
    ].join(" ");

  const content = (
    <>
      <div className="relative bg-light-200 aspect-[4/3]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain"
          priority={false}
        />
        {badge ? (
          <span
            className={[
              "absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-[var(--text-footnote)] leading-[var(--text-footnote--line-height)] font-[var(--text-footnote--font-weight)]",
              toneClasses(badge.tone),
            ].join(" ")}
          >
            {badge.text}
          </span>
        ) : null}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[var(--text-heading-3)] leading-[var(--text-heading-3--line-height)] font-[var(--text-heading-3--font-weight)]">
              {title}
            </h3>
            {price !== undefined ? (
              <span className="hidden sm:block text-[var(--text-body)] leading-[var(--text-body--line-height)] font-[var(--text-body--font-weight)] text-dark-900">
                {typeof price === "number" ? `$${price.toFixed(2)}` : price}
              </span>
            ) : null}
          </div>

          {subtitle ? (
            <p className="text-dark-700 text-[var(--text-body)] leading-[var(--text-body--line-height)] font-[var(--text-body--font-weight)]">
              {subtitle}
            </p>
          ) : null}

          {colorsCount ? (
            <p className="text-dark-700 text-[var(--text-body)] leading-[var(--text-body--line-height)] font-[var(--text-body--font-weight)]">
              {colorsCount} Colour
            </p>
          ) : null}

          {price !== undefined ? (
            <span className="sm:hidden mt-1 text-[var(--text-body)] leading-[var(--text-body--line-height)] font-[var(--text-body--font-weight)] text-dark-900">
              {typeof price === "number" ? `$${price.toFixed(2)}` : price}
            </span>
          ) : null}
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  return <article className={baseClass}>{content}</article>;
}
