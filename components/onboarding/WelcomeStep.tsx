"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle, Users, BarChart3, Layers } from "lucide-react";

// ─── Feature Card ────────────────────────────────────────────────

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureItem({ icon, title, description, delay }: FeatureItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-start gap-3"
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-theme-primary">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-theme-secondary">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Props ───────────────────────────────────────────────────────

interface WelcomeStepProps {
  onContinue: () => void;
}

// ─── Features Data ───────────────────────────────────────────────

const FEATURES = [
  {
    icon: <CheckCircle className="h-4.5 w-4.5 text-amber-500" />,
    title: "متابعة العبادات اليومية",
    description: "تابع صلواتك، أذكارك، وتلاوتك بسهولة مع تنظيم حسب أوقات الصلاة",
  },
  {
    icon: <BarChart3 className="h-4.5 w-4.5 text-emerald-500" />,
    title: "إحصائيات تفصيلية",
    description: "تعرّف على تقدمك مع خريطة حرارية وإحصائيات يومية وشهرية",
  },
  {
    icon: <Users className="h-4.5 w-4.5 text-sky-500" />,
    title: "مجموعات تنافسية",
    description: "أنشئ مجموعات مع أصدقائك وتنافسوا في العبادات",
  },
  {
    icon: <Layers className="h-4.5 w-4.5 text-orange-400" />,
    title: "قوالب جاهزة",
    description: "اختر من قوالب معدّة مسبقًا أو أنشئ جدولك الخاص",
  },
] as const;

// ─── Component ───────────────────────────────────────────────────

export default function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="flex min-h-dvh flex-col"
    >
      {/* Hero Section */}
      <div className="flex flex-col items-center px-6 pt-14 pb-6">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-5 h-24 w-24"
        >
          <Image
            src="/logo.png"
            alt="همة"
            fill
            priority
            className="object-contain dark:invert"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-2xl font-bold text-theme-primary"
        >
          أهلاً بك في همة
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-2 text-center text-sm leading-relaxed text-theme-secondary"
        >
          رفيقك في رحلة العبادة — تابع أعمالك اليومية وارتقِ بهمّتك
        </motion.p>
      </div>

      {/* Features */}
      <div className="flex flex-1 flex-col gap-4 px-6 py-4">
        {FEATURES.map((feature, index) => (
          <FeatureItem
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            delay={0.35 + index * 0.1}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="sticky bottom-0 bg-theme-bg px-6 pb-8 pt-4">
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          onClick={onContinue}
          className="w-full cursor-pointer rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-[0.98]"
        >
          ابدأ الآن
        </motion.button>
      </div>
    </motion.div>
  );
}
