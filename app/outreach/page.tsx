"use client";

import { useState } from "react";
import {
  Star,
  ChevronDown,
  ExternalLink,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  MessageSquare,
  Filter,
} from "lucide-react";
import clsx from "clsx";

type Platform = "G2" | "CAPTERRA" | "TRUSTPILOT" | "GOOGLE" | "APP_STORE" | "GOOGLE_PLAY";
type OutreachStatus = "SENT" | "REPLIED" | "NO_RESPONSE" | "RESOLVED";
type UserType = "PO" | "TENANT";

function UserTypeTag({ type }: { type: UserType }) {
  return (
    <span className={clsx(
      "text-xs px-1.5 py-0.5 rounded-full font-semibold border",
      type === "PO" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-teal-50 text-teal-700 border-teal-200"
    )}>{type}</span>
  );
}

interface OutreachRecord {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  userType: UserType;
  platform: Platform;
  rating: number;
  reviewText: string;
  reviewUrl: string | null;
  round: string;
  emailSubject: string;
  emailBody: string;
  publicResponse: string;
  publicResponsePosted: boolean;
  status: OutreachStatus;
  sentAt: string;
  repliedAt: string | null;
  resolvedAt: string | null;
  notes: string;
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

const STATUS_CONFIG: Record<OutreachStatus, { label: string; color: string }> = {
  SENT:        { label: "Sent — awaiting reply", color: "bg-blue-50 text-blue-700 border-blue-200" },
  REPLIED:     { label: "Replied",               color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  NO_RESPONSE: { label: "No response",           color: "bg-gray-100 text-gray-500 border-gray-200" },
  RESOLVED:    { label: "Resolved ✓",            color: "bg-green-50 text-green-700 border-green-200" },
};

const SAMPLE_OUTREACH: OutreachRecord[] = [
  {
    id: "o-1", userType: "PO",
    reviewerName: "Marcus Webb",
    reviewerEmail: "marcus.webb@gmail.com",
    platform: "TRUSTPILOT",
    rating: 2,
    reviewText: "The maintenance request feature is clunky and hard to use. Tenants keep complaining they can't find where to submit requests.",
    reviewUrl: "https://www.trustpilot.com/review/innago.com",
    round: "2025-06-01",
    emailSubject: "Following up on your Innago review — let's make this right",
    emailBody: `Hi Marcus,\n\nI saw your recent Trustpilot review and wanted to reach out personally. You mentioned the maintenance request feature is difficult to navigate — I completely understand how frustrating that must be, especially when your tenants are running into it too.\n\nI'd love to jump on a quick 15-minute call to walk you through some tips that might help, and also make sure we capture your feedback for our product team.\n\nWould you be open to a quick call this week?\n\nMose\nInnago`,
    publicResponse: "Hi Marcus, thank you for your honest feedback. We're sorry to hear the maintenance request flow has been frustrating — I've reached out to you directly to help get this sorted.",
    publicResponsePosted: false,
    status: "SENT",
    sentAt: "2025-06-03T10:00:00Z",
    repliedAt: null,
    resolvedAt: null,
    notes: "",
  },
  {
    id: "o-2", userType: "PO",
    reviewerName: "Carla Hernandez",
    reviewerEmail: "c.hernandez@gmail.com",
    platform: "GOOGLE",
    rating: 3,
    reviewText: "Good software overall but customer support took 3 days to respond to my issue. For a paid product I'd expect faster help.",
    reviewUrl: null,
    round: "2025-06-01",
    emailSubject: "Your Innago experience — I want to help",
    emailBody: `Hi Carla,\n\nThank you for leaving a review — and I'm sorry to hear your support experience didn't meet expectations. A 3-day response time is not what we aim for.\n\nI'd love to connect and make sure your issue is fully resolved. Can I schedule a quick call?\n\nMose\nInnago`,
    publicResponse: "Hi Carla, thank you for your feedback. We sincerely apologize that our response time fell short. We've reached out to you directly to resolve your issue.",
    publicResponsePosted: true,
    status: "REPLIED",
    sentAt: "2025-06-03T10:30:00Z",
    repliedAt: "2025-06-04T14:20:00Z",
    resolvedAt: null,
    notes: "She replied — issue was a billing question. Connecting her with support team.",
  },
  {
    id: "o-3", userType: "PO",
    reviewerName: "Derek Sousa",
    reviewerEmail: "derek.s@gmail.com",
    platform: "G2",
    rating: 2,
    reviewText: "Constant bugs in the mobile app. Has gotten better but still crashes more than it should.",
    reviewUrl: "https://www.g2.com/products/innago/reviews",
    round: "2025-03-01",
    emailSubject: "Your G2 review — want to make this right",
    emailBody: `Hi Derek,\n\nI saw your G2 review and wanted to follow up personally on the mobile app crashes you've been experiencing. Our engineering team has been working on stability fixes and I want to make sure your specific issues are on their radar.\n\nWould you be willing to jump on a quick call?\n\nMose\nInnago`,
    publicResponse: "Hi Derek, thank you for the honest feedback. Mobile app stability is a top priority and we're actively pushing fixes. I've reached out to you directly to get more details.",
    publicResponsePosted: true,
    status: "RESOLVED",
    sentAt: "2025-03-15T09:00:00Z",
    repliedAt: "2025-03-16T11:00:00Z",
    resolvedAt: "2025-03-20T00:00:00Z",
    notes: "Jumped on a call. Issue was specific to older Android. Engineering fixed in v3.4.1. He updated review to 4 stars.",
  },
  {
    id: "o-4", userType: "PO",
    reviewerName: "Tina Bowers",
    reviewerEmail: "tbowers@yahoo.com",
    platform: "CAPTERRA",
    rating: 1,
    reviewText: "Had a terrible onboarding experience. No one followed up after signup and I was left to figure everything out on my own.",
    reviewUrl: null,
    round: "2025-01-06",
    emailSubject: "Your Capterra review — I'm sorry we let you down",
    emailBody: `Hi Tina,\n\nI came across your Capterra review and wanted to reach out personally. Your onboarding experience sounds really frustrating and we failed you — I'm sorry for that.\n\nI'd love to make it right. Are you still using Innago? Can we set up time to walk through anything you need?\n\nMose\nInnago`,
    publicResponse: "Hi Tina, we're so sorry your onboarding experience fell short. This is not the standard we hold ourselves to. I've reached out to you directly and would love to make this right.",
    publicResponsePosted: false,
    status: "NO_RESPONSE",
    sentAt: "2025-01-10T08:00:00Z",
    repliedAt: null,
    resolvedAt: null,
    notes: "Sent follow-up 2 weeks later. No response.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={clsx("w-3.5 h-3.5", s <= rating ? "fill-red-400 text-red-400" : "text-gray-200 fill-gray-200")} />
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-gray-50 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function OutreachPage() {
  const [records, setRecords] = useState<OutreachRecord[]>(SAMPLE_OUTREACH);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OutreachStatus | "ALL">("ALL");

  function updateStatus(id: string, status: OutreachStatus) {
    setRecords((prev) => prev.map((r) =>
      r.id === id ? {
        ...r,
        status,
        repliedAt: status === "REPLIED" && !r.repliedAt ? new Date().toISOString() : r.repliedAt,
        resolvedAt: status === "RESOLVED" && !r.resolvedAt ? new Date().toISOString() : r.resolvedAt,
      } : r
    ));
  }

  function updateNotes(id: string, notes: string) {
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, notes } : r));
  }

  function togglePublicResponsePosted(id: string) {
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, publicResponsePosted: !r.publicResponsePosted } : r));
  }

  const filtered = records.filter((r) => statusFilter === "ALL" || r.status === statusFilter);
  const counts = {
    ALL: records.length,
    SENT: records.filter((r) => r.status === "SENT").length,
    REPLIED: records.filter((r) => r.status === "REPLIED").length,
    NO_RESPONSE: records.filter((r) => r.status === "NO_RESPONSE").length,
    RESOLVED: records.filter((r) => r.status === "RESOLVED").length,
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Outreach</h1>
        <p className="text-gray-500 text-sm">Track every low-star outreach email — who was contacted, what was sent, and where things stand.</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(["SENT", "REPLIED", "NO_RESPONSE", "RESOLVED"] as OutreachStatus[]).map((s) => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
            className={clsx("rounded-xl border p-3 text-left transition-colors",
              statusFilter === s ? "ring-2 ring-blue-500" : "hover:border-gray-300",
              STATUS_CONFIG[s].color
            )}>
            <div className="text-xl font-bold">{counts[s]}</div>
            <div className="text-xs font-medium mt-0.5">{STATUS_CONFIG[s].label}</div>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="flex gap-2">
          {(["ALL", "SENT", "REPLIED", "NO_RESPONSE", "RESOLVED"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={clsx("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
              )}>
              {s === "ALL" ? "All" : s === "NO_RESPONSE" ? "No Response" : STATUS_CONFIG[s].label.replace(" ✓", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Records */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No outreach records match this filter.</div>
        )}
        {filtered.map((record) => {
          const isExpanded = expandedId === record.id;
          return (
            <div key={record.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* Row */}
              <div className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : record.id)}>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">{record.reviewerName}</span>
                    <UserTypeTag type={record.userType} />
                    <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", PLATFORM_COLORS[record.platform])}>
                      {PLATFORM_LABELS[record.platform]}
                    </span>
                    <StarRating rating={record.rating} />
                    <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium border", STATUS_CONFIG[record.status].color)}>
                      {STATUS_CONFIG[record.status].label}
                    </span>
                    {!record.publicResponsePosted && (
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        Public response not posted
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {record.reviewerEmail} · Sent {formatDate(record.sentAt)} · Outreach {formatDate(record.round)}
                    {record.repliedAt && ` · Replied ${formatDate(record.repliedAt)}`}
                    {record.resolvedAt && ` · Resolved ${formatDate(record.resolvedAt)}`}
                  </div>
                </div>

                <ChevronDown className={clsx("w-4 h-4 text-gray-400 shrink-0 transition-transform", isExpanded && "rotate-180")} />
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4">

                  {/* Review */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1.5">Their review</div>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 italic leading-relaxed">
                      "{record.reviewText}"
                    </p>
                    {record.reviewUrl && (
                      <a href={record.reviewUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1.5">
                        <ExternalLink className="w-3 h-3" /> View on {PLATFORM_LABELS[record.platform]}
                      </a>
                    )}
                  </div>

                  {/* Email sent */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1.5">Email sent to {record.reviewerName}</div>
                    <div className="text-xs text-gray-400 mb-1">Subject: <span className="text-gray-600">{record.emailSubject}</span></div>
                    <pre className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 whitespace-pre-wrap font-sans leading-relaxed">
                      {record.emailBody}
                    </pre>
                  </div>

                  {/* Public response */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-xs font-medium text-gray-500">
                        Public response <span className="text-gray-400 font-normal">(post on {PLATFORM_LABELS[record.platform]})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CopyButton text={record.publicResponse} />
                        <button
                          onClick={() => togglePublicResponsePosted(record.id)}
                          className={clsx("flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors",
                            record.publicResponsePosted
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                          )}>
                          {record.publicResponsePosted
                            ? <><CheckCircle2 className="w-3.5 h-3.5" /> Posted</>
                            : <><XCircle className="w-3.5 h-3.5" /> Not posted</>}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 leading-relaxed">
                      {record.publicResponse}
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Notes
                    </div>
                    <textarea
                      value={record.notes}
                      onChange={(e) => updateNotes(record.id, e.target.value)}
                      placeholder="Add notes about this conversation, next steps, etc."
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Status update */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-gray-500 mr-1">Update status:</span>
                    {(["SENT", "REPLIED", "NO_RESPONSE", "RESOLVED"] as OutreachStatus[]).map((s) => (
                      <button key={s} onClick={() => updateStatus(record.id, s)}
                        className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                          record.status === s
                            ? clsx(STATUS_CONFIG[s].color, "font-semibold")
                            : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                        )}>
                        {s === "NO_RESPONSE" ? "No Response" : STATUS_CONFIG[s].label.replace(" ✓", "")}
                      </button>
                    ))}
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
