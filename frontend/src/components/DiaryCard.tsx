import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import SectionTitle from "./ui/SectionTitle";
import EmptyState from "./ui/EmptyState";
import { useDiary } from "../hooks/useDiary";

interface Props {
  diary: {
    content: string;
  } | null;
}

export default function DiaryCard({ diary }: Props) {
  const [text, setText] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const mutation = useDiary();

  // Текст задаётся в момент открытия формы (openCreateForm/openEditForm).
  // Синхронизация через useEffect давала каскадные перерисовки и не была
  // нужна: пока форма открыта, diary извне не меняется.

  async function handleSave() {
    if (!text.trim()) return;

    await mutation.mutateAsync(text);
    setText("");
    setIsFormOpen(false);
  }

  function openCreateForm() {
    setText("");
    setIsFormOpen(true);
  }

  function openEditForm() {
    setText(diary?.content ?? "");
    setIsFormOpen(true);
  }

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <SectionTitle icon="📖" title="Дневник" />
        {!isFormOpen && (
          <button
            type="button"
            onClick={diary ? openEditForm : openCreateForm}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-lg font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            aria-label={diary ? "Редактировать дневник" : "Добавить запись"}
          >
            {diary ? "✏️" : "+"}
          </button>
        )}
        {isFormOpen && (
          <button
            type="button"
            onClick={() => {
              setIsFormOpen(false);
              setText("");
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-border)] text-lg font-semibold text-gray-700 transition hover:bg-gray-300"
            aria-label="Закрыть форму"
          >
            ✕
          </button>
        )}
      </div>

      {!diary && !isFormOpen && (
        <EmptyState
          icon="📖"
          title="Сегодня ещё нет записи"
          description="Запишите несколько мыслей, выводов или благодарностей за сегодняшний день."
        />
      )}

      {diary && !isFormOpen && (
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3 text-sm text-gray-700">
          <p className="whitespace-pre-wrap">{diary.content}</p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isFormOpen && (
          <motion.div
            key="diary-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="mt-4 overflow-hidden"
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              placeholder="Что сегодня произошло? Чему вы научились? За что благодарны?"
              className="mb-4 w-full rounded-xl border border-[var(--app-border)] p-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />

            <Button loading={mutation.isPending} onClick={handleSave}>
              💾 Сохранить
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
