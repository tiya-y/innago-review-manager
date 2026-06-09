import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Gift card approvals — published reviews with a PENDING_APPROVAL gift card
    const pendingGiftCards = await prisma.giftCard.findMany({
      where: { status: "PENDING_APPROVAL" },
      include: {
        reviewer: true,
        review: true,
        round: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Low-star outreach needed — published reviews with rating ≤ 3,
    //    no existing draft, no existing outreach draft
    const lowStarReviews = await prisma.review.findMany({
      where: {
        status: "PUBLISHED",
        rating: { lte: 3, not: null },
        draft: null, // no outreach draft created yet
      },
      include: {
        reviewer: true,
        round: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    // Group gift cards by reviewer so multi-platform reviewers show as one card
    const gcByReviewer: Record<string, typeof pendingGiftCards> = {};
    for (const gc of pendingGiftCards) {
      const key = gc.reviewerId;
      if (!gcByReviewer[key]) gcByReviewer[key] = [];
      gcByReviewer[key].push(gc);
    }

    // Group low-star reviews by reviewer
    const lsGroups: Record<string, typeof lowStarReviews> = {};
    for (const review of lowStarReviews) {
      const key = review.reviewerId;
      if (!lsGroups[key]) lsGroups[key] = [];
      lsGroups[key].push(review);
    }

    return NextResponse.json({
      giftCardGroups: Object.values(gcByReviewer),
      lowStarGroups: Object.values(lsGroups),
      totalPending: Object.keys(gcByReviewer).length + Object.keys(lsGroups).length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch queue" }, { status: 500 });
  }
}
