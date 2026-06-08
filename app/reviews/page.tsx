"use client";

import { useState, useEffect } from "react";
import {
  Star,
  ChevronDown,
  ExternalLink,
  ImageIcon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  Search,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

type Platform =
  | "G2" | "CAPTERRA" | "TRUSTPILOT" | "GOOGLE"
  | "APP_STORE" | "GOOGLE_PLAY" | "GOOD_FIRMS"
  | "SOURCE_FORGE" | "FINANCES_ONLINE" | "FACEBOOK"
  | "PRODUCT_HUNT" | "OTHER";

type ReviewStatus = "PENDING" | "SCREENSHOT_RECEIVED" | "PUBLISHED" | "NOT_PUBLISHED";
type UserType = "PO" | "TENANT";

interface Review {
  id: string;
  platform: Platform;
  rating: number | null;
  reviewText: string | null;
  screenshotUrl: string | null;
  reviewUrl: string | null;
  status: ReviewStatus;
  createdAt: string;
  publishedAt: string | null;
  reviewer: {
    id: string;
    name: string | null;
    email: string;
    userType: UserType;
    outreachAt: string | null;
    screenshotReceivedAt: string | null;
  };
  round: {
    id: string;
    label: string | null;
    launchedAt: string | null;
  };
  giftCard: {
    id: string;
    status: string;
    sentAt: string | null;
    amount: number;
  } | null;
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

const STATUS_CONFIG: Record<ReviewStatus, { label: string; icon: React.ReactNode; color: string; step: number }> = {
  PENDING:             { label: "Pending",             icon: <Clock className="w-3.5 h-3.5" />,        color: "bg-gray-100 text-gray-500 border-gray-200",   step: 1 },
  SCREENSHOT_RECEIVED: { label: "Screenshot received", icon: <ImageIcon className="w-3.5 h-3.5" />,    color: "bg-blue-50 text-blue-700 border-blue-200",    step: 2 },
  PUBLISHED:           { label: "Published",           icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "bg-green-50 text-green-700 border-green-200", step: 3 },
  NOT_PUBLISHED:       { label: "Not published",       icon: <XCircle className="w-3.5 h-3.5" />,      color: "bg-red-50 text-red-600 border-red-200",       step: 0 },
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
  if (!rating) return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={clsx("w-3 h-3",
          s <= rating
            ? rating <= 3 ? "fill-red-400 text-red-400" : "fill-amber-400 text-amber-400"
            : "text-gray-200 fill-gray-200"
        )} />
      ))}
    </div>
  );
}

function StatusPipeline({ status }: { status: ReviewStatus }) {
  const steps: ReviewStatus[] = ["PENDING", "SCREENSHOT_RECEIVED", "PUBLISHED"];
  const isFailed = status === "NOT_PUBLISHED";
  if (isFailed) {
    return (
      <span className={clsx("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium", STATUS_CONFIG.NOT_PUBLISHED.color)}>
        {STATUS_CONFIG.NOT_PUBLISHED.icon} Not published
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const current = STATUS_CONFIG[status].step;
        const stepNum = i + 1;
        const done = current >= stepNum;
        const active = current === stepNum;
        return (
          <div key={step} className="flex items-center gap-1">
            <span className={clsx(
              "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium",
              done
                ? active ? STATUS_CONFIG[status].color : "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-300 border-gray-100"
            )}>
              {done && <CheckCircle2 className="w-3 h-3" />}
              {STATUS_CONFIG[step].label}
            </span>
            {i < steps.length - 1 && <span className={clsx("text-xs", done && current > stepNum ? "text-green-400" : "text-gray-200")}>→</span>}
          </div>
        );
      })}
    </div>
  );
}

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function roundLabel(review: Review) {
  return review.round.label || (review.round.launchedAt ? formatDate(review.round.launchedAt) : "Unknown round");
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "ALL">("ALL");
  const [platformFilter, setPlatformFilter] = useState<Platform | "ALL">("ALL");
  const [ratingFilter, setRatingFilter] = useState<"ALL" | "HIGH" | "LOW">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json())
      .then(data => { setReviews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = reviews.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (platformFilter !== "ALL" && r.platform !== platformFilter) return false;
    if (ratingFilter === "HIGH" && (r.rating ?? 0) < 4) return false;
    if (ratingFilter === "LOW" && (r.rating ?? 6) > 3) return false;
    const q = search.toLowerCase();
    if (q && !(r.reviewer.name?.toLowerCase().includes(q) || r.reviewer.email.toLowerCase().includes(q))) return false;
    return true;
  });

  const counts = {
    total: reviews.length,
    published: reviews.filter(r => r.status === "PUBLISHED").length,
    screenshot: reviews.filter(r => r.status === "SCREENSHOT_RECEIVED").length,
    pending: reviews.filter(r => r.status === "PENDING").length,
    notPublished: reviews.filter(r => r.status === "NOT_PUBLISHED").length,
  };

  // Unique platforms in the data
  const platforms = [...new Set(reviews.map(r => r.platform))].sort() as Platform[];

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reviews</h1>
        <p className="text-gray-500 text-sm">Every review across all rounds and platforms.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total",         value: counts.total,       color: "text-gray-900" },
          { label: "Published",     value: counts.published,   color: "text-green-700" },
          { label: "Screenshot",    value: counts.screenshot,  color: "text-blue-700" },
          { label: "Pending",       value: counts.pending,     color: "text-gray-500" },
          { label: "Not published", value: counts.notPublished,color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-3 text-center">
            <div className={clsx("text-2xl font-bold", color)}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-300" /> : value}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="flex gap-1.5 flex-wrap">
            {(["ALL", "PENDING", "SCREENSHOT_RECEIVED", "PUBLISHED", "NOT_PUBLISHED"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={clsx("px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                  statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                )}>
                {s === "ALL" ? "All statuses" : STATUS_CONFIG[s as ReviewStatus].label}
              </button>
            ))}
          </div>
          <div className="w-px h-4 bg-gray-200" />
          {(["ALL", "HIGH", "LOW"] as const).map(r => (
            <button key={r} onClick={() => setRatingFilter(r)}
              className={clsx("px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                ratingFilter === r ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
              )}>
              {r === "ALL" ? "All ratings" : r === "HIGH" ? "4–5 ★" : "1–3 ★"}
            </button>
          ))}
          {platforms.length > 0 && (
            <>
              <div className="w-px h-4 bg-gray-200" />
              {(["ALL", ...platforms] as const).map(p => (
                <button key={p} onClick={() => setPlatformFilter(p as Platform | "ALL")}
                  className={clsx("px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    platformFilter === p ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  )}>
                  {p === "ALL" ? "All platforms" : PLATFORM_LABELS[p as Platform]}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_3fr_1fr] gap-3 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-200 mb-1">
        <span>Reviewer</span>
        <span>Platform</span>
        <span>Rating</span>
        <span>Status pipeline</span>
        <span>Gift card</span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading reviews…</span>
        </div>
      )}

      <div className="space-y-1">
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No reviews match this filter.</div>
        )}
        {filtered.map(review => {
          const isExpanded = expandedId === review.id;
          return (
            <div key={review.id} className={clsx(
              "rounded-xl border bg-white transition-all",
              review.rating && review.rating <= 3 ? "border-l-4 border-l-red-400 border-gray-100" : "border-gray-100"
            )}>
              <div
                className="grid grid-cols-[2fr_1fr_1fr_3fr_1fr] gap-3 items-center px-4 py-3 cursor-pointer hover:bg-gray-50/50 rounded-xl"
                onClick={() => setExpandedId(isExpanded ? null : review.id)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {review.reviewer.name || review.reviewer.email.split("@")[0]}
                    </span>
                    <UserTypeTag type={review.reviewer.userType} />
                  </div>
                  <div className="text-xs text-gray-400 truncate">{review.reviewer.email}</div>
                </div>
                <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium w-fit", PLATFORM_COLORS[review.platform])}>
                  {PLATFORM_LABELS[review.platform]}
                </span>
                <StarRating rating={review.rating} />
                <StatusPipeline status={review.status} />
                <div className="text-xs">
                  {review.giftCard?.status === "SENT" && <span className="text-green-700 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sent</span>}
                  {review.giftCard?.status === "PENDING_APPROVAL" && <span className="text-amber-600 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>}
                  {!review.giftCard && <span className="text-gray-300">—</span>}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-4 space-y-3 bg-gray-50/40 rounded-b-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1.5">Review text</div>
                      {review.reviewText ? (
                        <p className="text-sm text-gray-700 italic leading-relaxed bg-white border border-gray-200 rounded-lg px-3 py-2.5">
                          "{review.reviewText}"
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No review text on file.</p>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1.5">Timeline</div>
                      <div className="space-y-1.5">
                        {[
                          { label: "Outreach sent",       date: review.reviewer.outreachAt },
                          { label: "Screenshot received", date: review.reviewer.screenshotReceivedAt },
                          { label: "Review published",    date: review.publishedAt },
                        ].map(({ label, date }) => (
                          <div key={label} className="flex items-center gap-2 text-xs">
                            <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0", date ? "bg-green-500" : "bg-gray-200")} />
                            <span className={date ? "text-gray-700" : "text-gray-400"}>{label}</span>
                            {date && <span className="text-gray-400 ml-auto">{formatDate(date)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {review.screenshotUrl ? (
                      <a href={review.screenshotUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                        <ImageIcon className="w-3.5 h-3.5" /> View screenshot
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <ImageIcon className="w-3.5 h-3.5" /> No screenshot on file
                      </span>
                    )}
                    {review.reviewUrl && (
                      <a href={review.reviewUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" /> View on {PLATFORM_LABELS[review.platform]}
                      </a>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">{roundLabel(review)}</span>
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
