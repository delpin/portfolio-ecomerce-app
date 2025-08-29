"use client";

type Props = {
  onGoogle?: () => void;
  onApple?: () => void;
  className?: string;
};

export default function SocialProviders({
  onGoogle,
  onApple,
  className,
}: Props) {
  return (
    <div className={["space-y-3", className ?? ""].join(" ")}>
      <button
        type="button"
        onClick={onGoogle}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-light-300 bg-light-100 px-4 py-3 text-dark-900 hover:bg-light-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
        aria-label="Continue with Google"
      >
        <svg
          width="21"
          height="20"
          viewBox="0 0 21 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10.5316 18.3333C15.1339 18.3333 18.8649 14.6024 18.8649 10C18.8649 5.39763 15.1339 1.66667 10.5316 1.66667C5.9292 1.66667 2.19824 5.39763 2.19824 10C2.19824 14.6024 5.9292 18.3333 10.5316 18.3333Z"
            stroke="#111111"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.5316 13.3333C12.3725 13.3333 13.8649 11.841 13.8649 10C13.8649 8.15906 12.3725 6.66667 10.5316 6.66667C8.69063 6.66667 7.19824 8.15906 7.19824 10C7.19824 11.841 8.69063 13.3333 10.5316 13.3333Z"
            stroke="#111111"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.1729 6.66667H10.5312"
            stroke="#111111"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.82324 5.05L7.64824 11.6667"
            stroke="#111111"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.59766 18.2833L13.4143 11.6667"
            stroke="#111111"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
        <svg
          width="21"
          height="20"
          viewBox="0 0 21 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10.6253 17.45C11.8753 17.45 12.917 18.3333 13.9587 18.3333C16.4587 18.3333 18.9587 11.6667 18.9587 8.15001C18.9303 7.07061 18.4763 6.0462 17.6959 5.30005C16.9154 4.5539 15.8716 4.14651 14.792 4.16668C12.942 4.16668 11.4587 5.36668 10.6253 5.83334C9.79199 5.36668 8.30866 4.16668 6.45866 4.16668C5.37845 4.14431 4.33341 4.55097 3.55243 5.29758C2.77146 6.04419 2.31822 7.06989 2.29199 8.15001C2.29199 11.6667 4.79199 18.3333 7.29199 18.3333C8.33366 18.3333 9.37533 17.45 10.6253 17.45Z"
            stroke="#111111"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.95801 1.66666C9.79134 2.08332 10.6247 3.33332 10.6247 5.83332"
            stroke="#111111"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[var(--text-body-medium)] leading-[var(--text-body-medium--line-height)] font-[var(--text-body-medium--font-weight)]">
          Continue with Apple
        </span>
      </button>
    </div>
  );
}
