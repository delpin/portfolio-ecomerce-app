"use client";

import React from "react";
import Image from "next/image";
import { Check, ImageOff } from "lucide-react";

type VariantImages = Record<string, string[]>;

type Swatch = {
  id: string;
  label: string;
  bgClass: string; // tailwind class for background color
};

export default function ProductGallery({
  imagesByVariant,
  swatches,
  alt,
}: {
  imagesByVariant: VariantImages;
  swatches: Swatch[];
  alt: string;
}) {
  const initialVariant = React.useMemo(() => {
    const ids = Object.keys(imagesByVariant);
    return ids[0] ?? "default";
  }, [imagesByVariant]);

  const [selectedVariantId, setSelectedVariantId] =
    React.useState<string>(initialVariant);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);

  const broken = React.useRef<Set<string>>(new Set());

  const allImages = React.useMemo(() => {
    const arr = imagesByVariant[selectedVariantId] ?? [];
    // фильтруем известные сломанные изображения
    return arr.filter((src) => !broken.current.has(src));
  }, [imagesByVariant, selectedVariantId]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [selectedVariantId]);

  const currentSrc = allImages[selectedIndex];
  const [loaded, setLoaded] = React.useState<boolean>(false);

  const handleMainError = () => {
    if (currentSrc) {
      broken.current.add(currentSrc);
      const candidate = allImages.find((src) => !broken.current.has(src));
      const nextIdx = candidate ? allImages.indexOf(candidate) : -1;
      setSelectedIndex(nextIdx >= 0 ? nextIdx : 0);
    }
  };

  const onKeyMain = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (allImages.length === 0) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % allImages.length);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + allImages.length) % allImages.length);
    }
  };

  return (
    <div className="w-full">
      {/* Swatches */}
      {swatches?.length ? (
        <div className="mb-4 flex items-center gap-3">
          {swatches.map((s) => {
            const selected = s.id === selectedVariantId;
            return (
              <button
                key={s.id}
                type="button"
                aria-label={s.label}
                aria-pressed={selected}
                onClick={() => setSelectedVariantId(s.id)}
                className={`relative h-9 w-9 rounded-full border border-light-300 focus:outline-none focus:ring-2 focus:ring-dark-900 ${s.bgClass}`}
              >
                {selected ? (
                  <span className="absolute inset-0 grid place-items-center">
                    <Check size={16} className="text-dark-900" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[80px_1fr] lg:gap-4">
        {/* Thumbs (desktop left) */}
        <div className="hidden lg:block">
          <div className="flex lg:flex-col gap-2 overflow-auto max-h-[520px] pr-1">
            {allImages.length ? (
              allImages.map((src, idx) => {
                const isActive = idx === selectedIndex;
                return (
                  <button
                    key={src + idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative aspect-square w-20 overflow-hidden rounded-md border ${
                      isActive ? "border-dark-900" : "border-light-300"
                    } focus:outline-none focus:ring-2 focus:ring-dark-900`}
                  >
                    <Image
                      src={src}
                      alt="thumbnail"
                      fill
                      sizes="80px"
                      className="object-cover"
                      onError={() => {
                        broken.current.add(src);
                      }}
                    />
                  </button>
                );
              })
            ) : (
              <div className="grid place-items-center aspect-square w-20 rounded-md bg-light-200 text-dark-600">
                <ImageOff size={20} />
              </div>
            )}
          </div>
        </div>

        {/* Main image */}
        <div
          tabIndex={0}
          onKeyDown={onKeyMain}
          className="relative aspect-square w-full overflow-hidden rounded-xl bg-light-200 outline-none focus:ring-2 focus:ring-dark-900"
        >
          {currentSrc ? (
            <>
              {!loaded ? (
                <div className="absolute inset-0 animate-pulse bg-light-300" />
              ) : null}
              <Image
                src={currentSrc}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                onError={handleMainError}
                onLoadingComplete={() => setLoaded(true)}
                priority
              />
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-dark-600">
              <ImageOff size={28} />
            </div>
          )}
        </div>

        {/* Thumbs (mobile bottom) */}
        <div className="lg:hidden">
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {allImages.length ? (
              allImages.map((src, idx) => {
                const isActive = idx === selectedIndex;
                return (
                  <button
                    key={src + idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-md border ${
                      isActive ? "border-dark-900" : "border-light-300"
                    } focus:outline-none focus:ring-2 focus:ring-dark-900`}
                  >
                    <Image
                      src={src}
                      alt="thumbnail"
                      fill
                      sizes="80px"
                      className="object-cover"
                      onError={() => {
                        broken.current.add(src);
                      }}
                    />
                  </button>
                );
              })
            ) : (
              <div className="grid place-items-center aspect-square w-20 rounded-md bg-light-200 text-dark-600">
                <ImageOff size={20} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
