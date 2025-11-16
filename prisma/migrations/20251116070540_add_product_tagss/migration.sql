-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discountPercentage" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "isNewArrival" BOOLEAN NOT NULL DEFAULT false;
