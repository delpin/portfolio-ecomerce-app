"use client";

import { useState } from "react";
import Link from "next/link";
import SocialProviders from "./SocialProviders";

type Mode = "sign-in" | "sign-up";

type Props = {
  mode: Mode;
  onSubmit?: (data: { name?: string; email: string; password: string }) => void;
};

export default function AuthForm({ mode, onSubmit }: Props) {
  const [show, setShow] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name")?.toString(),
      email: (fd.get("email") as string) ?? "",
      password: (fd.get("password") as string) ?? "",
    };
    onSubmit?.(payload);
  }

  const title = mode === "sign-in" ? "Welcome back!" : "Join us today!";
  const switchText =
    mode === "sign-in" ? (
      <>
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="underline">
          Sign Up
        </Link>
      </>
    ) : (
      <>
        Already have an account?{" "}
        <Link href="/sign-in" className="underline">
          Sign In
        </Link>
      </>
    );

  return (
    <div>
      <p className="mb-4 text-center text-dark-700 text-[var(--text-body)] leading-[var(--text-body--line-height)]">
        {switchText}
      </p>

      <h2 className="text-center mb-6 text-[var(--text-heading-2)] leading-[var(--text-heading-2--line-height)] font-[var(--text-heading-2--font-weight)] text-dark-900">
        {title}
      </h2>

      <SocialProviders className="mb-6" />

      <div className="flex items-center gap-3 my-6" aria-hidden="true">
        <span className="h-px bg-light-300 flex-1" />
        <span className="text-dark-700 text-[var(--text-caption)] leading-[var(--text-caption--line-height)]">
          Or {mode === "sign-in" ? "sign in" : "sign up"} with
        </span>
        <span className="h-px bg-light-300 flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "sign-up" ? (
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-dark-900 text-[var(--text-caption)] leading-[var(--text-caption--line-height)]"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 outline-none placeholder:text-dark-500 focus:ring-2 focus:ring-dark-900"
            />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-dark-900 text-[var(--text-caption)] leading-[var(--text-caption--line-height)]"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="johndoe@gmail.com"
            required
            className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 outline-none placeholder:text-dark-500 focus:ring-2 focus:ring-dark-900"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-dark-900 text-[var(--text-caption)] leading-[var(--text-caption--line-height)]"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              placeholder="minimum 8 characters"
              required
              minLength={8}
              className="w-full rounded-xl border border-light-300 bg-light-100 px-4 py-3 pr-10 outline-none placeholder:text-dark-500 focus:ring-2 focus:ring-dark-900"
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              onClick={() => setShow((v) => !v)}
              className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-dark-700 hover:bg-light-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current">
                {show ? (
                  <path d="M12 5c5 0 9.27 3.11 11 7-1.73 3.89-6 7-11 7S2.73 15.89 1 12c1.73-3.89 6-7 11-7zm0 2C8.13 7 4.86 9.06 3.35 12 4.86 14.94 8.13 17 12 17s7.14-2.06 8.65-5C19.14 9.06 15.87 7 12 7zm0 2a3 3 0 110 6 3 3 0 010-6z" />
                ) : (
                  <path d="M12 5c5 0 9.27 3.11 11 7-.46 1.04-1.1 2-1.86 2.86l1.42 1.42-1.41 1.41-1.51-1.51C17.73 18.26 15.04 19 12 19c-5 0-9.27-3.11-11-7 .86-1.93 2.3-3.61 4.05-4.85L2.1 3.2 3.52 1.8l18.38 18.38-1.41 1.41-3.3-3.3A12.32 12.32 0 0112 19c-5 0-9.27-3.11-11-7 1-2.24 2.62-4.16 4.6-5.53l2.1 2.1A6.01 6.01 0 006 12a6 6 0 009.9 4.27l-1.5-1.5A3.99 3.99 0 018 12c0-.7.18-1.36.49-1.93l-2-2A10.4 10.4 0 003.35 12C4.86 14.94 8.13 17 12 17c1.15 0 2.26-.18 3.28-.5l-1.8-1.8A6 6 0 016 12c0-.86.18-1.67.51-2.4l-1.5-1.5C3.4 9.05 2.4 10.43 2 12c1.73 3.89 6 7 10 7 2.29 0 4.41-.62 6.2-1.69l1.53 1.53 1.41-1.41L3.52 1.8 2.1 3.2 5.1 6.2C7.36 4.81 9.83 4 12 4z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-full bg-dark-900 px-5 py-3 text-light-100 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
        >
          {mode === "sign-in" ? "Sign In" : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
