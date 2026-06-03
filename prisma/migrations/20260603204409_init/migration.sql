-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('G2', 'CAPTERRA', 'TRUSTPILOT', 'GOOGLE', 'APP_STORE', 'GOOGLE_PLAY');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('PO', 'TENANT');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReviewerStatus" AS ENUM ('CONTACTED', 'SCREENSHOT_RECEIVED', 'REVIEW_PUBLISHED', 'GIFT_CARD_SENT', 'OPTED_OUT');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'SCREENSHOT_RECEIVED', 'PUBLISHED', 'NOT_PUBLISHED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "GiftCardStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "DraftType" AS ENUM ('LOW_STAR_OUTREACH', 'PUBLIC_RESPONSE', 'THANK_YOU');

-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'SENT', 'REJECTED');

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "launchedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformTarget" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "giftCardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contactCount" INTEGER NOT NULL DEFAULT 0,
    "goalReviews" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlatformTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reviewer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "userType" "UserType" NOT NULL,
    "roundId" TEXT NOT NULL,
    "status" "ReviewerStatus" NOT NULL DEFAULT 'CONTACTED',
    "outreachAt" TIMESTAMP(3),
    "screenshotReceivedAt" TIMESTAMP(3),

    CONSTRAINT "Reviewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "rating" INTEGER,
    "reviewText" TEXT,
    "screenshotUrl" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "publishedAt" TIMESTAMP(3),
    "flagReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "GiftCardStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "approvedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "amazonOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewId" TEXT,
    "type" "DraftType" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "publicResponse" TEXT,
    "status" "DraftStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "approvedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformStats" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "currentRating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "goalRating" DOUBLE PRECISION,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_reviewId_key" ON "GiftCard"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Draft_reviewId_key" ON "Draft"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformStats_platform_key" ON "PlatformStats"("platform");

-- AddForeignKey
ALTER TABLE "PlatformTarget" ADD CONSTRAINT "PlatformTarget_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviewer" ADD CONSTRAINT "Reviewer_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Reviewer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Reviewer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Reviewer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;
