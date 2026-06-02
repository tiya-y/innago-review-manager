"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  Star,
  ExternalLink,
  ImageIcon,
  Pencil,
  Send,
  Copy,
  Check,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import clsx from "clsx";

type Platform = "G2" | "CAPTERRA" | "TRUSTPILOT" | "GOOGLE" | "APP_STORE" | "GOOGLE_PLAY";
type QueueItemStatus = "PENDING" | "APPROVED" | "DISMISSED";

interface PlatformReview {
  platform: Platform;
  rating: number;
  reviewText: string;
  screenshotUrl: string | null;
  reviewUrl: string | null;
  amount: number;
}

interface OutreachDraft {
  platform: Platform;
  rating: number;
  subject: string;
  body: string;
  publicResponse: string;
}

interface ReviewerQueueItem {
  id: string;
  status: QueueItemStatus;
  reviewerName: string;
  reviewerEmail: string;
  reviews: PlatformReview[];
  outreachDrafts: OutreachDraft[]; // one per low-star review
  round: string;
  isEditingDraftId: string | null; // "platform" key of draft being edited
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

const SAMPLE_QUEUE: ReviewerQueueItem[] = [
  {
    id: "r-1",
    status: "PENDING",
    reviewerName: "Sarah Mitchell",
    reviewerEmail: "sarah.mitchell@gmail.com",
    round: "Round 1 — June 2025",
    isEditingDraftId: null,
    reviews: [
      {
        platform: "G2",
        rating: 5,
        reviewText: "Innago has completely transformed how I manage my rental properties. The rent collection feature alone saves me hours every month.",
        screenshotUrl: null,
        reviewUrl: "https://www.g2.com/products/innago/reviews",
        amount: 25,
      },
      {
        platform: "TRUSTPILOT",
        rating: 5,
        reviewText: "Really solid platform. Been using it for 2 years and it keeps getting better. Support team is helpful.",
        screenshotUrl: null,
        reviewUrl: "https://www.trustpilot.com/review/innago.com",
        amount: 15,
      },
    ],
    outreachDrafts: [],
  },
  {
    id: "r-2",
    status: "PENDING",
    reviewerName: "James Okafor",
    reviewerEmail: "j.okafor@gmail.com",
    round: "Round 1 — June 2025",
    isEditingDraftId: null,
    reviews: [
      {
        platform: "APP_STORE",
        rating: 5,
        reviewText: "Great app for collecting rent. Easy to use and tenants love it too.",
        screenshotUrl: null,
        reviewUrl: null,
        amount: 20,
      },
      {
        platform: "GOOGLE_PLAY",
        rating: 5,
        reviewText: "Works great. Simple and reliable.",
        screenshotUrl: null,
        reviewUrl: null,
        amount: 10,
      },
    ],
    outreachDrafts: [],
  },
  {
    id: "r-3",
    status: "PENDING",
    reviewerName: "Marcus Webb",
    reviewerEmail: "marcus.webb@gmail.com",
    round: "Round 1 — June 2025",
    isEditingDraftId: null,
    reviews: [
      {
        platform: "TRUSTPILOT",
        rating: 2,
        reviewText: "The maintenance request feature is clunky and hard to use. Tenants keep complaining they can't find where to submit requests. Otherwise the platform is okay but this is a deal breaker.",
        screenshotUrl: null,
        reviewUrl: "https://www.trustpilot.com/review/innago.com",
        amount: 15,
      },
    ],
    outreachDrafts: [
      {
        platform: "TRUSTPILOT",
        rating: 2,
        subject: "Following up on your Innago review — let's make this right",
        body: `Hi Marcus,

I saw your recent Trustpilot review and wanted to reach out personally. You mentioned the maintenance request feature is difficult to navigate — I completely understand how frustrating that must be, especially when your tenants are running into it too.

I'd love to jump on a quick 15-minute call to walk you through some tips that might help, and also make sure we capture your feedback for our product team. This is exactly the kind of thing we want to fix.

Would you be open to a quick call this week? You can grab a time that works for you here: [calendar link]

Thanks for taking the time to leave honest feedback — it genuinely helps us improve.

Mose
Innago`,
        publicResponse: `Hi Marcus, thank you for your honest feedback. We're sorry to hear the maintenance request flow has been frustrating for you and your tenants — this is something we're actively working to improve. I've reached out to you directly to help get this sorted and share your feedback with our product team. We appreciate you taking the time to let us know.`,
      },
    ],
  },
  {
    id: "r-4",
    status: "PENDING",
    reviewerName: "Carla Hernandez",
    reviewerEmail: "c.hernandez@gmail.com",
    round: "Round 1 — June 2025",
    isEditingDraftId: null,
    reviews: [
      {
        platform: "GOOGLE",
        rating: 3,
        reviewText: "Good software overall but customer support took 3 days to respond to my issue. For a paid product I'd expect faster help.",
        screenshotUrl: null,
        reviewUrl: null,
        amount: 15,
      },
    ],
    outreachDrafts: [
      {
        platform: "GOOGLE",
        rating: 3,
        subject: "Your Innago experience — I want to help",
        body: `Hi Carla,

Thank you for leaving a review — and I'm sorry to hear your support experience didn't meet expectations. A 3-day response time is not what we aim for, and I apologize for that.

I'd love to connect and make sure your issue is fully resolved. Can I schedule a quick call with you this week?

Mose
Innago`,
        publicResponse: `Hi Carla, thank you for your feedback. We sincerely apologize that our response time fell short of what you should expect. We've reached out to you directly to resolve your issue and we're working on improving our support response times. We appreciate your patience.`,
      },
    ],
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={clsx("w-3.5 h-3.5", s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")} />
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-gray-50 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function QueuePage() {
  const [items, setItems] = useState<ReviewerQueueItem[]>(SAMPLE_QUEUE);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"ALL" | "GIFT_CARD" | "LOW_STAR">("ALL");

  function updateStatus(id: string, status: QueueItemStatus) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));
    if (status !== "PENDING") setExpandedId(null);
  }

  function updateDraft(id: string, platform: Platform, field: "subject" | "body" | "publicResponse", value: string) {
    setItems((prev) => prev.map((item) =>
      item.id === id
        ? { ...item, outreachDrafts: item.outreachDrafts.map((d) => d.platform === platform ? { ...d, [field]: value } : d) }
        : item
    ));
  }

  function toggleEditing(id: string, platform: Platform | null) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, isEditingDraftId: platform } : item));
  }

  const pending = items.filter((i) => i.status === "PENDING");
  const lowStarPending = pending.filter((i) => i.reviews.some((r) => r.rating <= 3));
  const giftCardPending = pending; // all pending need gift cards

  const filtered = items.filter((i) => {
    if (i.status !== "PENDING") return false;
    if (tab === "LOW_STAR") return i.reviews.some((r) => r.rating <= 3);
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Approve Queue</h1>
          <p className="text-gray-500 text-sm">Approve gift card payouts. Send outreach for low-star reviews after paying out.</p>
        </div>
        {pending.length > 0 && (
          <span className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
            {pending.length} pending
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {([
          { key: "ALL", label: "All", count: pending.length },
          { key: "GIFT_CARD", label: "Gift Cards", count: giftCardPending.length },
          { key: "LOW_STAR", label: "Low-Star Outreach", count: lowStarPending.length },
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

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-gray-500">Queue is clear</p>
          <p className="text-sm mt-1">Nothing waiting for approval right now.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          const hasLowStar = item.reviews.some((r) => r.rating <= 3);
          const totalAmount = item.reviews.reduce((s, r) => s + r.amount, 0);

          return (
            <div key={item.id} className={clsx(
              "rounded-xl border bg-white shadow-sm transition-all",
              hasLowStar ? "border-red-200" : "border-gray-200"
            )}>
              {/* Header row */}
              <div className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}>

                <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  hasLowStar ? "bg-red-50" : "bg-green-50")}>
                  {hasLowStar
                    ? <AlertTriangle className="w-4 h-4 text-red-500" />
                    : <span className="text-lg">🎁</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">{item.reviewerName}</span>
                    {/* Platform + rating badges for each review */}
                    {item.reviews.map((r) => (
                      <span key={r.platform} className={clsx("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", PLATFORM_COLORS[r.platform])}>
                        {PLATFORM_LABELS[r.platform]}
                        <span className="flex items-center gap-0.5">
                          <Star className={clsx("w-2.5 h-2.5", r.rating <= 3 ? "fill-red-400 text-red-400" : "fill-amber-400 text-amber-400")} />
                          {r.rating}
                        </span>
                      </span>
                    ))}
                    {hasLowStar && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        Outreach draft ready
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {item.reviewerEmail} · {item.round} · {item.reviews.length} review{item.reviews.length > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-base font-bold text-gray-900">${totalAmount}</span>
                  <ChevronDown className={clsx("w-4 h-4 text-gray-400 transition-transform", isExpanded && "rotate-180")} />
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-5">

                  {/* ── SECTION 1: Reviews + Gift Card ── */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Gift Card · ${totalAmount} total
                    </div>
                    <div className="space-y-3">
                      {item.reviews.map((r) => (
                        <div key={r.platform} className={clsx(
                          "rounded-lg border p-3",
                          r.rating <= 3 ? "border-red-100 bg-red-50/40" : "border-gray-100 bg-gray-50/60"
                        )}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", PLATFORM_COLORS[r.platform])}>
                                {PLATFORM_LABELS[r.platform]}
                              </span>
                              <StarRating rating={r.rating} />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">${r.amount}</span>
                          </div>
                          <p className="text-sm text-gray-600 italic leading-relaxed">"{r.reviewText}"</p>
                          <div className="flex items-center gap-3 mt-2">
                            {r.screenshotUrl ? (
                              <a href={r.screenshotUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                <ImageIcon className="w-3 h-3" /> View screenshot
                              </a>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <ImageIcon className="w-3 h-3" /> No screenshot on file
                              </span>
                            )}
                            {r.reviewUrl && (
                              <a href={r.reviewUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                <ExternalLink className="w-3 h-3" /> View on {PLATFORM_LABELS[r.platform]}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── SECTION 2: Outreach drafts (low-star only) ── */}
                  {item.outreachDrafts.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                          Low-Star Outreach — send after approving gift card
                        </span>
                      </div>

                      {item.outreachDrafts.map((draft) => {
                        const isEditing = item.isEditingDraftId === draft.platform;
                        return (
                          <div key={draft.platform} className="space-y-3">
                            {item.outreachDrafts.length > 1 && (
                              <div className={clsx("text-xs font-medium px-2 py-0.5 rounded-full w-fit", PLATFORM_COLORS[draft.platform])}>
                                {PLATFORM_LABELS[draft.platform]} · {draft.rating}★
                              </div>
                            )}

                            {/* Email draft */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="text-xs font-medium text-gray-600">Outreach email to {item.reviewerName}</div>
                                <button onClick={() => toggleEditing(item.id, isEditing ? null : draft.platform)}
                                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                                  <Pencil className="w-3 h-3" />
                                  {isEditing ? "Done" : "Edit"}
                                </button>
                              </div>
                              <div className="mb-2">
                                <label className="text-xs text-gray-400 block mb-1">Subject</label>
                                {isEditing ? (
                                  <input value={draft.subject}
                                    onChange={(e) => updateDraft(item.id, draft.platform, "subject", e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                                ) : (
                                  <div className="text-sm text-gray-700 bg-white rounded-lg px-3 py-1.5 border border-gray-200">{draft.subject}</div>
                                )}
                              </div>
                              {isEditing ? (
                                <textarea value={draft.body}
                                  onChange={(e) => updateDraft(item.id, draft.platform, "body", e.target.value)}
                                  rows={10}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed bg-white" />
                              ) : (
                                <pre className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2.5 whitespace-pre-wrap font-sans leading-relaxed">{draft.body}</pre>
                              )}
                            </div>

                            {/* Public response */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="text-xs font-medium text-gray-600">
                                  Public response <span className="text-gray-400 font-normal">(copy &amp; post on {PLATFORM_LABELS[draft.platform]})</span>
                                </div>
                                <CopyButton text={draft.publicResponse} />
                              </div>
                              {isEditing ? (
                                <textarea value={draft.publicResponse}
                                  onChange={(e) => updateDraft(item.id, draft.platform, "publicResponse", e.target.value)}
                                  rows={3}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed" />
                              ) : (
                                <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2.5 leading-relaxed">{draft.publicResponse}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Action buttons ── */}
                  <div className="flex items-center gap-3 pt-1">
                    <button onClick={() => updateStatus(item.id, "DISMISSED")}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      <XCircle className="w-4 h-4" /> Dismiss
                    </button>
                    <button onClick={() => updateStatus(item.id, "APPROVED")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
                      <CheckCircle2 className="w-4 h-4" />
                      {hasLowStar ? "Approve payout + send outreach" : "Approve payout"}
                    </button>
                    {hasLowStar && (
                      <button onClick={() => updateStatus(item.id, "APPROVED")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                        <Send className="w-4 h-4" /> Send outreach only
                      </button>
                    )}
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
