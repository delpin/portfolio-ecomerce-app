import Image from "next/image";
import Link from "next/link";
import AuthPromo from "@/components/AuthPromo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-svh grid grid-cols-1 md:grid-cols-2 bg-light-100">
      <section className="relative flex flex-col bg-dark-900 text-light-100 p-6 md:p-10">
        <header className="flex items-center">
          <Image src="/logo.svg" alt="Brand" width={36} height={36} />
        </header>

        <div className="flex-1 flex items-center">
          <AuthPromo
            slides={[
              {
                title: "Just Do It",
                text: "Join millions of athletes and fitness enthusiasts who trust us for their performance needs.",
              },
              {
                title: "Engineered for Speed",
                text: "Lightweight materials and responsive cushioning for every stride.",
              },
              {
                title: "Train Smarter",
                text: "Designed to keep you comfortable during the toughest sessions.",
              },
            ]}
          />
        </div>

        <footer className="mt-8 text-[var(--text-footnote)] leading-[var(--text-footnote--line-height)] text-light-100/80">
          © {new Date().getFullYear()} Nike. All rights reserved.
        </footer>
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
