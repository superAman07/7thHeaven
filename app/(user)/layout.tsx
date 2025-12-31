import FooterPage from "@/components/home/Footer";
import NavBar from "@/components/home/NavBar";
import { WishlistProvider } from "@/components/WishlistContext";
import type { Metadata } from "next";
import { Suspense } from "react";

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
      <Suspense fallback={<div style={{ height: '90px', backgroundColor: '#000' }}></div>}>
        <NavBar />
      </Suspense>
      <main>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </main>
      <FooterPage />
    </div>
  );
}