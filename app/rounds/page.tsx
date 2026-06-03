"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  Users,
  ImageIcon,
  CreditCard,
  TrendingUp,
  Circle,
} from "lucide-react";
import clsx from "clsx";

type Platform = "G2" | "CAPTERRA" | "TRUSTPILOT" | "GOOGLE" | "APP_STORE" | "GOOGLE_PLAY";
type RoundStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

interface PlatformTarget {
  platform: Platform;
  giftCardAmount: number;
  contactCount: number;
  goalReviews: number;
}

interface Round {
  id: string;
  name: string;
  status: RoundStatus;
  launchedAt: string;
  completedAt: string | null;
  platforms: PlatformTarget[];
  stats: {
    contacted: number;
    screenshotsReceived: number;
    reviewsPublished: number;
    giftCardsSent: number;
    lowStarCount: number;
    poContacted: number;
    tenantContacted: number;
  };
  // spent = sum of (published reviews × amount per platform)
  // maxPerUser = $60 desktop, $30 mobile — a cap per individual, not the round
  spent: number;
  estimatedCost: number; // goalReviews × amount per platform
}

const PLATFORM_LABELS: Record<Platform, string> = {
  G2: "G2", CAPTERRA: "Capterra", TRUSTPILOT: "Trustpilot",
  GOOGLE: "Google", APP_STORE: "App Store", GOOGLE_PLAY: "Google Play",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  G2: "bg-orange-100 text-orange-700",
  CAPTERRA: "bg-blue-100 text-blue-700",
  TRUSTPILOT: "bg-green-100 text-green-700",
  GOOGLE: "bg-red-100 text-red-700",
  APP_STORE: "bg-gray-100 text-gray-700",
  GOOGLE_PLAY: "bg-emerald-100 text-emerald-700",
};

const STATUS_CONFIG: Record<RoundStatus, { label: string; color: string; icon: React.ReactNode }> = {
  ACTIVE:    { label: "Active",    color: "bg-blue-50 text-blue-700 border-blue-200",   icon: <Clock className="w-3.5 h-3.5" /> },
  COMPLETED: { label: "Completed", color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-500 border-gray-200",  icon: <XCircle className="w-3.5 h-3.5" /> },
};

const SAMPLE_ROUNDS: Round[] = [
  {
    id: "r-1",
    name: "Round 1 — June 2025",
    status: "ACTIVE",
    launchedAt: "2025-06-01",
    completedAt: null,
    estimatedCost: 8*25 + 4*15 + 6*20 + 6*10 + 4*15,
    spent: 40,
    platforms: [
      { platform: "G2",         giftCardAmount: 25, contactCount: 40, goalReviews: 8  },
      { platform: "TRUSTPILOT", giftCardAmount: 15, contactCount: 20, goalReviews: 4  },
      { platform: "APP_STORE",  giftCardAmount: 20, contactCount: 30, goalReviews: 6  },
      { platform: "GOOGLE_PLAY",giftCardAmount: 10, contactCount: 30, goalReviews: 6  },
      { platform: "GOOGLE",     giftCardAmount: 15, contactCount: 20, goalReviews: 4  },
    ],
    stats: {
      contacted: 140, poContacted: 80, tenantContacted: 60,
      screenshotsReceived: 8, reviewsPublished: 5, giftCardsSent: 2, lowStarCount: 1,
    },
  },
  {
    id: "r-2",
    name: "Round 5 — March 2025",
    status: "COMPLETED",
    launchedAt: "2025-03-01",
    completedAt: "2025-03-31",
    estimatedCost: 7*25 + 3*15 + 5*20 + 5*10,
    spent: 455,
    platforms: [
      { platform: "G2",         giftCardAmount: 25, contactCount: 35, goalReviews: 7  },
      { platform: "TRUSTPILOT", giftCardAmount: 15, contactCount: 15, goalReviews: 3  },
      { platform: "APP_STORE",  giftCardAmount: 20, contactCount: 25, goalReviews: 5  },
      { platform: "GOOGLE_PLAY",giftCardAmount: 10, contactCount: 25, goalReviews: 5  },
    ],
    stats: {
      contacted: 100, poContacted: 60, tenantContacted: 40,
      screenshotsReceived: 22, reviewsPublished: 18, giftCardsSent: 18, lowStarCount: 2,
    },
  },
  {
    id: "r-3",
    name: "Round 4 — January 2025",
    status: "COMPLETED",
    launchedAt: "2025-01-06",
    completedAt: "2025-01-31",
    estimatedCost: 6*25 + 1*15 + 3*15,
    spent: 275,
    platforms: [
      { platform: "G2",      giftCardAmount: 25, contactCount: 30, goalReviews: 6 },
      { platform: "CAPTERRA",giftCardAmount: 15, contactCount: 10, goalReviews: 1 },
      { platform: "GOOGLE",  giftCardAmount: 15, contactCount: 15, goalReviews: 3 },
    ],
    stats: {
      contacted: 55, poContacted: 55, tenantContacted: 0,
      screenshotsReceived: 14, reviewsPublished: 11, giftCardsSent: 11, lowStarCount: 1,
    },
  },
  {
    id: "r-4",
    name: "Round 3 — October 2024",
    status: "COMPLETED",
    launchedAt: "2024-10-07",
    completedAt: "2024-10-31",
    estimatedCost: 7*25 + 3*15 + 4*20,
    spent: 400,
    platforms: [
      { platform: "G2",         giftCardAmount: 25, contactCount: 35, goalReviews: 7  },
      { platform: "TRUSTPILOT", giftCardAmount: 15, contactCount: 15, goalReviews: 3  },
      { platform: "APP_STORE",  giftCardAmount: 20, contactCount: 20, goalReviews: 4  },
    ],
    stats: {
      contacted: 70, poContacted: 50, tenantContacted: 20,
      screenshotsReceived: 19, reviewsPublished: 16, giftCardsSent: 16, lowStarCount: 0,
    },
  },
  {
    id: "r-5",
    name: "Round 2 — July 2024",
    status: "COMPLETED",
    launchedAt: "2024-07-08",
    completedAt: "2024-07-31",
    estimatedCost: 5*25 + 3*15,
    spent: 200,
    platforms: [
      { platform: "G2",    giftCardAmount: 25, contactCount: 25, goalReviews: 5 },
      { platform: "GOOGLE",giftCardAmount: 15, contactCount: 15, goalReviews: 3 },
    ],
    stats: {
      contacted: 40, poContacted: 40, tenantContacted: 0,
      screenshotsReceived: 11, reviewsPublished: 8, giftCardsSent: 8, lowStarCount: 1,
    },
  },
];

function ProgressBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={clsx("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function RoundsPage() {
  const [expandedId, setExpandedId] = useState<string | null>("r-1"); // open active round by default

  const activeRound = SAMPLE_ROUNDS.find((r) => r.status === "ACTIVE");
  const totalPublished = SAMPLE_ROUNDS.reduce((s, r) => s + r.stats.reviewsPublished, 0);
  const totalContacted = SAMPLE_ROUNDS.reduce((s, r) => s + r.stats.contacted, 0);

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Round History</h1>
          <p className="text-gray-500 text-sm">All outreach rounds — active and historical.</p>
        </div>
        <Link href="/rounds/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> New Round
        </Link>
      </div>

      {/* All-time stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total rounds",    value: SAMPLE_ROUNDS.length,   icon: <RefreshCw className="w-4 h-4 text-blue-500" /> },
          { label: "Total contacted", value: totalContacted,          icon: <Users className="w-4 h-4 text-purple-500" /> },
          { label: "Reviews published",value: totalPublished,         icon: <Star className="w-4 h-4 text-amber-500" /> },
          { label: "Avg. conversion", value: `${Math.round((totalPublished / totalContacted) * 100)}%`, icon: <TrendingUp className="w-4 h-4 text-green-500" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">{icon}</div>
            <div>
              <div className="text-xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Round list */}
      <div className="space-y-3">
        {SAMPLE_ROUNDS.map((round) => {
          const isExpanded = expandedId === round.id;
          const conversionRate = round.stats.contacted > 0
            ? Math.round((round.stats.reviewsPublished / round.stats.contacted) * 100)
            : 0;

          return (
            <div key={round.id} className={clsx(
              "rounded-xl border bg-white shadow-sm transition-all",
              round.status === "ACTIVE" ? "border-blue-200" : "border-gray-200"
            )}>
              {/* Header */}
              <div className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : round.id)}>

                {/* Status dot */}
                <div className={clsx("w-2 h-2 rounded-full shrink-0",
                  round.status === "ACTIVE" ? "bg-blue-500 animate-pulse" :
                  round.status === "COMPLETED" ? "bg-green-500" : "bg-gray-300"
                )} />

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">{round.name}</span>
                    <span className={clsx("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium",
                      STATUS_CONFIG[round.status].color)}>
                      {STATUS_CONFIG[round.status].icon}
                      {STATUS_CONFIG[round.status].label}
                    </span>
                    {/* Platform badges */}
                    {round.platforms.map((p) => (
                      <span key={p.platform} className={clsx("text-xs px-1.5 py-0.5 rounded-full font-medium", PLATFORM_COLORS[p.platform])}>
                        {PLATFORM_LABELS[p.platform]}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Launched {formatDate(round.launchedAt)}
                    {round.completedAt && ` · Completed ${formatDate(round.completedAt)}`}
                  </div>
                </div>

                {/* Quick stats */}
                <div className="shrink-0 flex items-center gap-5 text-xs text-gray-500">
                  <div className="text-center">
                    <div className="font-bold text-gray-900 text-sm">{round.stats.contacted}</div>
                    <div>contacted</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900 text-sm">{round.stats.reviewsPublished}</div>
                    <div>published</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900 text-sm">{conversionRate}%</div>
                    <div>conversion</div>
                  </div>
                  <ChevronDown className={clsx("w-4 h-4 text-gray-400 ml-2 transition-transform", isExpanded && "rotate-180")} />
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-5">

                  {/* Pipeline progress */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pipeline progress</div>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: "Contacted",           value: round.stats.contacted,           total: round.stats.contacted, color: "bg-blue-400",  icon: <Users className="w-4 h-4 text-blue-500" /> },
                        { label: "Screenshots received",value: round.stats.screenshotsReceived,  total: round.stats.contacted, color: "bg-purple-400", icon: <ImageIcon className="w-4 h-4 text-purple-500" /> },
                        { label: "Reviews published",   value: round.stats.reviewsPublished,    total: round.stats.contacted, color: "bg-green-400",  icon: <Star className="w-4 h-4 text-green-500" /> },
                        { label: "Gift cards sent",     value: round.stats.giftCardsSent,       total: round.stats.reviewsPublished || 1, color: "bg-amber-400", icon: <CreditCard className="w-4 h-4 text-amber-500" /> },
                      ].map(({ label, value, total, color, icon }) => (
                        <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            {icon}
                            <span className="text-xs font-medium text-gray-600">{label}</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
                          <ProgressBar value={value} total={total} color={color} />
                        </div>
                      ))}
                    </div>

                    {round.stats.lowStarCount > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        <Star className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                        {round.stats.lowStarCount} low-star review{round.stats.lowStarCount > 1 ? "s" : ""} — outreach {round.status === "ACTIVE" ? "in progress" : "completed"}
                      </div>
                    )}
                  </div>

                  {/* Per-platform breakdown */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Per-platform targets</div>
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <div className="grid grid-cols-4 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-200">
                        <span>Platform</span>
                        <span>Contacts</span>
                        <span>Goal reviews</span>
                        <span>Gift card / review</span>
                      </div>
                      {round.platforms.map((p) => (
                        <div key={p.platform} className="grid grid-cols-4 px-4 py-3 border-b border-gray-100 last:border-0 items-center">
                          <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium w-fit", PLATFORM_COLORS[p.platform])}>
                            {PLATFORM_LABELS[p.platform]}
                          </span>
                          <span className="text-sm text-gray-700">{p.contactCount}</span>
                          <span className="text-sm text-gray-700">{p.goalReviews}</span>
                          <span className="text-sm text-gray-700">
                            {p.giftCardAmount > 0 ? `$${p.giftCardAmount}` : <span className="text-gray-400">Platform pays</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Est. cost if all goal reviews publish</span>
                      <span className="font-semibold text-gray-900">${round.estimatedCost}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Actual spent so far</span>
                      <span className="font-semibold text-gray-900">${round.spent}</span>
                    </div>
                    <div className="pt-1 border-t border-gray-200 text-xs text-gray-400">
                      Max per user: $60 across desktop platforms · $20 App Store · $10 Google Play
                    </div>
                  </div>

                  {/* PO / Tenant split */}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">Outreach sent to:</span>
                    <span className="bg-violet-50 text-violet-700 border border-violet-200 text-xs px-2.5 py-1 rounded-full font-medium">
                      {round.stats.poContacted} POs
                    </span>
                    <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2.5 py-1 rounded-full font-medium">
                      {round.stats.tenantContacted} Tenants
                    </span>
                  </div>

                  {round.status === "ACTIVE" && (
                    <div className="flex gap-3">
                      <Link href="/reviews"
                        className="flex-1 text-center py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        View all reviews →
                      </Link>
                      <Link href="/queue"
                        className="flex-1 text-center py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                        Go to approve queue →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
