import Modal from "./ui/Modal";
import { TASBIH_COLORS, type TasbihColorKey } from "../constants/tasbih-colors";

interface Props {
  open: boolean;
  selectedColor: string;
  pending?: boolean;
  onClose: () => void;
  onSelect: (color: TasbihColorKey) => void;
}

export default function TasbihColorPickerModal({
  open,
  selectedColor,
  pending = false,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal
      open={open}
      title="Цвет счётчика"
      onClose={onClose}
      showCancel={false}
      footer={null}
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--app-hint)]">Выберите цвет</p>
        <div className="grid grid-cols-3 gap-4">
          {TASBIH_COLORS.map((color) => {
            const isSelected = selectedColor === color.key;
            return (
              <button
                key={color.key}
                type="button"
                disabled={pending}
                onClick={() => onSelect(color.key)}
                className={`flex flex-col items-center gap-2 rounded-2xl p-2 transition focus:outline-none disabled:cursor-wait disabled:opacity-60 ${isSelected ? "ring-2 ring-white/90 ring-offset-2 ring-offset-[var(--app-surface)]" : ""}`}
                aria-label={`Выбрать цвет ${color.label}`}
                aria-pressed={isSelected}
              >
                <span
                  className="relative h-14 w-14 rounded-full border border-white/80 shadow-inner"
                  style={{
                    background: color.gradient,
                    boxShadow: `${color.shadow}, inset 4px 4px 8px rgba(255,255,255,0.55), inset -5px -6px 10px rgba(0,0,0,0.22)`,
                  }}
                >
                  <span className="absolute left-3 top-2 h-2.5 w-5 rounded-full bg-white/75 blur-[2px]" />
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white drop-shadow">
                      ✓
                    </span>
                  )}
                </span>
                <span className="text-xs text-[var(--app-hint)]">
                  {color.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
