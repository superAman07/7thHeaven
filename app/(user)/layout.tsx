import FooterPage from "@/components/home/Footer";
import NavBar from "@/components/home/NavBar";
import { WishlistProvider } from "@/components/WishlistContext";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getSiteContent, defaultGlobalSettings } from "@/lib/site-content";
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "7th Heaven - Perfumes & Fragrances",
  description: "Discover long-lasting perfumes, luxury collections, and exclusive signature scents.",
};

export default async function UserPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalSettings = await getSiteContent('global_settings', defaultGlobalSettings);
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
      <FooterPage settings={globalSettings} />
    </div>
  );
}