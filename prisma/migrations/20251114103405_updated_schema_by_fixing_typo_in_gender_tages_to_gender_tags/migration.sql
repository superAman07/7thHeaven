/*
  Warnings:

  - The `genderTags` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "GenderTags" AS ENUM ('Male', 'Female', 'Unisex');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "genderTags",
ADD COLUMN     "genderTags" "GenderTags"[];

-- DropEnum
DROP TYPE "GenderTages";
