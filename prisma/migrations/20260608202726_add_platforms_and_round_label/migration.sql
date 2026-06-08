-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Platform" ADD VALUE 'GOOD_FIRMS';
ALTER TYPE "Platform" ADD VALUE 'SOURCE_FORGE';
ALTER TYPE "Platform" ADD VALUE 'FINANCES_ONLINE';
ALTER TYPE "Platform" ADD VALUE 'FACEBOOK';
ALTER TYPE "Platform" ADD VALUE 'PRODUCT_HUNT';
ALTER TYPE "Platform" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "Round" ADD COLUMN     "label" TEXT;
