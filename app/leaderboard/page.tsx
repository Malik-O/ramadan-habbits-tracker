"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Crown,
  Users,
  Zap,
  Star,
  ArrowRight,
  Medal,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function LeaderboardPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-theme-bg pb-20">
      {/* Header */}
      <LeaderboardHeader />

      <div className="flex flex-col gap-6 p-4">
        {/* Hero section */}
        <HeroSection />

        {/* Feature preview cards */}
        <FeaturePreviewList />

        {/* Placeholder leaderboard preview */}
        <LeaderboardPreview />

        {/* CTA */}
        <CallToAction />
      </div>

      <BottomNav activeTab="leaderboard" />
    </div>
  );
}

function LeaderboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header px-4 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-theme-subtle transition-colors hover:bg-theme-border"
        >
          <ArrowRight className="h-4 w-4 text-theme-secondary" />
        </Link>
        <h1 className="text-lg font-bold text-theme-primary">
          لوحة المتصدرين
        </h1>
        <span className="mr-auto rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-500">
          قريباً
        </span>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-orange-400/5 to-transparent p-6 text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative floating circles */}
      <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-amber-400/5 blur-xl" />
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-orange-400/5 blur-xl" />

      {/* Animated trophy */}
      <motion.div
        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-400/10"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Trophy className="h-10 w-10 text-amber-500" />
      </motion.div>

      <motion.h2
        className="mb-2 text-xl font-extrabold text-theme-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        لوحة المتصدرين
      </motion.h2>

      <motion.p
        className="mx-auto max-w-[260px] text-sm leading-relaxed text-theme-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        تنافس مع أصدقائك وعائلتك في إتمام العبادات واكتساب أعلى النقاط!
      </motion.p>

      {/* Coming soon badge */}
      <motion.div
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
      >
        <Zap className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-bold text-amber-500">قريباً إن شاء الله</span>
      </motion.div>
    </motion.div>
  );
}

const FEATURES = [
  {
    icon: Crown,
    title: "ترتيب عام",
    description: "شاهد ترتيبك بين جميع المستخدمين",
    color: "text-amber-500",
    bgColor: "bg-amber-400/10",
  },
  {
    icon: Users,
    title: "مجموعات خاصة",
    description: "أنشئ مجموعة مع عائلتك أو أصدقائك",
    color: "text-sky-500",
    bgColor: "bg-sky-400/10",
  },
  {
    icon: Star,
    title: "إنجازات وأوسمة",
    description: "اربح أوسمة خاصة عند تحقيق أهدافك",
    color: "text-emerald-500",
    bgColor: "bg-emerald-400/10",
  },
  {
    icon: TrendingUp,
    title: "تتبع التقدم",
    description: "قارن تقدمك مع الآخرين يومياً",
    color: "text-orange-500",
    bgColor: "bg-orange-400/10",
  },
] as const;

function FeaturePreviewList() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FEATURES.map((feature, index) => (
        <FeatureCard key={feature.title} feature={feature} index={index} />
      ))}
    </div>
  );
}

interface FeatureCardProps {
  feature: (typeof FEATURES)[number];
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const { icon: Icon, title, description, color, bgColor } = feature;

  return (
    <motion.div
      className="rounded-2xl border border-theme-border bg-theme-card p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.08 }}
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}
      >
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <h3 className="mb-1 text-sm font-bold text-theme-primary">{title}</h3>
      <p className="text-[11px] leading-relaxed text-theme-secondary">
        {description}
      </p>
    </motion.div>
  );
}

const PLACEHOLDER_USERS = [
  { rank: 1, name: "؟؟؟", xp: "---", icon: Crown },
  { rank: 2, name: "؟؟؟", xp: "---", icon: Medal },
  { rank: 3, name: "؟؟؟", xp: "---", icon: Medal },
];

function LeaderboardPreview() {
  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-theme-border bg-theme-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center justify-between border-b border-theme-border px-4 py-3">
        <h3 className="text-sm font-semibold text-theme-primary">
          أفضل المتسابقين
        </h3>
        <span className="rounded-full bg-theme-subtle px-2.5 py-0.5 text-[10px] font-medium text-theme-secondary">
          معاينة
        </span>
      </div>

      <div className="divide-y divide-theme-border">
        {PLACEHOLDER_USERS.map((user, index) => (
          <PlaceholderRow key={user.rank} user={user} index={index} />
        ))}
      </div>

      {/* Blurred rows to indicate more content */}
      <div className="relative">
        <div className="pointer-events-none select-none blur-[6px]">
          {[4, 5].map((rank) => (
            <div
              key={rank}
              className="flex items-center gap-3 border-t border-theme-border px-4 py-3"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-theme-subtle text-xs font-bold text-theme-secondary">
                {rank}
              </span>
              <div className="h-8 w-8 rounded-full bg-theme-subtle" />
              <div className="flex-1">
                <div className="mb-1 h-3 w-20 rounded bg-theme-subtle" />
                <div className="h-2 w-12 rounded bg-theme-subtle" />
              </div>
            </div>
          ))}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-card)] via-[var(--theme-card)]/60 to-transparent" />
      </div>
    </motion.div>
  );
}

interface PlaceholderRowProps {
  user: (typeof PLACEHOLDER_USERS)[number];
  index: number;
}

function PlaceholderRow({ user, index }: PlaceholderRowProps) {
  const rankColors = [
    "bg-amber-400/15 text-amber-500",
    "bg-slate-400/15 text-slate-500",
    "bg-orange-400/15 text-orange-500",
  ];

  const Icon = user.icon;

  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 0.6, x: 0 }}
      transition={{ delay: 0.6 + index * 0.1 }}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${rankColors[index]}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="h-8 w-8 rounded-full bg-theme-subtle" />
      <div className="flex-1">
        <p className="text-sm font-medium text-theme-secondary">{user.name}</p>
      </div>
      <span className="text-xs font-bold text-theme-secondary">{user.xp} XP</span>
    </motion.div>
  );
}

function CallToAction() {
  return (
    <motion.div
      className="flex flex-col items-center gap-3 rounded-2xl border border-theme-border bg-theme-card p-5 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <p className="text-sm leading-relaxed text-theme-secondary">
        استمر في إتمام عباداتك اليومية واكسب نقاط الخبرة لتكون من الأوائل عند
        إطلاق لوحة المتصدرين! 🏆
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:bg-amber-300 active:scale-95"
      >
        ابدأ الآن
        <ArrowRight className="h-4 w-4 rotate-180" />
      </Link>
    </motion.div>
  );
}
