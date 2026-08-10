import Modal from "./ui/Modal";
import { DIARY_COLORS } from "../constants/diary";

interface Props {
  open: boolean;
  selectedColor: string;
  onClose: () => void;
  onSelect: (color: string) => void;
}

export default function DiaryColorPickerModal({
  open,
  selectedColor,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal open={open} title="Изменить цвет" onClose={onClose} footer={null}>
      <div className="flex flex-wrap gap-2">
        {DIARY_COLORS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`h-10 w-10 rounded-full border transition focus:outline-none ${
              selectedColor === item
                ? "border-white ring-2 ring-offset-2 ring-offset-[var(--app-surface)]"
                : "border-[var(--app-border)]"
            }`}
            style={{ backgroundColor: item }}
            aria-label={`Выбрать цвет ${item}`}
          />
        ))}
      </div>
    </Modal>
  );
}
