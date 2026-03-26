"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Activity, Award, CheckCircle, Clock } from "lucide-react";
import { getGroup, getGroupLeaderboard, type GroupResponse, type GroupLeaderboardEntry } from "@/services/api";
import { getIconComponent } from "@/utils/iconMap";

interface AdminGroupDetailModalProps {
  groupId: string;
  onClose: () => void;
}

export default function AdminGroupDetailModal({ groupId, onClose }: AdminGroupDetailModalProps) {
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<GroupLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError("");
    Promise.all([
      getGroup(groupId),
      getGroupLeaderboard(groupId),
    ])
      .then(([groupRes, boardRes]) => {
        setGroup(groupRes);
        setLeaderboard(boardRes.entries);
      })
      .catch((err) => {
        setError(err.message || "حدث خطأ أثناء تحميل بيانات المجموعة");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [groupId]);

  const totalHabits = group?.categories.reduce((acc, cat) => acc + cat.items.length, 0) || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-theme-bg shadow-2xl"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-theme-border bg-theme-header px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-theme-primary">
                {isLoading ? "جاري التحميل..." : group?.name}
              </h2>
              {!isLoading && (
                <p className="flex items-center gap-2 text-xs text-theme-secondary mt-1">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {group?.memberCount} عضو
                  </span>
                  <span>·</span>
                  <span>{totalHabits} عبادة مسجلة</span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-theme-subtle text-theme-secondary transition-colors hover:bg-theme-border hover:text-theme-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-4 sm:p-6 bg-theme-bg custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                <p className="text-sm font-medium text-theme-secondary text-center">
                   جاري جلب تفاصيل المشاركين والأداء...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-400">
                <span className="rounded-full bg-red-400/10 p-3 mb-2">
                  <X className="h-6 w-6" />
                </span>
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Col: Leaderboard */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Award className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-theme-primary">أداء الأعضاء (لوحة الشرف)</h3>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {leaderboard.length === 0 ? (
                      <div className="text-center py-6 text-xs text-theme-secondary rounded-xl border border-dashed border-theme-border">
                        لا يوجد أعضاء في المجموعة
                      </div>
                    ) : (
                      leaderboard.map((entry) => (
                        <div key={entry.uid} className="flex items-center gap-3 rounded-xl bg-theme-card p-3 border border-theme-border/50">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${entry.rank === 1 ? 'bg-amber-500/20 text-amber-500' : 'bg-theme-subtle text-theme-secondary'}`}>
                            {entry.rank}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <span className="block truncate text-sm font-semibold text-theme-primary">
                              {entry.displayName}
                            </span>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[10px] text-theme-secondary">
                                أنجز {entry.completedCount} من {entry.totalPossible}
                              </span>
                              <span className={`text-[11px] font-bold ${entry.completionRate >= 70 ? 'text-emerald-500' : entry.completionRate >= 40 ? 'text-amber-500' : 'text-red-400'}`}>
                                {entry.completionRate}%
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-theme-subtle overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${entry.completionRate >= 70 ? 'bg-emerald-500' : entry.completionRate >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                                style={{ width: `${entry.completionRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Col: Habits/Categories */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                      <Activity className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-theme-primary">العبادات المحددة</h3>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {!group?.categories || group.categories.length === 0 ? (
                      <div className="text-center py-6 text-xs text-theme-secondary rounded-xl border border-dashed border-theme-border">
                        لم يتم إضافة أي عبادات بعد
                      </div>
                    ) : (
                      group.categories.map((cat) => {
                        const IconComponent = getIconComponent(cat.icon);
                        return (
                          <div key={cat.categoryId} className="rounded-xl border border-theme-border bg-theme-subtle/40 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <IconComponent className="h-4 w-4 text-theme-secondary" />
                              <span className="text-sm font-semibold text-theme-primary">
                                {cat.name}
                              </span>
                            </div>
                            <ul className="flex flex-col gap-1.5 mt-2">
                              {cat.items.map(item => (
                                <li key={item.id} className="flex items-start gap-2 text-xs text-theme-secondary">
                                  <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-theme-secondary/50" />
                                  <span className="leading-snug">{item.label}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
