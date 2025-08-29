import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const jostSans = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ecommerce App",
  description: "Shop the latest products",
};

export default function RootGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${jostSans.variable} antialiased`}>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
