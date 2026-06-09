"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  Star,
  AlertTriangle,
  Inbox,
  Loader2,
  DollarSign,
} from "lucide-react";
import clsx from "clsx";

type Platform =
  | "G2" | "CAPTERRA" | "TRUSTPILOT" | "GOOGLE"
  | "APP_STORE" | "GOOGLE_PLAY" | "GOOD_FIRMS"
  | "SOURCE_FORGE" | "FINANCES_ONLINE" | "FACEBOOK"
  | "PRODUCT_HUNT" | "OTHER";

type UserType = "PO" | "TENANT";

interface GiftCardItem {
  id: string;
  amount: number;
  platform: Platform;
  status: string;
  reviewer: { id: string; name: string | null; email: string; userType: UserType };
  review: { id: string; rating: number | null; reviewText: string | null; status: string };
  round: { id: string; label: string | null; launchedAt: string | null };
}

interface LowStarReview {
  id: string;
  platform: Platform;
  rating: number | null;
  reviewText: string | null;
  status: string;
  reviewer: { id: string; name: string | null; email: string; userType: UserType };
  round: { id: string; label: string | null; launchedAt: string | null };
}

interface QueueData {
  giftCardGroups: GiftCardItem[][];
  lowStarGroups: LowStarReview[][];
  totalPending: number;
}

const PLATFORM_LABELS: Record<Platform, string> = {
  G2: "G2", CAPTERRA: "Capterra", TRUSTPILOT: "Trustpilot",
  GOOGLE: "Google", APP_STORE: "App Store", GOOGLE_PLAY: "Google Play",
  GOOD_FIRMS: "Good Firms", SOURCE_FORGE: "Source Forge",
  FINANCES_ONLINE: "Finances Online", FACEBOOK: "Facebook",
  PRODUCT_HUNT: "Product Hunt", OTHER: "Other",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  G2: "bg-orange-100 text-orange-700",
  CAPTERRA: "bg-blue-100 text-blue-700",
  TRUSTPILOT: "bg-green-100 text-green-700",
  GOOGLE: "bg-red-100 text-red-700",
  APP_STORE: "bg-gray-100 text-gray-700",
  GOOGLE_PLAY: "bg-emerald-100 text-emerald-700",
  GOOD_FIRMS: "bg-purple-100 text-purple-700",
  SOURCE_FORGE: "bg-amber-100 text-amber-700",
  FINANCES_ONLINE: "bg-teal-100 text-teal-700",
  FACEBOOK: "bg-indigo-100 text-indigo-700",
  PRODUCT_HUNT: "bg-rose-100 text-rose-700",
  OTHER: "bg-gray-100 text-gray-500",
};

function UserTypeTag({ type }: { type: UserType }) {
  return (
    <span className={clsx(
      "text-xs px-1.5 py-0.5 rounded-full font-semibold border",
      type === "PO" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-teal-50 text-teal-700 border-teal-200"
    )}>{type}</span>
  );
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={clsx("w-3.5 h-3.5",
          s <= rating
            ? rating <= 3 ? "fill-red-400 text-red-400" : "fill-amber-400 text-amber-400"
            : "text-gray-200 fill-gray-200"
        )} />
      ))}
    </div>
  );
}

function reviewerName(r: { name: string | null; email: string }) {
  return r.name || r.email.split("@")[0];
}

function roundLabel(r: { label: string | null; launchedAt: string | null }) {
  if (r.label) return r.label;
  if (r.launchedAt) return new Date(r.launchedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return "Unknown round";
}

export default function QueuePage() {
  const [data, setData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"ALL" | "GIFT_CARD" | "LOW_STAR">("ALL");
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/queue")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function dismiss(id: string) {
    setDismissedIds(prev => new Set([...prev, id]));
    setExpandedId(null);
  }

  function approve(id: string) {
    setApprovedIds(prev => new Set([...prev, id]));
    setExpandedId(null);
  }

  const gcGroups = (data?.giftCardGroups ?? []).filter(g => {
    const id = g[0]?.reviewer.id;
    return id && !dismissedIds.has("gc-" + id) && !approvedIds.has("gc-" + id);
  });

  const lsGroups = (data?.lowStarGroups ?? []).filter(g => {
    const id = g[0]?.reviewer.id;
    return id && !dismissedIds.has("ls-" + id) && !approvedIds.has("ls-" + id);
  });

  const shownGC  = tab === "LOW_STAR" ? [] : gcGroups;
  const shownLS  = tab === "GIFT_CARD" ? [] : lsGroups;
  const totalPending = gcGroups.length + lsGroups.length;

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Approve Queue</h1>
          <p className="text-gray-500 text-sm">Review and approve before anything sends.</p>
        </div>
        {!loading && totalPending > 0 && (
          <span className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
            {totalPending} pending
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {([
          { key: "ALL",       label: "All",               count: totalPending },
          { key: "GIFT_CARD", label: "Gift Cards",         count: gcGroups.length },
          { key: "LOW_STAR",  label: "Low-Star Outreach",  count: lsGroups.length },
        ] as const).map(({ key, label, count }) => (
          <button key={key} onClick={() => setTab(key)}
            className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}>
            {label}
            {count > 0 && (
              <span className={clsx("text-xs px-1.5 py-0.5 rounded-full font-semibold",
                tab === key ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
              )}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading queue…</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && shownGC.length === 0 && shownLS.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-gray-500">Queue is clear</p>
          <p className="text-sm mt-1">Nothing waiting for approval right now.</p>
        </div>
      )}

      <div className="space-y-3">

        {/* ── Gift card groups ─────────────────────────────────────── */}
        {shownGC.map(group => {
          const key = "gc-" + group[0].reviewer.id;
          const isExpanded = expandedId === key;
          const totalAmount = group.reduce((s, gc) => s + gc.amount, 0);
          const reviewer = group[0].reviewer;

          return (
            <div key={key} className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : key)}>
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <span className="text-lg">🎁</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">{reviewerName(reviewer)}</span>
                    <UserTypeTag type={reviewer.userType} />
                    {group.map(gc => (
                      <span key={gc.id} className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", PLATFORM_COLORS[gc.platform])}>
                        {PLATFORM_LABELS[gc.platform]}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {reviewer.email} · {roundLabel(group[0].round)} · {group.length} review{group.length > 1 ? "s" : ""}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-base font-bold text-gray-900">${totalAmount}</span>
                  <ChevronDown className={clsx("w-4 h-4 text-gray-400 transition-transform", isExpanded && "rotate-180")} />
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                  {group.map(gc => (
                    <div key={gc.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", PLATFORM_COLORS[gc.platform])}>
                            {PLATFORM_LABELS[gc.platform]}
                          </span>
                          <StarRating rating={gc.review?.rating ?? null} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">${gc.amount}</span>
                      </div>
                      {gc.review?.reviewText && (
                        <p className="text-sm text-gray-600 italic">"{gc.review.reviewText}"</p>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center gap-3 pt-1">
                    <button onClick={() => dismiss(key)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                      <XCircle className="w-4 h-4" /> Dismiss
                    </button>
                    <button onClick={() => approve(key)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="w-4 h-4" /> Add to gift card list
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Low-star groups ───────────────────────────────────────── */}
        {shownLS.map(group => {
          const key = "ls-" + group[0].reviewer.id;
          const isExpanded = expandedId === key;
          const reviewer = group[0].reviewer;

          return (
            <div key={key} className="rounded-xl border border-red-200 bg-white shadow-sm">
              <div className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : key)}>
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">{reviewerName(reviewer)}</span>
                    <UserTypeTag type={reviewer.userType} />
                    {group.map(r => (
                      <span key={r.id} className={clsx("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", PLATFORM_COLORS[r.platform])}>
                        {PLATFORM_LABELS[r.platform]}
                        {r.rating && <><Star className="w-2.5 h-2.5 fill-red-400 text-red-400" />{r.rating}</>}
                      </span>
                    ))}
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Outreach needed</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {reviewer.email} · {roundLabel(group[0].round)}
                  </div>
                </div>
                <ChevronDown className={clsx("w-4 h-4 text-gray-400 transition-transform shrink-0", isExpanded && "rotate-180")} />
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                  {group.map(r => (
                    <div key={r.id} className="rounded-lg border border-red-100 bg-red-50/30 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", PLATFORM_COLORS[r.platform])}>
                          {PLATFORM_LABELS[r.platform]}
                        </span>
                        <StarRating rating={r.rating} />
                      </div>
                      {r.reviewText && (
                        <p className="text-sm text-gray-600 italic">"{r.reviewText}"</p>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                    Draft outreach emails will appear here once the AI drafting feature is enabled. For now, reach out to {reviewer.email} directly.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button onClick={() => dismiss(key)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                      <XCircle className="w-4 h-4" /> Dismiss
                    </button>
                    <button onClick={() => approve(key)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                      <CheckCircle2 className="w-4 h-4" /> Mark outreach sent
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
