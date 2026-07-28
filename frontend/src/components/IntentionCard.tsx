import { useState } from "react";
import Card from "./ui/Card";
import IntentionModal from "./IntentionModal";

interface Props {
  intention: {
    text: string;
    completed: boolean;
  } | null;
  onCreate: (text: string) => Promise<void>;
  onComplete: () => Promise<void>;
}

export default function IntentionCard({
  intention,
  onCreate,
  onComplete,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [repeatMode, setRepeatMode] = useState<
    "none" | "daily" | "weekdays" | "weekly"
  >("none");
  const [useLastAutomatically, setUseLastAutomatically] = useState(false);

  async function handleSave(text: string, repeat: string, autoUse: boolean) {
    if (!text.trim()) return;

    setLoading(true);

    try {
      await onCreate(text);
      setRepeatMode(repeat as typeof repeatMode);
      setUseLastAutomatically(autoUse);
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  }

  const repeatLabel =
    repeatMode === "daily"
      ? "Каждый день"
      : repeatMode === "weekdays"
        ? "По будням"
        : repeatMode === "weekly"
          ? "Каждую неделю"
          : "Не повторять";

  return (
    <>
      <Card>
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">🎯 Намерение дня</h2>
            <p className="mt-1 text-sm text-gray-600">
              {intention
                ? `«${intention.text}»`
                : "Сегодня намерение не выбрано."}
            </p>
          </div>

          {intention && (
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              {repeatMode !== "none" && <span>Повтор: {repeatLabel}</span>}
              {useLastAutomatically && <span>Используется автоматически</span>}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-lg border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              {intention ? "Изменить" : "Выбрать намерение"}
            </button>

            {intention && !intention.completed && (
              <button
                type="button"
                onClick={onComplete}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                Выполнено
              </button>
            )}
          </div>
        </div>
      </Card>

      <IntentionModal
        open={modalOpen}
        initialValue={intention?.text ?? ""}
        initialRepeat={repeatMode}
        initialAutoUse={useLastAutomatically}
        loading={loading}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
