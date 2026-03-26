"use client";

import { motion } from "framer-motion";

export interface TabOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface TabSwitcherProps<T extends string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  layoutId?: string;
}

export default function TabSwitcher<T extends string>({
  tabs,
  activeTab,
  onChange,
  layoutId = "tabSwitcher",
}: TabSwitcherProps<T>) {
  return (
    <div className="relative flex rounded-xl bg-theme-subtle p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative z-10 flex flex-1 items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "text-theme-primary"
              : "text-theme-secondary hover:text-theme-primary"
          }`}
        >
          {tab.icon}
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 -z-10 rounded-lg bg-theme-bg shadow-sm"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
