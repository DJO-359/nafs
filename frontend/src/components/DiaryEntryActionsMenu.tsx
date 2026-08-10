import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  isPinned: boolean;
  onPin: () => void;
  onChangeColor: () => void;
  onShare: () => void;
  onDelete: () => void;
}

interface MenuPosition {
  top: number;
  left: number;
}

export default function DiaryEntryActionsMenu({
  isPinned,
  onPin,
  onChangeColor,
  onShare,
  onDelete,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0 });

  const closeMenu = () => setOpen(false);

  const updatePosition = () => {
    const button = buttonRef.current;
    const menu = menuRef.current;

    if (!button) return;

    const rect = button.getBoundingClientRect();
    const menuWidth = menu?.offsetWidth ?? 200;
    const menuHeight = menu?.offsetHeight ?? 220;
    const padding = 8;

    let left = rect.right - menuWidth;
    let top = rect.bottom + 6;

    if (left < padding) {
      left = padding;
    }

    if (left + menuWidth > window.innerWidth - padding) {
      left = window.innerWidth - menuWidth - padding;
    }

    if (top + menuHeight > window.innerHeight - padding) {
      top = rect.top - menuHeight - 6;
    }

    if (top < padding) {
      top = padding;
    }

    setPosition({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      closeMenu();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const runAction = (action: () => void) => {
    closeMenu();
    action();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        onPointerDown={(event) => event.stopPropagation()}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg leading-none text-[var(--app-hint)] transition hover:bg-black/5 hover:text-[var(--app-text)]"
        aria-label="Действия с записью"
        aria-expanded={open}
      >
        ⋮
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[120] min-w-[200px] overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] py-1 shadow-xl"
            style={{ top: position.top, left: position.left }}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => runAction(onPin)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-[var(--app-text)] transition hover:bg-[var(--app-bg)]"
            >
              📌 {isPinned ? "Открепить" : "Закрепить"}
            </button>

            <button
              type="button"
              onClick={() => runAction(onChangeColor)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-[var(--app-text)] transition hover:bg-[var(--app-bg)]"
            >
              🎨 Изменить цвет
            </button>

            <button
              type="button"
              onClick={() => runAction(onShare)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-[var(--app-text)] transition hover:bg-[var(--app-bg)]"
            >
              ↗️ Поделиться
            </button>

            <div className="my-1 border-t border-[var(--app-border)]" />

            <button
              type="button"
              onClick={() => runAction(onDelete)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
            >
              🗑️ Удалить
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
