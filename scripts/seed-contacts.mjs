/**
 * Seed script — imports po_contacts.csv into Supabase.
 * Run: node scripts/seed-contacts.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ── Platform mapping ────────────────────────────────────────────────────────
const PLATFORM_MAP = {
  "g2":              "G2",
  "capterra":        "CAPTERRA",
  "trustpilot":      "TRUSTPILOT",
  "google":          "GOOGLE",
  "app store":       "APP_STORE",
  "google play":     "GOOGLE_PLAY",
  "good firms":      "GOOD_FIRMS",
  "source forge":    "SOURCE_FORGE",
  "finances online": "FINANCES_ONLINE",
  "facebook":        "FACEBOOK",
  "product hunt":    "PRODUCT_HUNT",
};

function parsePlatform(raw) {
  if (!raw || !raw.trim()) return null;
  return PLATFORM_MAP[raw.trim().toLowerCase()] ?? "OTHER";
}

function parseStatus(raw) {
  const s = (raw || "").trim().toLowerCase();
  if (s === "published")           return "PUBLISHED";
  if (s === "screenshot received") return "SCREENSHOT_RECEIVED";
  if (s === "not published")       return "NOT_PUBLISHED";
  return "PENDING";
}

function parseDate(raw) {
  if (!raw || !raw.trim()) return null;
  try {
    const d = new Date(raw.trim());
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function parseCSV(text) {
  const lines = text.split("\n").filter(Boolean);
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    // Handle quoted fields
    const values = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else current += char;
    }
    values.push(current.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

async function main() {
  const csvPath = resolve(__dirname, "../data/po_contacts.csv");
  const csv = readFileSync(csvPath, "utf8");
  const rows = parseCSV(csv);

  console.log(`Parsed ${rows.length} rows from CSV`);

  // ── 1. Build rounds map ─────────────────────────────────────────────────
  const roundLabels = [...new Set(rows.map(r => r.round_name?.trim() || "Historical"))];
  console.log(`Found ${roundLabels.length} rounds:`, roundLabels);

  const roundMap = {}; // label → Round record

  for (const label of roundLabels) {
    // Try to parse a date from the label (e.g. "Round 4 - Aug 2024")
    const dateMatch = label.match(/(\w+ \d{4})$/);
    let launchedAt = null;
    if (dateMatch) {
      const d = new Date(dateMatch[1]);
      if (!isNaN(d.getTime())) launchedAt = d;
    }

    const existing = await prisma.round.findFirst({ where: { label } });
    if (existing) {
      roundMap[label] = existing;
      console.log(`  Round exists: ${label}`);
    } else {
      const round = await prisma.round.create({
        data: {
          label,
          status: label.includes("2026") || label.includes("Late 2025") ? "ACTIVE" : "COMPLETED",
          launchedAt,
          completedAt: label.includes("2026") || label.includes("Late 2025") ? null : launchedAt,
        },
      });
      roundMap[label] = round;
      console.log(`  Created round: ${label}`);
    }
  }

  // ── 2. Group rows by email ──────────────────────────────────────────────
  const byEmail = {};
  for (const row of rows) {
    const email = row.email?.trim().toLowerCase();
    if (!email) continue;
    if (!byEmail[email]) byEmail[email] = [];
    byEmail[email].push(row);
  }

  console.log(`\nImporting ${Object.keys(byEmail).length} unique contacts...`);

  let reviewerCount = 0;
  let reviewCount = 0;
  let giftCardCount = 0;
  let skipped = 0;

  for (const [email, contactRows] of Object.entries(byEmail)) {
    const firstRow = contactRows[0];
    const firstName = firstRow.first_name?.trim() || "";
    const lastName = firstRow.last_name?.trim() || "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || null;
    const roundLabel = firstRow.round_name?.trim() || "Historical";
    const round = roundMap[roundLabel];

    // Check if reviewer already exists in this round
    const existingReviewer = await prisma.reviewer.findFirst({
      where: { email, roundId: round.id },
    });

    let reviewer;
    if (existingReviewer) {
      reviewer = existingReviewer;
      skipped++;
    } else {
      reviewer = await prisma.reviewer.create({
        data: {
          email,
          name,
          userType: "PO",
          roundId: round.id,
          status: "CONTACTED",
          outreachAt: parseDate(firstRow.outreach_date),
        },
      });
      reviewerCount++;
    }

    // Create reviews for each row with a platform
    for (const row of contactRows) {
      const platform = parsePlatform(row.platform);
      if (!platform) continue;

      const status = parseStatus(row.review_status);
      const rating = row.rating ? parseInt(row.rating) : null;
      const outreachDate = parseDate(row.outreach_date);

      // Skip if review already exists
      const existingReview = await prisma.review.findFirst({
        where: { reviewerId: reviewer.id, platform },
      });
      if (existingReview) continue;

      const review = await prisma.review.create({
        data: {
          reviewerId: reviewer.id,
          roundId: round.id,
          platform,
          rating: isNaN(rating) ? null : rating,
          status,
          publishedAt: status === "PUBLISHED" && outreachDate ? outreachDate : null,
        },
      });
      reviewCount++;

      // Create gift card record if sent
      if (row.gift_card_sent?.trim().toLowerCase() === "yes" && row.gift_card_amount) {
        const amount = parseFloat(row.gift_card_amount);
        if (!isNaN(amount) && amount > 0) {
          const existingGC = await prisma.giftCard.findFirst({
            where: { reviewId: review.id },
          });
          if (!existingGC) {
            await prisma.giftCard.create({
              data: {
                roundId: round.id,
                reviewerId: reviewer.id,
                reviewId: review.id,
                platform,
                amount,
                status: "SENT",
                sentAt: outreachDate,
              },
            });
            giftCardCount++;
          }
        }
      }
    }
  }

  console.log(`\n✓ Import complete:`);
  console.log(`  Reviewers created: ${reviewerCount} (${skipped} already existed)`);
  console.log(`  Reviews created: ${reviewCount}`);
  console.log(`  Gift cards created: ${giftCardCount}`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
