export type Platform = "G2" | "CAPTERRA" | "TRUSTPILOT" | "GOOGLE" | "APP_STORE" | "GOOGLE_PLAY";

export interface PlatformConfig {
  name: string;
  shortName: string;
  userTypes: ("PO" | "TENANT")[];
  giftCardSender: "MOSE" | "PLATFORM" | "AUTOMATIC";
  giftCardSenderNote?: string;
  fixedAmount?: number; // if null, calculated from budget
  reviewUrl: string;
}

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  G2: {
    name: "G2",
    shortName: "G2",
    userTypes: ["PO"],
    giftCardSender: "PLATFORM",
    giftCardSenderNote: "G2 sends automatically from your $1,200+ credit balance",
    reviewUrl: "https://www.g2.com/products/innago/reviews",
  },
  CAPTERRA: {
    name: "Capterra",
    shortName: "Capterra",
    userTypes: ["PO"],
    giftCardSender: "PLATFORM",
    giftCardSenderNote: "Capterra sometimes sends automatically — verify before sending manually",
    reviewUrl: "https://www.capterra.com/p/innago",
  },
  TRUSTPILOT: {
    name: "Trustpilot",
    shortName: "Trustpilot",
    userTypes: ["PO"],
    giftCardSender: "MOSE",
    reviewUrl: "https://www.trustpilot.com/evaluate/innago.com",
  },
  GOOGLE: {
    name: "Google",
    shortName: "Google",
    userTypes: ["PO"],
    giftCardSender: "MOSE",
    reviewUrl: "https://g.page/r/innago/review",
  },
  APP_STORE: {
    name: "App Store",
    shortName: "App Store",
    userTypes: ["PO", "TENANT"],
    giftCardSender: "MOSE",
    fixedAmount: 20,
    reviewUrl: "https://apps.apple.com/app/innago",
  },
  GOOGLE_PLAY: {
    name: "Google Play",
    shortName: "Play Store",
    userTypes: ["PO", "TENANT"],
    giftCardSender: "MOSE",
    fixedAmount: 10,
    reviewUrl: "https://play.google.com/store/apps/innago",
  },
};

export interface PlatformGoal {
  platform: Platform;
  currentRating: number | null;
  currentReviewCount: number | null;
  goalRating: number | null;
  cadenceGoal?: { reviewsNeeded: number; intervalDays: number; lastReviewDate: string | null };
}

export interface PlatformRecommendation {
  platform: Platform;
  include: boolean;
  reason: string;
  reviewsNeeded: number;
  contactsNeeded: number;
  suggestedGiftCardAmount: number;
  urgency: "HIGH" | "MEDIUM" | "LOW" | "SKIP";
}

export interface RoundPlan {
  recommendations: PlatformRecommendation[];
  totalContacts: number;
  totalBudget: number;
  conversionRate: number;
}
