import FooterPage from "@/components/home/Footer";
import NavBar from "@/components/home/NavBar";
import { CartProvider } from "@/components/CartContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "7th Heaven - Perfumes & Fragrances",
  description: "Discover long-lasting perfumes, luxury collections, and exclusive signature scents.",
};

export default function UserPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div id="main-wrapper">
      <CartProvider>
        <NavBar />
        <main>
          {children}
        </main>
        <FooterPage />
      </CartProvider>
    </div>
  );
}