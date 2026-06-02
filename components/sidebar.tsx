"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, RefreshCw, Inbox, Star, CreditCard, History, Send } from "lucide-react";
import clsx from "clsx";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, badge: 0 },
  { href: "/rounds/new", label: "New Round", icon: RefreshCw, badge: 0 },
  { href: "/rounds", label: "Round History", icon: History, badge: 0 },
  { href: "/queue", label: "Approve Queue", icon: Inbox, badge: 5 },
  { href: "/reviews", label: "Reviews", icon: Star, badge: 0 },
  { href: "/outreach", label: "Outreach", icon: Send, badge: 0 },
  { href: "/gift-cards", label: "Gift Cards", icon: CreditCard, badge: 3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-white h-screen flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200">
        <span className="text-lg font-semibold text-gray-900">Innago Reviews</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === href
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge > 0 && (
              <span className="bg-blue-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
