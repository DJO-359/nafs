import { useEffect, useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Modal from "./ui/Modal";

interface Props {
  open: boolean;
  initialValue?: string;
  initialRepeat?: "none" | "daily" | "weekdays" | "weekly";
  initialAutoUse?: boolean;
  loading?: boolean;
  onClose: () => void;
  onSave: (text: string, repeat: string, autoUse: boolean) => Promise<void>;
}

const quickOptions = [
  "Не торопиться",
  "Быть терпеливым",
  "Благодарность",
  "Помнить об Аллахе",
  "Слушать внимательно",
];

export default function IntentionModal({
  open,
  initialValue = "",
  initialRepeat = "none",
  initialAutoUse = false,
  loading = false,
  onClose,
  onSave,
}: Props) {
  const [text, setText] = useState("");
  const [repeat, setRepeat] = useState(initialRepeat);
  const [autoUse, setAutoUse] = useState(initialAutoUse);

  useEffect(() => {
    if (open) {
      setText(initialValue);
      setRepeat(initialRepeat);
      setAutoUse(initialAutoUse);
    }
  }, [initialValue, initialRepeat, initialAutoUse, open]);

  async function handleSave() {
    if (!text.trim()) return;

    await onSave(text, repeat, autoUse);
  }

  return (
    <Modal
      open={open}
      title="🎯 Намерение дня"
      onClose={onClose}
      footer={
        <Button onClick={handleSave} loading={loading}>
          Сохранить
        </Button>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm text-gray-500">Текст намерения</p>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите намерение..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-500">Повтор</label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as typeof repeat)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="none">Не повторять</option>
            <option value="daily">Каждый день</option>
            <option value="weekdays">По будням</option>
            <option value="weekly">Каждую неделю</option>
          </select>
        </div>

        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={autoUse}
            onChange={(e) => setAutoUse(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span>Использовать последнее намерение автоматически</span>
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-600">
            Быстрый выбор
          </p>
          <div className="flex flex-wrap gap-2">
            {quickOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setText(option)}
                className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
