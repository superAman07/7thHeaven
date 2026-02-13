import FooterPage from "@/components/home/Footer";
import NavBar from "@/components/home/NavBar2";
import { WishlistProvider } from "@/components/WishlistContext";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getSiteContent, defaultGlobalSettings } from "@/lib/site-content";
import { getSiteSettings } from "@/lib/site-settings";
import AnnouncementBar from "@/components/AnnouncementBar";
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Celsius - Perfumes & Fragrances",
  description: "Discover long-lasting perfumes, luxury collections, and exclusive signature scents.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function UserPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalSettings = await getSiteContent('global_settings', defaultGlobalSettings);
  const siteSettings = await getSiteSettings();
  return (
    <div id="main-wrapper">
      <AnnouncementBar 
        text={siteSettings?.announcementText ?? null}
        link={siteSettings?.announcementLink ?? null}
        isVisible={siteSettings?.showAnnouncement ?? false}
      />
      <Suspense fallback={<div style={{ height: '90px', backgroundColor: '#000' }}></div>}>
        <NavBar isAnnouncementVisible={siteSettings?.showAnnouncement} />
      </Suspense>
      <main>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </main>
      <FooterPage settings={siteSettings} />
    </div>
  );
}