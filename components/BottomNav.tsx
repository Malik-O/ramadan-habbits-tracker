"use client";

import Link from "next/link";
import { Home, BarChart3, Settings2, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";
import { trackNavTap } from "@/utils/analytics";

interface BottomNavProps {
  activeTab: "home" | "stats" | "templates" | "groups";
}

const NAV_ITEMS = [
  { id: "home" as const, label: "الرئيسية", icon: Home, href: "/" },
  { id: "templates" as const, label: "القوالب", icon: Settings2, href: "/templates" },
  { id: "groups" as const, label: "المجموعات", icon: Users, href: "/groups" },
  { id: "stats" as const, label: "الإحصائيات", icon: BarChart3, href: "/stats" },
];

export default function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-theme-border bg-theme-header backdrop-blur-xl">
      <div className="flex items-center justify-around pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
          const isActive = activeTab === id;
          return (
            <Link
              key={id}
              href={href}
              onClick={() => trackNavTap(id)}
              className="relative flex flex-col items-center gap-1 px-5 py-2"
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? "text-amber-500" : "text-theme-secondary"
                  }`}
                />
                {/* {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-amber-500"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )} */}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-amber-500" : "text-theme-secondary"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
