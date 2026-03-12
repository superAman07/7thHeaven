-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "awb" TEXT,
ADD COLUMN     "courierUrl" TEXT,
ADD COLUMN     "shippedAt" TIMESTAMP(3);
