import type { ReactNode } from "react";

interface Props {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  headerAction?: ReactNode;
}

export default function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  headerAction,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--app-surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-semibold">{title}</h2>
          {headerAction}
        </div>

        <div className="p-5">{children}</div>

        <div className="flex justify-end gap-2 border-t p-4">
          {footer}

          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 hover:bg-[var(--app-bg)]"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
