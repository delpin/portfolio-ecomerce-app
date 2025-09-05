import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="antialiased">
      {/* Hydration boundary ensures Navbar (client) sees latest cart store */}
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
