import Link from "next/link";
import { RefreshCw, Inbox, Star, TrendingUp } from "lucide-react";

const platforms = [
  { name: "G2", current: 4.8, goal: 4.9, count: null, badge: "Leader @ 750 reviews" },
  { name: "Capterra", current: null, goal: null, count: null, badge: "1 review / 3 months" },
  { name: "Trustpilot", current: 4.7, goal: 4.9, count: null, badge: null },
  { name: "Google", current: 4.8, goal: 4.8, count: null, badge: "Maintain" },
  { name: "App Store", current: 4.39, goal: 4.8, count: null, badge: null },
  { name: "Google Play", current: 4.39, goal: 4.8, count: null, badge: null },
];

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Hi Mose — here's where things stand.</p>
        </div>
        <Link
          href="/rounds/new"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          New Round
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <QuickStat icon={<Inbox className="w-5 h-5 text-blue-600" />} label="Pending Approvals" value="0" href="/queue" />
        <QuickStat icon={<Star className="w-5 h-5 text-yellow-500" />} label="Active Rounds" value="0" href="/rounds" />
        <QuickStat icon={<TrendingUp className="w-5 h-5 text-green-600" />} label="Reviews This Month" value="0" href="/reviews" />
      </div>

      {/* Platform goals */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800 text-sm">Platform Goals</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {platforms.map((p) => {
            const gap = p.current != null && p.goal != null ? p.goal - p.current : null;
            const atGoal = gap !== null && gap <= 0;
            return (
              <div key={p.name} className="px-5 py-3.5 flex items-center gap-4">
                <span className="w-28 font-medium text-sm text-gray-900">{p.name}</span>
                <div className="flex-1 flex items-center gap-3">
                  {p.current != null ? (
                    <>
                      <span className="text-sm text-gray-700">{p.current}★</span>
                      <span className="text-gray-300">→</span>
                      <span className="text-sm font-medium text-gray-900">{p.goal}★</span>
                      {gap !== null && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            atGoal
                              ? "bg-green-50 text-green-700"
                              : Math.abs(gap) >= 0.3
                              ? "bg-red-50 text-red-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {atGoal ? "At goal" : `${gap > 0 ? "+" : ""}${gap.toFixed(1)}★ to go`}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </div>
                {p.badge && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-gray-200 p-4 bg-white hover:border-blue-300 transition-colors flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </Link>
  );
}
