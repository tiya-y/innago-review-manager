import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        reviewer: true,
        round: true,
        giftCard: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
