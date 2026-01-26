import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface GlobalSettings {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  supportAddress: string;
  officeMapsLink?: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
  };
  logoUrl: string;
}

export interface HomeAboutSection {
  displayTitle: string;
  image: string;
  imageAlt: string;
  paragraphs: string[];
  buttonText: string;
  buttonLink: string;
  showButton: boolean;
}

export interface PageContent {
  seoTitle: string;
  seoDescription: string;
  heroImage?: string;
  heroTitle?: string;
  contentHtml: string;
  lastUpdated?: string;
}

export interface HomeSection {
  id: string;
  title: string;
  categorySlug: string;
  bgClass?: string;
  order: number;
}

export const defaultHomeSections: HomeSection[] = [
  { id: '1', title: 'Skyline Series', categorySlug: 'skyline-series', bgClass: 'bg-[#fcfaf7]', order: 1 },
  { id: '2', title: 'Corporate Collection', categorySlug: 'corporate-collection', bgClass: 'bg-[#fcfaf7]', order: 2 },
  { id: '3', title: 'Tatva Series', categorySlug: 'tatva-series', bgClass: 'bg-[#fcfaf7]', order: 3 },
];

export const defaultGlobalSettings: GlobalSettings = {
  siteName: "Celsius",
  supportEmail: "support@celsius.com",
  supportPhone: "+91 98765 43210",
  supportAddress: "Celsius HQ, Business Bay, India",
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
  },
  logoUrl: "/assets/images/logo.png"
};

export const defaultHomeAbout: HomeAboutSection = {
  displayTitle: "The Celsius Story",
  image: "/assets/images/product/bwebp.webp",
  imageAlt: "Celsius Luxury Perfume",
  paragraphs: [
    `Celsius is not just a perfume; it’s a statement of Indian luxury. Proudly crafted under the "Make in Bharat" initiative, we challenge the global narrative by proving that world-class luxury doesn't have to come from abroad.`,
    `Our perfumers source the finest essential oils from across the globe—the same oils used by expensive designer labels—but we blend and bottle them right here.`,
    `With Celsius by 7th Heaven, you are buying direct luxury. Earn rewards, build your collection, and experience the scent of success.`
  ],
  buttonText: "Read More",
  buttonLink: "/about",
  showButton: true
};

export async function getSiteContent<T>(section: string, defaultValue: T): Promise<T> {
  try {
    const record = await prisma.siteContent.findUnique({
      where: { section }
    });

    if (!record || !record.content) {
      return defaultValue;
    }

    return { ...defaultValue, ...(record.content as object) }; 
  } catch (error) {
    console.error(`[SiteContent] Failed to fetch section: ${section}`, error);
    return defaultValue;
  }
}

export async function updateSiteContent(section: string, content: any, adminId?: string) {
  return prisma.siteContent.upsert({
    where: { section },
    update: {
      content: content as Prisma.InputJsonValue,
      updatedBy: adminId,
    },
    create: {
      section,
      content: content as Prisma.InputJsonValue,
      updatedBy: adminId,
    },
  });
}