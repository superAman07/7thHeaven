-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "announcementLink" TEXT,
ADD COLUMN     "announcementText" TEXT,
ADD COLUMN     "showAnnouncement" BOOLEAN NOT NULL DEFAULT false;
