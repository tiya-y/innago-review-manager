import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Returns all emails that have ever been contacted — used to exclude from future rounds
export async function GET() {
  try {
    const reviewers = await prisma.reviewer.findMany({
      select: { email: true },
      distinct: ["email"],
    });

    const emails = reviewers.map((r) => r.email.toLowerCase().trim());
    return NextResponse.json({ emails, count: emails.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch exclusions" }, { status: 500 });
  }
}
