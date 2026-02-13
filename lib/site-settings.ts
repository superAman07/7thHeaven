import prisma from '@/lib/prisma';

export interface SiteSettings {
    id: string;
    companyName: string;
    tagline: string | null;
    logoUrl: string | null;
    phone: string | null;
    email: string | null;
    whatsapp: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string;
    pincode: string | null;
    businessHours: string | null;
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    youtube: string | null;
    aboutTitle: string | null;
    aboutContent: string | null;
    aboutImage: string | null;
    footerText: string | null;
    announcementText: string | null;
    showAnnouncement: boolean;
    announcementLink: string | null;
    updatedAt?: Date;
}

export async function getSiteSettings() {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { id: 'site-settings' },
        });
        return settings;
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return null;
    }
}