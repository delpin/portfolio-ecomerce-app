import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-svh flex flex-col antialiased">
      {/* Hydration boundary ensures Navbar (client) sees latest cart store */}
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
