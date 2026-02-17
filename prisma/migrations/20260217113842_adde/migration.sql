-- CreateTable
CREATE TABLE "NotifySubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "collectionSlug" TEXT,
    "source" TEXT NOT NULL DEFAULT 'coming_soon',
    "isNotified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotifySubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotifySubscriber_email_collectionSlug_key" ON "NotifySubscriber"("email", "collectionSlug");
