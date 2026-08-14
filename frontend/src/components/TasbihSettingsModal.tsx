import type { CSSProperties } from "react";
import Modal from "./ui/Modal";

interface TasbihSettings {
  vibration: boolean;
  sound: boolean;
  theme: "light" | "dark";
}

interface Props {
  open: boolean;
  settings: TasbihSettings;
  onClose: () => void;
  onToggleVibration: () => void;
  onToggleSound: () => void;
  onSelectTheme: (theme: "light" | "dark") => void;
  themeStyle?: CSSProperties;
}

export default function TasbihSettingsModal({
  open,
  settings,
  onClose,
  onToggleVibration,
  onToggleSound,
  onSelectTheme,
  themeStyle,
}: Props) {
  return (
    <Modal
      open={open}
      title="⚙ Настройки Асхары"
      onClose={onClose}
      themeStyle={themeStyle}
      headerAction={
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-bg)] text-lg text-[var(--app-text)] transition hover:bg-[var(--app-border)]"
          aria-label="Закрыть настройки"
        >
          ✕
        </button>
      }
      showCancel={false}
      footer={null}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
          <div>
            <p className="text-base font-medium text-[var(--app-text)]">
              Виброотклик
            </p>
            <p className="mt-1 text-sm text-[var(--app-hint)]">
              Короткая вибрация при подсчёте
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleVibration}
            className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-sm text-[var(--app-text)]"
            aria-label="Виброотклик"
          >
            {settings.vibration ? "Вкл" : "Выкл"}
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
          <div>
            <p className="text-base font-medium text-[var(--app-text)]">Звук</p>
            <p className="mt-1 text-sm text-[var(--app-hint)]">
              Короткий звук при подсчёте
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleSound}
            className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-sm text-[var(--app-text)]"
            aria-label="Звук"
          >
            {settings.sound ? "Вкл" : "Выкл"}
          </button>
        </div>

        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
          <p className="text-base font-medium text-[var(--app-text)]">Тема</p>
          <div className="mt-3 space-y-2">
            <label className="flex cursor-pointer items-center gap-3 text-[var(--app-text)]">
              <input
                type="radio"
                name="tasbih-theme"
                checked={settings.theme === "light"}
                onChange={() => onSelectTheme("light")}
              />
              <span>Светлая</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-[var(--app-text)]">
              <input
                type="radio"
                name="tasbih-theme"
                checked={settings.theme === "dark"}
                onChange={() => onSelectTheme("dark")}
              />
              <span>Тёмная</span>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
