"use client";

import { useState } from "react";
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
} from "lucide-react";
import clsx from "clsx";

type Platform = "G2" | "CAPTERRA" | "TRUSTPILOT" | "GOOGLE" | "APP_STORE" | "GOOGLE_PLAY";
type ReviewStatus = "PENDING" | "SCREENSHOT_RECEIVED" | "PUBLISHED" | "NOT_PUBLISHED";
type Flag = "EDU_EMAIL" | "TOO_SHORT" | "SUSPECTED_FAKE";
type UserType = "PO" | "TENANT";

interface Review {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  userType: UserType;
  platform: Platform;
  rating: number;
  reviewText: string | null;
  screenshotUrl: string | null;
  reviewUrl: string | null;
  status: ReviewStatus;
  flags: Flag[];
  round: string;
  outreachedAt: string;
  screenshotReceivedAt: string | null;
  publishedAt: string | null;
  giftCardStatus: "NOT_APPLICABLE" | "PENDING" | "SENT";
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

const STATUS_CONFIG: Record<ReviewStatus, { label: string; icon: React.ReactNode; color: string; step: number }> = {
  PENDING:            { label: "Pending",            icon: <Clock className="w-3.5 h-3.5" />,        color: "bg-gray-100 text-gray-500 border-gray-200",   step: 1 },
  SCREENSHOT_RECEIVED:{ label: "Screenshot received",icon: <ImageIcon className="w-3.5 h-3.5" />,    color: "bg-blue-50 text-blue-700 border-blue-200",    step: 2 },
  PUBLISHED:          { label: "Published",          icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "bg-green-50 text-green-700 border-green-200", step: 3 },
  NOT_PUBLISHED:      { label: "Not published",      icon: <XCircle className="w-3.5 h-3.5" />,      color: "bg-red-50 text-red-600 border-red-200",       step: 0 },
};

const FLAG_CONFIG: Record<Flag, { label: string; tooltip: string }> = {
  EDU_EMAIL:      { label: ".edu email",      tooltip: "Submitted with .edu email — platform may reject" },
  TOO_SHORT:      { label: "Too short",       tooltip: "Review text is under 20 words — may not publish" },
  SUSPECTED_FAKE: { label: "Suspected fake",  tooltip: "Reviewer account looks new or suspicious" },
};

const SAMPLE_REVIEWS: Review[] = [
  {
    id: "rv-1", userType: "PO",
    reviewerName: "Sarah Mitchell", reviewerEmail: "sarah.mitchell@gmail.com",
    platform: "G2", rating: 5,
    reviewText: "Innago has completely transformed how I manage my rental properties. The rent collection feature alone saves me hours every month.",
    screenshotUrl: null, reviewUrl: "https://www.g2.com/products/innago/reviews",
    status: "PUBLISHED", flags: [], round: "Round 1 — June 2025",
    outreachedAt: "2025-05-20", screenshotReceivedAt: "2025-05-28", publishedAt: "2025-06-01", giftCardStatus: "PENDING",
  },
  {
    id: "rv-2", userType: "PO",
    reviewerName: "Sarah Mitchell", reviewerEmail: "sarah.mitchell@gmail.com",
    platform: "TRUSTPILOT", rating: 5,
    reviewText: "Really solid platform. Been using it for 2 years and it keeps getting better.",
    screenshotUrl: null, reviewUrl: "https://www.trustpilot.com/review/innago.com",
    status: "PUBLISHED", flags: [], round: "Round 1 — June 2025",
    outreachedAt: "2025-05-20", screenshotReceivedAt: "2025-05-30", publishedAt: "2025-06-01", giftCardStatus: "PENDING",
  },
  {
    id: "rv-3", userType: "TENANT",
    reviewerName: "James Okafor", reviewerEmail: "j.okafor@gmail.com",
    platform: "APP_STORE", rating: 5,
    reviewText: "Great app for collecting rent. Easy to use and tenants love it too.",
    screenshotUrl: null, reviewUrl: null,
    status: "SCREENSHOT_RECEIVED", flags: [], round: "Round 1 — June 2025",
    outreachedAt: "2025-05-22", screenshotReceivedAt: "2025-06-02", publishedAt: null, giftCardStatus: "NOT_APPLICABLE",
  },
  {
    id: "rv-4", userType: "TENANT",
    reviewerName: "Dana Kowalski", reviewerEmail: "dkowalski@yahoo.com",
    platform: "GOOGLE_PLAY", rating: 5,
    reviewText: "Very helpful for managing multiple units.",
    screenshotUrl: null, reviewUrl: null,
    status: "SCREENSHOT_RECEIVED", flags: ["TOO_SHORT"], round: "Round 1 — June 2025",
    outreachedAt: "2025-05-22", screenshotReceivedAt: "2025-06-02", publishedAt: null, giftCardStatus: "NOT_APPLICABLE",
  },
  {
    id: "rv-5", userType: "PO",
    reviewerName: "Marcus Webb", reviewerEmail: "marcus.webb@gmail.com",
    platform: "TRUSTPILOT", rating: 2,
    reviewText: "The maintenance request feature is clunky and hard to use. Tenants keep complaining they can't find where to submit requests.",
    screenshotUrl: null, reviewUrl: "https://www.trustpilot.com/review/innago.com",
    status: "PUBLISHED", flags: [], round: "Round 1 — June 2025",
    outreachedAt: "2025-05-22", screenshotReceivedAt: "2025-05-29", publishedAt: "2025-06-03", giftCardStatus: "PENDING",
  },
  {
    id: "rv-6", userType: "PO",
    reviewerName: "Tyler Nguyen", reviewerEmail: "tyler.nguyen@mit.edu",
    platform: "G2", rating: 5, reviewText: "Good product.",
    screenshotUrl: null, reviewUrl: null,
    status: "NOT_PUBLISHED", flags: ["EDU_EMAIL", "TOO_SHORT"], round: "Round 1 — June 2025",
    outreachedAt: "2025-05-22", screenshotReceivedAt: "2025-05-27", publishedAt: null, giftCardStatus: "NOT_APPLICABLE",
  },
  {
    id: "rv-7", userType: "PO",
    reviewerName: "Priya Nair", reviewerEmail: "priya.nair@gmail.com",
    platform: "G2", rating: 5,
    reviewText: "The lease management tools are excellent. Made going paperless so much easier.",
    screenshotUrl: null, reviewUrl: "https://www.g2.com/products/innago/reviews",
    status: "PUBLISHED", flags: [], round: "Round 1 — June 2025",
    outreachedAt: "2025-05-20", screenshotReceivedAt: "2025-05-26", publishedAt: "2025-05-28", giftCardStatus: "SENT",
  },
  {
    id: "rv-8",
    reviewerName: "Ben Hartley",
    reviewerEmail: "ben.hartley@gmail.com",
    platform: "GOOGLE",
    rating: 4,
    reviewText: null,
    screenshotUrl: null,
    reviewUrl: null,
    status: "PENDING",
    flags: [],
    round: "Round 1 — June 2025",
    outreachedAt: "2025-06-01",
    screenshotReceivedAt: null,
    publishedAt: null,
    giftCardStatus: "NOT_APPLICABLE",
  },
];

function UserTypeTag({ type }: { type: "PO" | "TENANT" }) {
  return (
    <span className={clsx(
      "text-xs px-1.5 py-0.5 rounded-full font-semibold border",
      type === "PO"
        ? "bg-violet-50 text-violet-700 border-violet-200"
        : "bg-teal-50 text-teal-700 border-teal-200"
    )}>
      {type}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
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

  return (
    <div className="flex items-center gap-1">
      {isFailed ? (
        <span className={clsx("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium", STATUS_CONFIG.NOT_PUBLISHED.color)}>
          {STATUS_CONFIG.NOT_PUBLISHED.icon}
          {STATUS_CONFIG.NOT_PUBLISHED.label}
        </span>
      ) : (
        steps.map((step, i) => {
          const current = STATUS_CONFIG[status].step;
          const stepNum = i + 1;
          const done = current >= stepNum;
          const active = current === stepNum;
          return (
            <div key={step} className="flex items-center gap-1">
              <span className={clsx(
                "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium transition-all",
                done
                  ? active
                    ? STATUS_CONFIG[status].color
                    : "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-300 border-gray-100"
              )}>
                {done && <CheckCircle2 className="w-3 h-3" />}
                {STATUS_CONFIG[step].label}
              </span>
              {i < steps.length - 1 && (
                <span className={clsx("text-xs", done && current > stepNum ? "text-green-400" : "text-gray-200")}>→</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ReviewsPage() {
  const [reviews] = useState<Review[]>(SAMPLE_REVIEWS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "ALL">("ALL");
  const [platformFilter, setPlatformFilter] = useState<Platform | "ALL">("ALL");
  const [ratingFilter, setRatingFilter] = useState<"ALL" | "HIGH" | "LOW">("ALL");
  const [search, setSearch] = useState("");

  const filtered = reviews.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (platformFilter !== "ALL" && r.platform !== platformFilter) return false;
    if (ratingFilter === "HIGH" && r.rating < 4) return false;
    if (ratingFilter === "LOW" && r.rating > 3) return false;
    if (search && !r.reviewerName.toLowerCase().includes(search.toLowerCase()) &&
        !r.reviewerEmail.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    total: reviews.length,
    published: reviews.filter((r) => r.status === "PUBLISHED").length,
    screenshot: reviews.filter((r) => r.status === "SCREENSHOT_RECEIVED").length,
    pending: reviews.filter((r) => r.status === "PENDING").length,
    notPublished: reviews.filter((r) => r.status === "NOT_PUBLISHED").length,
    flagged: reviews.filter((r) => r.flags.length > 0).length,
    lowStar: reviews.filter((r) => r.rating <= 3).length,
  };

  const platforms = [...new Set(reviews.map((r) => r.platform))] as Platform[];

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reviews</h1>
        <p className="text-gray-500 text-sm">Every review across all rounds and platforms, with live status.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total", value: counts.total, color: "text-gray-900" },
          { label: "Published", value: counts.published, color: "text-green-700" },
          { label: "Screenshot", value: counts.screenshot, color: "text-blue-700" },
          { label: "Pending", value: counts.pending, color: "text-gray-500" },
          { label: "Not published", value: counts.notPublished, color: "text-red-600" },
          { label: "Flagged", value: counts.flagged, color: "text-amber-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-3 text-center">
            <div className={clsx("text-2xl font-bold", color)}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />

          {/* Status */}
          <div className="flex gap-1.5 flex-wrap">
            {(["ALL", "PENDING", "SCREENSHOT_RECEIVED", "PUBLISHED", "NOT_PUBLISHED"] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={clsx("px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                  statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                )}>
                {s === "ALL" ? "All statuses" : STATUS_CONFIG[s as ReviewStatus].label}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-gray-200" />

          {/* Rating */}
          {(["ALL", "HIGH", "LOW"] as const).map((r) => (
            <button key={r} onClick={() => setRatingFilter(r)}
              className={clsx("px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                ratingFilter === r ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
              )}>
              {r === "ALL" ? "All ratings" : r === "HIGH" ? "4–5 ★" : "1–3 ★"}
            </button>
          ))}

          <div className="w-px h-4 bg-gray-200" />

          {/* Platform */}
          {(["ALL", ...platforms] as const).map((p) => (
            <button key={p} onClick={() => setPlatformFilter(p as Platform | "ALL")}
              className={clsx("px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                platformFilter === p ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
              )}>
              {p === "ALL" ? "All platforms" : PLATFORM_LABELS[p as Platform]}
            </button>
          ))}
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

      {/* Rows */}
      <div className="space-y-1">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No reviews match this filter.</div>
        )}
        {filtered.map((review) => {
          const isExpanded = expandedId === review.id;
          return (
            <div key={review.id} className={clsx(
              "rounded-xl border bg-white transition-all",
              review.flags.length > 0 ? "border-amber-200" : "border-gray-100",
              review.rating <= 3 && "border-l-4 border-l-red-400"
            )}>
              {/* Main row */}
              <div
                className="grid grid-cols-[2fr_1fr_1fr_3fr_1fr] gap-3 items-center px-4 py-3 cursor-pointer hover:bg-gray-50/50 rounded-xl"
                onClick={() => setExpandedId(isExpanded ? null : review.id)}
              >
                {/* Reviewer */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-900 truncate">{review.reviewerName}</span>
                    <UserTypeTag type={review.userType} />
                    {review.flags.map((f) => (
                      <span key={f} title={FLAG_CONFIG[f].tooltip}
                        className="inline-flex items-center gap-0.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {FLAG_CONFIG[f].label}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{review.reviewerEmail}</div>
                </div>

                {/* Platform */}
                <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium w-fit", PLATFORM_COLORS[review.platform])}>
                  {PLATFORM_LABELS[review.platform]}
                </span>

                {/* Rating */}
                <StarRating rating={review.rating} />

                {/* Status pipeline */}
                <StatusPipeline status={review.status} />

                {/* Gift card */}
                <div className="text-xs">
                  {review.giftCardStatus === "SENT" && <span className="text-green-700 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sent</span>}
                  {review.giftCardStatus === "PENDING" && <span className="text-amber-600 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>}
                  {review.giftCardStatus === "NOT_APPLICABLE" && <span className="text-gray-300">—</span>}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-4 space-y-3 bg-gray-50/40 rounded-b-xl">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Review text */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1.5">Review text</div>
                      {review.reviewText ? (
                        <p className="text-sm text-gray-700 italic leading-relaxed bg-white border border-gray-200 rounded-lg px-3 py-2.5">
                          "{review.reviewText}"
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No review text submitted yet.</p>
                      )}
                    </div>

                    {/* Timeline */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1.5">Timeline</div>
                      <div className="space-y-1.5">
                        {[
                          { label: "Outreach sent", date: review.outreachedAt },
                          { label: "Screenshot received", date: review.screenshotReceivedAt },
                          { label: "Review published", date: review.publishedAt },
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

                  {/* Links */}
                  <div className="flex items-center gap-4">
                    {review.screenshotUrl ? (
                      <a href={review.screenshotUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                        <ImageIcon className="w-3.5 h-3.5" /> View screenshot
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <ImageIcon className="w-3.5 h-3.5" /> No screenshot on file
                      </span>
                    )}
                    {review.reviewUrl && (
                      <a href={review.reviewUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" /> View on {PLATFORM_LABELS[review.platform]}
                      </a>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">{review.round}</span>
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
