import Modal from "./ui/Modal";

interface TasbihSettings {
  vibration: boolean;
  soundVolume: number;
}

interface Props {
  open: boolean;
  settings: TasbihSettings;
  onClose: () => void;
  onToggleVibration: () => void;
  onChangeSoundVolume: (volume: number) => void;
}

export default function TasbihSettingsModal({
  open,
  settings,
  onClose,
  onToggleVibration,
  onChangeSoundVolume,
}: Props) {
  return (
    <Modal
      open={open}
      title="⚙ Настройки Азкары"
      onClose={onClose}
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

        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
          <p className="text-base font-medium text-[var(--app-text)]">Звук</p>
          <p className="mt-1 text-sm text-[var(--app-hint)]">
            Короткий звук при подсчёте
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-lg text-[var(--app-text)]" aria-hidden="true">
              {settings.soundVolume === 0 ? "🔇" : "🔊"}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.soundVolume}
              onChange={(event) =>
                onChangeSoundVolume(Number(event.target.value))
              }
              className="volume-slider min-w-0 flex-1"
              style={{
                background: `linear-gradient(to right, var(--app-accent, #60a5fa) ${settings.soundVolume}%, var(--app-border) ${settings.soundVolume}%)`,
              }}
              aria-label="Громкость звука"
            />
            <span className="w-10 text-right text-sm tabular-nums text-[var(--app-text)]">
              {settings.soundVolume}%
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
