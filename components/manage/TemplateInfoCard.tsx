import { FileText } from "lucide-react";

interface TemplateInfoCardProps {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export default function TemplateInfoCard({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: TemplateInfoCardProps) {
  return (
    <div className="rounded-2xl border border-theme-border bg-theme-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-semibold text-theme-primary">
          معلومات القالب
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
            اسم القالب <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="مثال: عبادات رمضان المكثفة"
            autoFocus
            className="w-full rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-theme-secondary">
            وصف القالب (اختياري)
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="صف محتوى هذا القالب..."
            rows={2}
            className="w-full resize-none rounded-xl border border-theme-border bg-theme-subtle px-4 py-2.5 text-sm text-theme-primary outline-none transition-colors placeholder:text-theme-secondary/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
          />
        </div>

        <p className="text-[11px] leading-relaxed text-theme-secondary/60">
          يمكنك تعديل الأقسام والعبادات أدناه قبل النشر. التغييرات هنا لن تؤثر على عباداتك الشخصية.
        </p>
      </div>
    </div>
  );
}
