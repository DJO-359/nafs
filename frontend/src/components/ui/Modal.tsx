import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  headerAction?: ReactNode;
  showCancel?: boolean; // новый пропс
}

export default function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  headerAction,
  showCancel = true, // по умолчанию показываем
}: Props) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-[var(--app-surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b p-4 sm:p-5">
          <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
          {headerAction}
        </div>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {children}
        </div>

        {/* FOOTER – отображаем, только если есть footer или showCancel === true */}
        {(footer || showCancel) && (
          <div className="flex shrink-0 justify-end gap-2 border-t p-3 sm:p-4">
            {footer}

            {showCancel && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border px-4 py-2 hover:bg-[var(--app-bg)]"
              >
                Отмена
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
