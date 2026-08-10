import Modal from "./ui/Modal";
import { PIN_EMOJI_OPTIONS } from "../constants/diary";

interface Props {
  open: boolean;
  isPinned: boolean;
  onClose: () => void;
  onSelect: (emoji: string | null) => void;
  onUnpin: () => void;
}

export default function PinEmojiPickerModal({
  open,
  isPinned,
  onClose,
  onSelect,
  onUnpin,
}: Props) {
  return (
    <Modal
      open={open}
      title="Выберите значок"
      onClose={onClose}
      footer={null}
    >
      <div className="grid grid-cols-4 gap-3">
        {PIN_EMOJI_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] text-2xl transition hover:border-emerald-500 hover:bg-[var(--app-surface)]"
            aria-label={`Выбрать ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onSelect(null)}
        className="mt-4 w-full rounded-2xl border border-[var(--app-border)] px-4 py-3 text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-bg)]"
      >
        Без значка
      </button>

      {isPinned && (
        <button
          type="button"
          onClick={onUnpin}
          className="mt-2 w-full rounded-2xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Открепить запись
        </button>
      )}
    </Modal>
  );
}
