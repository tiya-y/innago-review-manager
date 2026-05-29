import type { Platform, PlatformGoal, PlatformRecommendation, RoundPlan } from "./types";

// Desktop platforms share a $60 budget pool (G2 excluded — platform pays)
const DESKTOP_BUDGET = 60;
const DESKTOP_PLATFORMS: Platform[] = ["CAPTERRA", "TRUSTPILOT", "GOOGLE"];

// Mobile amounts are fixed per CLAUDE.md
const MOBILE_AMOUNTS: Record<string, number> = {
  APP_STORE: 20,
  GOOGLE_PLAY: 10,
};

/**
 * How many 5-star reviews are needed to move a rating from `current` to `target`
 * given `count` existing reviews.
 *
 * Formula: solve for n where (current*count + 5*n) / (count + n) >= target
 * => n >= (target*count - current*count) / (5 - target)
 */
export function reviewsNeededToReachRating(
  current: number,
  target: number,
  count: number
): number {
  if (current >= target) return 0;
  if (target >= 5) return Infinity;
  const n = (target * count - current * count) / (5 - target);
  return Math.ceil(n);
}

/**
 * Contacts needed = reviews needed / conversion rate, rounded up, min 1.
 */
export function contactsNeeded(reviewsNeeded: number, conversionRate: number): number {
  if (reviewsNeeded <= 0) return 0;
  return Math.max(1, Math.ceil(reviewsNeeded / conversionRate));
}

/**
 * Core planner: given platform goals, budget, and conversion rate,
 * return a recommended round plan.
 */
export function buildRoundPlan(
  goals: PlatformGoal[],
  desktopBudget: number = DESKTOP_BUDGET,
  conversionRate: number = 0.2
): RoundPlan {
  const recommendations: PlatformRecommendation[] = [];

  for (const goal of goals) {
    const rec = evaluatePlatform(goal, conversionRate);
    recommendations.push(rec);
  }

  // Allocate desktop budget across included non-G2 desktop platforms
  allocateDesktopBudget(recommendations, desktopBudget);

  // Mobile amounts are fixed
  for (const rec of recommendations) {
    if (rec.platform in MOBILE_AMOUNTS && rec.include) {
      rec.suggestedGiftCardAmount = MOBILE_AMOUNTS[rec.platform];
    }
  }

  const totalContacts = recommendations
    .filter((r) => r.include)
    .reduce((sum, r) => sum + r.contactsNeeded, 0);

  const totalBudget = recommendations
    .filter((r) => r.include)
    .reduce((sum, r) => sum + r.suggestedGiftCardAmount * r.reviewsNeeded, 0);

  return { recommendations, totalContacts, totalBudget, conversionRate };
}

function evaluatePlatform(
  goal: PlatformGoal,
  conversionRate: number
): PlatformRecommendation {
  const { platform } = goal;

  // --- Capterra: cadence only ---
  if (platform === "CAPTERRA") {
    const { cadenceGoal } = goal;
    if (!cadenceGoal) {
      return skip(platform, "No cadence goal configured.");
    }
    const lastDate = cadenceGoal.lastReviewDate ? new Date(cadenceGoal.lastReviewDate) : null;
    const daysSinceLast = lastDate
      ? Math.floor((Date.now() - lastDate.getTime()) / 86400000)
      : Infinity;

    if (daysSinceLast < cadenceGoal.intervalDays) {
      const daysLeft = cadenceGoal.intervalDays - daysSinceLast;
      return skip(
        platform,
        `Last review was ${daysSinceLast} days ago — next ask in ${daysLeft} days.`
      );
    }

    const needed = cadenceGoal.reviewsNeeded;
    return {
      platform,
      include: true,
      reason: `${daysSinceLast === Infinity ? "No recent review" : `${daysSinceLast} days since last review`} — cadence goal requires 1 every ${cadenceGoal.intervalDays} days.`,
      reviewsNeeded: needed,
      contactsNeeded: contactsNeeded(needed, conversionRate),
      suggestedGiftCardAmount: 0, // filled in by allocateDesktopBudget
      urgency: daysSinceLast > cadenceGoal.intervalDays * 1.5 ? "HIGH" : "MEDIUM",
    };
  }

  // --- Google: maintain rating ---
  if (platform === "GOOGLE") {
    const { currentRating, goalRating, currentReviewCount } = goal;
    if (currentRating == null || goalRating == null || currentReviewCount == null) {
      return skip(platform, "Missing current rating or review count.");
    }
    if (currentRating >= goalRating) {
      return skip(
        platform,
        `Currently at ${currentRating}★ — at or above maintenance goal of ${goalRating}★. Skipping this round.`
      );
    }
    const needed = reviewsNeededToReachRating(currentRating, goalRating, currentReviewCount);
    return {
      platform,
      include: true,
      reason: `Rating dipped to ${currentRating}★ — need ${needed} more 5★ reviews to recover to ${goalRating}★.`,
      reviewsNeeded: needed,
      contactsNeeded: contactsNeeded(needed, conversionRate),
      suggestedGiftCardAmount: 0,
      urgency: "HIGH",
    };
  }

  // --- G2: rating gap + badge gap ---
  if (platform === "G2") {
    const { currentRating, goalRating, currentReviewCount } = goal;
    if (currentRating == null || goalRating == null || currentReviewCount == null) {
      return skip(platform, "Missing current rating or review count.");
    }
    const G2_BADGE_TARGET = 750;
    const ratingNeeded = reviewsNeededToReachRating(currentRating, goalRating, currentReviewCount);
    const badgeNeeded = Math.max(0, G2_BADGE_TARGET - currentReviewCount);
    const needed = Math.max(ratingNeeded, badgeNeeded);

    let reason = "";
    if (badgeNeeded > 0 && badgeNeeded >= ratingNeeded) {
      reason = `${badgeNeeded} reviews needed to reach the 750-review Leader badge (currently ${currentReviewCount}). Leader badge = 4.1× more AI citations.`;
    } else {
      reason = `${ratingNeeded} more 5★ reviews needed to move from ${currentRating}★ to ${goalRating}★.`;
    }

    return {
      platform,
      include: true,
      reason,
      reviewsNeeded: needed,
      contactsNeeded: contactsNeeded(needed, conversionRate),
      suggestedGiftCardAmount: 0, // G2 sends automatically
      urgency: badgeNeeded > 100 ? "HIGH" : badgeNeeded > 0 ? "MEDIUM" : "LOW",
    };
  }

  // --- Trustpilot, App Store, Google Play: rating gap ---
  const { currentRating, goalRating, currentReviewCount } = goal;
  if (currentRating == null || goalRating == null || currentReviewCount == null) {
    return skip(platform, "Missing current rating or review count.");
  }
  const needed = reviewsNeededToReachRating(currentRating, goalRating, currentReviewCount);
  if (needed <= 0) {
    return skip(platform, `Already at ${currentRating}★ — goal of ${goalRating}★ reached.`);
  }
  const gap = goalRating - currentRating;
  return {
    platform,
    include: true,
    reason: `${needed} more 5★ reviews needed to move from ${currentRating}★ to ${goalRating}★ (${gap > 0 ? "+" : ""}${gap.toFixed(1)}★ gap).`,
    reviewsNeeded: needed,
    contactsNeeded: contactsNeeded(needed, conversionRate),
    suggestedGiftCardAmount: 0, // set later
    urgency: gap >= 0.4 ? "HIGH" : gap >= 0.2 ? "MEDIUM" : "LOW",
  };
}

function allocateDesktopBudget(
  recs: PlatformRecommendation[],
  budget: number
): void {
  const eligible = recs.filter(
    (r) => r.include && DESKTOP_PLATFORMS.includes(r.platform) && r.reviewsNeeded > 0
  );
  if (eligible.length === 0) return;

  // Weight by reviews needed — platforms that need more get proportionally more
  const totalNeeded = eligible.reduce((s, r) => s + r.reviewsNeeded, 0);
  const perReviewBudget = budget / totalNeeded;

  for (const rec of eligible) {
    // Floor at $5, cap at $25 per platform
    const raw = perReviewBudget * rec.reviewsNeeded / rec.reviewsNeeded; // per-review amount
    const perReview = Math.min(25, Math.max(5, Math.round(perReviewBudget)));
    rec.suggestedGiftCardAmount = perReview;
  }

  // Renormalize so total spend (amount × reviewsNeeded) doesn't exceed budget
  const projected = eligible.reduce(
    (s, r) => s + r.suggestedGiftCardAmount * r.reviewsNeeded,
    0
  );
  if (projected > budget) {
    const scale = budget / projected;
    for (const rec of eligible) {
      rec.suggestedGiftCardAmount = Math.max(5, Math.round(rec.suggestedGiftCardAmount * scale));
    }
  }
}

function skip(platform: Platform, reason: string): PlatformRecommendation {
  return {
    platform,
    include: false,
    reason,
    reviewsNeeded: 0,
    contactsNeeded: 0,
    suggestedGiftCardAmount: 0,
    urgency: "SKIP",
  };
}
