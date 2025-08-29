"use client";

import Image from "next/image";

type Props = {
  onGoogle?: () => void;
  onApple?: () => void;
  className?: string;
};

export default function SocialProviders({ onGoogle, onApple, className }: Props) {
  return (
    <div className={["space-y-3", className ?? ""].join(" ")}>
      <button
        type="button"
        onClick={onGoogle}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-dark-900 hover:bg-light-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
        aria-label="Continue with Google"
      >
        <Image src="/google.svg" alt="" width={18} height={18} aria-hidden="true" />
        <span className="text-[var(--text-body-medium)] leading-[var(--text-body-medium--line-height)] font-[var(--text-body-medium--font-weight)]">
          Continue with Google
        </span>
      </button>

      <button
        type="button"
        onClick={onApple}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-dark-900 hover:bg-light-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
        aria-label="Continue with Apple"
      >
        <Image src="/apple.svg" alt="" width={18} height={18} aria-hidden="true" />
        <span className="text-[var(--text-body-medium)] leading-[var(--text-body-medium--line-height)] font-[var(--text-body-medium--font-weight)]">
          Continue with Apple
        </span>
      </button>
    </div>
  );
}
