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
      <p className="mb-4 text-center text-dark-700 leading-[var(--text-body--line-height)]">
        {switchText}
      </p>

      <h2 className="text-center mb-6  leading-[var(--text-heading-2--line-height)] font-[var(--text-heading-2--font-weight)] text-dark-900">
        {title}
      </h2>

      <SocialProviders className="mb-6" />

      <div className="flex items-center gap-3 my-6" aria-hidden="true">
        <span className="h-px bg-light-300 flex-1" />
        <span className="text-dark-700 leading-[var(--text-caption--line-height)]">
          Or {mode === "sign-in" ? "sign in" : "sign up"} with
        </span>
        <span className="h-px bg-light-300 flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "sign-up" ? (
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-dark-900 leading-[var(--text-caption--line-height)]"
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
            className="block text-dark-900 leading-[var(--text-caption--line-height)]"
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
            className="block text-dark-900 leading-[var(--text-caption--line-height)]"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
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
              {show ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.7181 10.29C1.64865 10.1029 1.64865 9.89709 1.7181 9.71C2.39452 8.06987 3.5427 6.66753 5.01708 5.68074C6.49146 4.69396 8.22564 4.16718 9.99977 4.16718C11.7739 4.16718 13.5081 4.69396 14.9825 5.68074C16.4568 6.66753 17.605 8.06987 18.2814 9.71C18.3509 9.89709 18.3509 10.1029 18.2814 10.29C17.605 11.9301 16.4568 13.3325 14.9825 14.3192C13.5081 15.306 11.7739 15.8328 9.99977 15.8328C8.22564 15.8328 6.49146 15.306 5.01708 14.3192C3.5427 13.3325 2.39452 11.9301 1.7181 10.29Z"
                    stroke="#111111"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                    stroke="#111111"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.7181 10.29C1.64865 10.1029 1.64865 9.89709 1.7181 9.71C2.39452 8.06987 3.5427 6.66753 5.01708 5.68074C6.49146 4.69396 8.22564 4.16718 9.99977 4.16718C11.7739 4.16718 13.5081 4.69396 14.9825 5.68074C16.4568 6.66753 17.605 8.06987 18.2814 9.71C18.3509 9.89709 18.3509 10.1029 18.2814 10.29C17.605 11.9301 16.4568 13.3325 14.9825 14.3192C13.5081 15.306 11.7739 15.8328 9.99977 15.8328C8.22564 15.8328 6.49146 15.306 5.01708 14.3192C3.5427 13.3325 2.39452 11.9301 1.7181 10.29Z"
                    stroke="#111111"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                    stroke="#111111"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.5 2.5L17.5 17.5"
                    stroke="#111111"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
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
