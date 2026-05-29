"use client";

import { useState, useEffect } from "react";
import { buildRoundPlan } from "@/lib/round-planner";
import { PLATFORM_CONFIG } from "@/lib/types";
import type { Platform, PlatformGoal, PlatformRecommendation, RoundPlan } from "@/lib/types";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Users,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";

// Default goals matching the CLAUDE.md spec
const DEFAULT_GOALS: PlatformGoal[] = [
  {
    platform: "G2",
    currentRating: 4.8,
    currentReviewCount: 400, // placeholder — Mose will update
    goalRating: 4.9,
  },
  {
    platform: "CAPTERRA",
    currentRating: null,
    currentReviewCount: null,
    goalRating: null,
    cadenceGoal: { reviewsNeeded: 1, intervalDays: 90, lastReviewDate: null },
  },
  {
    platform: "TRUSTPILOT",
    currentRating: 4.7,
    currentReviewCount: 200,
    goalRating: 4.9,
  },
  {
    platform: "GOOGLE",
    currentRating: 4.8,
    currentReviewCount: 300,
    goalRating: 4.8,
  },
  {
    platform: "APP_STORE",
    currentRating: 4.39,
    currentReviewCount: 500,
    goalRating: 4.8,
  },
  {
    platform: "GOOGLE_PLAY",
    currentRating: 4.39,
    currentReviewCount: 300,
    goalRating: 4.8,
  },
];

const URGENCY_STYLES: Record<string, string> = {
  HIGH: "bg-red-50 border-red-200 text-red-700",
  MEDIUM: "bg-yellow-50 border-yellow-200 text-yellow-700",
  LOW: "bg-blue-50 border-blue-200 text-blue-700",
  SKIP: "bg-gray-50 border-gray-200 text-gray-500",
};

const URGENCY_ICONS: Record<string, React.ReactNode> = {
  HIGH: <Zap className="w-3.5 h-3.5" />,
  MEDIUM: <AlertCircle className="w-3.5 h-3.5" />,
  LOW: <CheckCircle2 className="w-3.5 h-3.5" />,
  SKIP: <XCircle className="w-3.5 h-3.5" />,
};

export default function NewRoundPage() {
  const [goals, setGoals] = useState<PlatformGoal[]>(DEFAULT_GOALS);
  const [conversionRate, setConversionRate] = useState(0.2);
  const [budget, setBudget] = useState(60);
  const [plan, setPlan] = useState<RoundPlan | null>(null);
  const [overrides, setOverrides] = useState<Record<Platform, boolean>>({} as Record<Platform, boolean>);
  const [step, setStep] = useState<"goals" | "plan" | "confirm">("goals");

  useEffect(() => {
    const p = buildRoundPlan(goals, budget, conversionRate);
    setPlan(p);
    // Init overrides from plan
    const init: Record<string, boolean> = {};
    for (const r of p.recommendations) {
      init[r.platform] = r.include;
    }
    setOverrides(init as Record<Platform, boolean>);
  }, [goals, budget, conversionRate]);

  function updateGoal(platform: Platform, field: keyof PlatformGoal, value: unknown) {
    setGoals((prev) =>
      prev.map((g) => (g.platform === platform ? { ...g, [field]: value } : g))
    );
  }

  function toggleOverride(platform: Platform) {
    setOverrides((prev) => ({ ...prev, [platform]: !prev[platform] }));
  }

  if (!plan) return null;

  const activeRecs = plan.recommendations.filter((r) => overrides[r.platform]);
  const totalGiftCardCost = activeRecs.reduce(
    (s, r) => s + r.suggestedGiftCardAmount * r.reviewsNeeded,
    0
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">New Review Round</h1>
      <p className="text-gray-500 text-sm mb-8">
        The planner calculates who to ask, how many to contact, and how much to offer — based on your goals.
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        {["goals", "plan", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s as typeof step)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium",
                step === s ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                {i + 1}
              </span>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
            {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </div>
        ))}
      </div>

      {/* Step 1: Goals */}
      {step === "goals" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800 text-sm">Platform Goals</h2>
              <p className="text-xs text-gray-500 mt-0.5">Update current stats — the planner recalculates automatically.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {goals.map((goal) => {
                const cfg = PLATFORM_CONFIG[goal.platform];
                return (
                  <div key={goal.platform} className="px-5 py-4 flex items-start gap-4">
                    <div className="w-28 shrink-0">
                      <span className="font-medium text-sm text-gray-900">{cfg.name}</span>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      {goal.platform !== "CAPTERRA" && (
                        <>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Current Rating</label>
                            <input
                              type="number"
                              step="0.1"
                              min="1"
                              max="5"
                              value={goal.currentRating ?? ""}
                              onChange={(e) =>
                                updateGoal(goal.platform, "currentRating", parseFloat(e.target.value) || null)
                              }
                              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Review Count</label>
                            <input
                              type="number"
                              min="0"
                              value={goal.currentReviewCount ?? ""}
                              onChange={(e) =>
                                updateGoal(goal.platform, "currentReviewCount", parseInt(e.target.value) || null)
                              }
                              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Goal Rating</label>
                            <input
                              type="number"
                              step="0.1"
                              min="1"
                              max="5"
                              value={goal.goalRating ?? ""}
                              onChange={(e) =>
                                updateGoal(goal.platform, "goalRating", parseFloat(e.target.value) || null)
                              }
                              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      )}
                      {goal.platform === "CAPTERRA" && (
                        <div className="col-span-3">
                          <label className="text-xs text-gray-500 block mb-1">Last Review Date</label>
                          <input
                            type="date"
                            value={goal.cadenceGoal?.lastReviewDate ?? ""}
                            onChange={(e) =>
                              updateGoal(goal.platform, "cadenceGoal", {
                                ...goal.cadenceGoal!,
                                lastReviewDate: e.target.value || null,
                              })
                            }
                            className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-400 ml-3">Goal: 1 review every 3 months</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-gray-400" />
              <div>
                <label className="text-xs text-gray-500 block">Conversion Rate</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={conversionRate * 100}
                    onChange={(e) => setConversionRate(parseInt(e.target.value) / 100)}
                    className="w-24"
                  />
                  <span className="text-sm font-medium text-gray-800">{Math.round(conversionRate * 100)}%</span>
                </div>
              </div>
            </div>
            <div className="flex-1 rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <label className="text-xs text-gray-500 block">Desktop Gift Card Budget</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                    className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-400">per round</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep("plan")}
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors"
          >
            See Recommended Plan →
          </button>
        </div>
      )}

      {/* Step 2: Plan */}
      {step === "plan" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-800 text-sm">Recommended Plan</h2>
                <p className="text-xs text-gray-500 mt-0.5">Toggle platforms on or off. Adjust amounts if needed.</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {activeRecs.reduce((s, r) => s + r.contactsNeeded, 0)} contacts
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  ~${Math.round(totalGiftCardCost)} est. GC cost
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {plan.recommendations.map((rec) => {
                const cfg = PLATFORM_CONFIG[rec.platform];
                const on = overrides[rec.platform];
                return (
                  <div
                    key={rec.platform}
                    className={clsx(
                      "px-5 py-4 flex items-start gap-4 transition-colors",
                      !on && "opacity-50"
                    )}
                  >
                    <button
                      onClick={() => toggleOverride(rec.platform)}
                      className={clsx(
                        "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                        on
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300"
                      )}
                    >
                      {on && <CheckCircle2 className="w-3 h-3" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">{cfg.name}</span>
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium",
                            URGENCY_STYLES[rec.urgency]
                          )}
                        >
                          {URGENCY_ICONS[rec.urgency]}
                          {rec.urgency === "SKIP" ? "Skipped" : rec.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{rec.reason}</p>
                      {cfg.giftCardSenderNote && (
                        <p className="text-xs text-blue-600 mt-1">{cfg.giftCardSenderNote}</p>
                      )}
                    </div>

                    {rec.include && (
                      <div className="shrink-0 text-right text-xs space-y-1">
                        <div className="text-gray-700">
                          <span className="font-semibold">{rec.reviewsNeeded}</span> reviews
                        </div>
                        <div className="text-gray-500">
                          ~<span className="font-medium">{rec.contactsNeeded}</span> contacts
                        </div>
                        {rec.suggestedGiftCardAmount > 0 && (
                          <div className="text-green-700 font-medium">
                            ${rec.suggestedGiftCardAmount}/review
                          </div>
                        )}
                        {rec.platform === "G2" && (
                          <div className="text-blue-600 font-medium">G2 pays</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("goals")}
              className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-50 transition-colors"
            >
              ← Adjust Goals
            </button>
            <button
              onClick={() => setStep("confirm")}
              disabled={activeRecs.length === 0}
              className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Review & Launch →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === "confirm" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Round Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <SummaryCard
                label="Platforms"
                value={String(activeRecs.length)}
                sub={activeRecs.map((r) => PLATFORM_CONFIG[r.platform].shortName).join(", ")}
              />
              <SummaryCard
                label="Total Contacts"
                value={String(activeRecs.reduce((s, r) => s + r.contactsNeeded, 0))}
                sub={`at ${Math.round(conversionRate * 100)}% conversion`}
              />
              <SummaryCard
                label="Est. GC Cost"
                value={`$${Math.round(totalGiftCardCost)}`}
                sub="across all platforms"
              />
            </div>

            <div className="space-y-2">
              {activeRecs.map((rec) => (
                <div key={rec.platform} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                  <span className="font-medium text-gray-800">{PLATFORM_CONFIG[rec.platform].name}</span>
                  <span className="text-gray-500">
                    {rec.contactsNeeded} contacts → {rec.reviewsNeeded} reviews
                    {rec.suggestedGiftCardAmount > 0 && ` @ $${rec.suggestedGiftCardAmount}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            <strong>Before launching:</strong> The system will pull the PO list from Brevo and tenant list from Heap, then show you a preview to approve before any emails go out.
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("plan")}
              className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={() => alert("List curation coming next — this will pull from Brevo + Heap and show you a preview.")}
              className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700"
            >
              Pull Contact Lists →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs font-medium text-gray-700 mt-0.5">{label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}
