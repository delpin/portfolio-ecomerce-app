import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-svh grid grid-cols-1 md:grid-cols-2 bg-light-100">
      <section className="relative flex flex-col justify-between bg-dark-900 text-light-100 p-6 md:p-10">
        <div className="flex items-center">
          <Image src="/logo.svg" alt="Brand" width={36} height={36} className="invert" />
        </div>

        <div className="mt-16 md:mt-0 space-y-3">
          <h1 className="text-[var(--text-heading-2)] leading-[var(--text-heading-2--line-height)] font-[var(--text-heading-2--font-weight)]">
            Just Do It
          </h1>
          <p className="max-w-md text-dark-500 text-[var(--text-lead)] leading-[var(--text-lead--line-height)] font-[var(--text-lead--font-weight)]">
            Join millions of athletes and fitness enthusiasts who trust us for their performance needs.
          </p>
        </div>

        <div className="flex gap-2" aria-hidden="true">
          <span className="size-2 rounded-full bg-light-100/80" />
          <span className="size-2 rounded-full bg-light-100/60" />
          <span className="size-2 rounded-full bg-light-100/40" />
        </div>

        <p className="sr-only">Brand introduction panel</p>
      </section>

      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          {children}
          <p className="mt-8 text-center text-dark-700 text-[var(--text-footnote)] leading-[var(--text-footnote--line-height)]">
            By continuing, you agree to our{" "}
            <Link href="#" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
