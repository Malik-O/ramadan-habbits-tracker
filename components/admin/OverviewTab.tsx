import { Shield } from "lucide-react";
import StatsOverview from "@/components/admin/StatsOverview";
import TopTemplatesCard from "@/components/admin/TopTemplatesCard";
import type { useAdmin } from "@/hooks/useAdmin";

interface OverviewTabProps {
  stats: ReturnType<typeof useAdmin>["stats"];
  statsLoading: boolean;
}

export default function OverviewTab({ stats, statsLoading }: OverviewTabProps) {
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-theme-secondary">
        <Shield className="h-10 w-10 opacity-20" />
        <p className="text-sm">فشل تحميل البيانات</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <StatsOverview stats={stats} />
      <TopTemplatesCard topTemplates={stats.templates.topTemplates} />
    </div>
  );
}
