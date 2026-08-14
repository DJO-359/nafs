import Modal from "./ui/Modal";

interface TasbihSettings {
  vibration: boolean;
  sound: boolean;
}

interface Props {
  open: boolean;
  settings: TasbihSettings;
  onClose: () => void;
  onToggleVibration: () => void;
  onToggleSound: () => void;
}

export default function TasbihSettingsModal({
  open,
  settings,
  onClose,
  onToggleVibration,
  onToggleSound,
}: Props) {
  return (
    <Modal
      open={open}
      title="⚙ Настройки Асхары"
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
      </div>
    </Modal>
  );
}
