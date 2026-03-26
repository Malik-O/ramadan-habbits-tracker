
interface ManageHeaderProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  showEditButton?: boolean;
}

export default function ManageHeader({ isEditMode, onToggleEditMode, showEditButton = true }: ManageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-theme-border bg-theme-header backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-theme-primary">إدارة العادات</h1>
        </div>
        {showEditButton && (
          <button
            onClick={onToggleEditMode}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              isEditMode
                ? "bg-amber-500 text-slate-950"
                : "bg-theme-subtle text-theme-secondary hover:bg-theme-border"
            }`}
          >
            {isEditMode ? "تم" : "تعديل"}
          </button>
        )}
      </div>
    </header>
  );
}
