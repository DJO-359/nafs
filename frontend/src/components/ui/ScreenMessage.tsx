import type { ReactNode } from "react";

interface Props {
  icon?: string;
  title: string;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

/** Полноэкранное состояние: загрузка, ошибка, недоступность. */
export default function ScreenMessage({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      {icon && <div className="text-5xl">{icon}</div>}

      <h1 className="text-xl font-semibold text-[var(--app-text)]">{title}</h1>

      {description && (
        <p className="max-w-sm text-sm text-[var(--app-hint)]">{description}</p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
