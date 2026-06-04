"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Image as ImageIcon,
  DollarSign,
  SlidersHorizontal,
  ChevronDown,
  Clock,
  AlertCircle,
} from "lucide-react";
import clsx from "clsx";

type Platform = "G2" | "CAPTERRA" | "TRUSTPILOT" | "GOOGLE" | "APP_STORE" | "GOOGLE_PLAY";
type GiftCardStatus = "PENDING" | "SENT";
type UserType = "PO" | "TENANT";

function UserTypeTag({ type }: { type: UserType }) {
  return (
    <span className={clsx(
      "text-xs px-1.5 py-0.5 rounded-full font-semibold border",
      type === "PO" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-teal-50 text-teal-700 border-teal-200"
    )}>{type}</span>
  );
}

interface GiftCardItem {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  userType: UserType;
  platform: Platform;
  round: string;
  amount: number;
  reviewText: string;
  screenshotUrl: string | null;
  reviewUrl: string | null;
  status: GiftCardStatus;
  sentAt: string | null;
  reviewPublishedAt: string;
}

// Sample data — will come from DB once wired up
const SAMPLE_DATA: GiftCardItem[] = [
  {
    id: "1", userType: "PO",
    reviewerName: "Sarah Mitchell",
    reviewerEmail: "sarah.mitchell@gmail.com",
    platform: "G2",
    round: "2025-06-01",
    amount: 25,
    reviewText: "Innago has completely transformed how I manage my rental properties. The rent collection feature alone saves me hours every month.",
    screenshotUrl: null,
    reviewUrl: "https://www.g2.com/products/innago/reviews",
    status: "PENDING",
    sentAt: null,
    reviewPublishedAt: "2025-06-01",
  },
  {
    id: "2", userType: "TENANT",
    reviewerName: "James Okafor",
    reviewerEmail: "j.okafor@gmail.com",
    platform: "APP_STORE",
    round: "2025-06-01",
    amount: 20,
    reviewText: "Great app for collecting rent. Easy to use and tenants love it too.",
    screenshotUrl: null,
    reviewUrl: null,
    status: "PENDING",
    sentAt: null,
    reviewPublishedAt: "2025-06-02",
  },
  {
    id: "3", userType: "TENANT",
    reviewerName: "Dana Kowalski",
    reviewerEmail: "dkowalski@yahoo.com",
    platform: "GOOGLE_PLAY",
    round: "2025-06-01",
    amount: 10,
    reviewText: "Very helpful for managing multiple units. Would recommend.",
    screenshotUrl: null,
    reviewUrl: null,
    status: "PENDING",
    sentAt: null,
    reviewPublishedAt: "2025-06-02",
  },
  {
    id: "4", userType: "PO",
    reviewerName: "Tom Reynolds",
    reviewerEmail: "t.reynolds@gmail.com",
    platform: "TRUSTPILOT",
    round: "2025-06-01",
    amount: 15,
    reviewText: "Solid property management software. Customer support is responsive.",
    screenshotUrl: null,
    reviewUrl: "https://www.trustpilot.com/review/innago.com",
    status: "SENT",
    sentAt: "2025-06-03T14:22:00Z",
    reviewPublishedAt: "2025-05-30",
  },
  {
    id: "5", userType: "PO",
    reviewerName: "Priya Nair",
    reviewerEmail: "priya.nair@gmail.com",
    platform: "G2",
    round: "2025-06-01",
    amount: 25,
    reviewText: "The lease management tools are excellent. Made going paperless so much easier.",
    screenshotUrl: null,
    reviewUrl: "https://www.g2.com/products/innago/reviews",
    status: "SENT",
    sentAt: "2025-06-02T09:10:00Z",
    reviewPublishedAt: "2025-05-28",
  },
];

const PLATFORM_LABELS: Record<Platform, string> = {
  G2: "G2",
  CAPTERRA: "Capterra",
  TRUSTPILOT: "Trustpilot",
  GOOGLE: "Google",
  APP_STORE: "App Store",
  GOOGLE_PLAY: "Google Play",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  G2: "bg-orange-100 text-orange-700",
  CAPTERRA: "bg-blue-100 text-blue-700",
  TRUSTPILOT: "bg-green-100 text-green-700",
  GOOGLE: "bg-red-100 text-red-700",
  APP_STORE: "bg-gray-100 text-gray-700",
  GOOGLE_PLAY: "bg-emerald-100 text-emerald-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export default function GiftCardsPage() {
  const [items, setItems] = useState<GiftCardItem[]>(SAMPLE_DATA);
  const [statusFilter, setStatusFilter] = useState<"ALL" | GiftCardStatus>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function markSent(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "SENT", sentAt: new Date().toISOString() }
          : item
      )
    );
    setConfirmingId(null);
  }

  const filtered = items.filter((item) => {
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
    return true;
  });

  const pending = items.filter((i) => i.status === "PENDING");
  const sent = items.filter((i) => i.status === "SENT");
  const totalOwed = pending.reduce((s, i) => s + i.amount, 0);
  const totalSent = sent.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Gift Cards</h1>
        <p className="text-gray-500 text-sm">
          Check off each gift card after you've sent it manually. Timestamps are recorded automatically.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Pending</span>
          </div>
          <div className="text-2xl font-bold text-amber-900">{pending.length}</div>
          <div className="text-sm text-amber-700 mt-0.5">${totalOwed} to send</div>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Sent</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{sent.length}</div>
          <div className="text-sm text-green-700 mt-0.5">${totalSent} sent</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-500">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{items.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">${totalOwed + totalSent} across all rounds</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="flex gap-2">
          {(["ALL", "PENDING", "SENT"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                statusFilter === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
              )}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Gift card list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No gift cards match this filter.
          </div>
        )}
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          const isConfirming = confirmingId === item.id;

          return (
            <div
              key={item.id}
              className={clsx(
                "rounded-xl border bg-white transition-all",
                item.status === "SENT"
                  ? "border-gray-100 opacity-70"
                  : "border-gray-200 shadow-sm"
              )}
            >
              {/* Main row */}
              <div className="px-5 py-4 flex items-center gap-4">
                {/* Checkbox / status */}
                <div className="shrink-0">
                  {item.status === "SENT" ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <button
                      onClick={() => setConfirmingId(isConfirming ? null : item.id)}
                      className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-blue-400 transition-colors flex items-center justify-center"
                    >
                      <Circle className="w-4 h-4 text-gray-300" />
                    </button>
                  )}
                </div>

                {/* Name + platform */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={clsx(
                      "font-medium text-sm",
                      item.status === "SENT" ? "text-gray-500 line-through" : "text-gray-900"
                    )}>
                      {item.reviewerName}
                    </span>
                    <UserTypeTag type={item.userType} />
                    <span className={clsx(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      PLATFORM_COLORS[item.platform]
                    )}>
                      {PLATFORM_LABELS[item.platform]}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(item.round)}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {item.reviewerEmail} · Published {formatDate(item.reviewPublishedAt)}
                  </div>
                </div>

                {/* Amount */}
                <div className="shrink-0 text-right">
                  <div className={clsx(
                    "text-lg font-bold",
                    item.status === "SENT" ? "text-gray-400" : "text-gray-900"
                  )}>
                    ${item.amount}
                  </div>
                  {item.status === "SENT" && item.sentAt && (
                    <div className="text-xs text-green-600 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      Sent {formatDateTime(item.sentAt)}
                    </div>
                  )}
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className={clsx("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                </button>
              </div>

              {/* Confirm send */}
              {isConfirming && item.status === "PENDING" && (
                <div className="px-5 pb-4 flex items-center gap-3 border-t border-gray-100 pt-3">
                  <span className="text-sm text-gray-700 flex-1">
                    Mark ${item.amount} Amazon gift card as sent to <strong>{item.reviewerName}</strong>?
                  </span>
                  <button
                    onClick={() => setConfirmingId(null)}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => markSent(item.id)}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    ✓ Yes, mark as sent
                  </button>
                </div>
              )}

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                  {/* Review text */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Review</div>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 italic">
                      "{item.reviewText}"
                    </p>
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-3">
                    {item.screenshotUrl ? (
                      <a
                        href={item.screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        View screenshot
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <ImageIcon className="w-3.5 h-3.5" />
                        No screenshot on file
                      </span>
                    )}
                    {item.reviewUrl && (
                      <a
                        href={item.reviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View on {PLATFORM_LABELS[item.platform]}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom total */}
      {filtered.some((i) => i.status === "PENDING") && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between">
          <div className="text-sm text-amber-800">
            <strong>{pending.length} gift card{pending.length !== 1 ? "s" : ""}</strong> still to send
          </div>
          <div className="text-lg font-bold text-amber-900">${totalOwed} remaining</div>
        </div>
      )}
    </div>
  );
}
