import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Button from "./ui/Button";
import { useDiary } from "../hooks/useDiary";

interface Props {
  diary: {
    content: string;
    date: string;
  } | null;
}

export default function DiaryCard({ diary }: Props) {
  const [text, setText] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const mutation = useDiary();

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

  const handleCardClick = () => {
    if (diary) {
      openEditForm();
    } else {
      openCreateForm();
    }
  };

  return (
    <div className="relative">
      <div className="relative h-[260px] w-full overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#0F2239_0%,#132C49_50%,#0D2036_100%)] shadow-[0_14px_40px_rgba(0,0,0,0.22)] transition duration-250 ease-in-out hover:-translate-y-0.5 active:scale-[0.98]">
        <button
          type="button"
          onClick={handleCardClick}
          className="absolute inset-0 z-30 cursor-pointer pointer-events-auto"
          aria-label={
            diary ? "Редактировать дневник" : "Добавить запись в дневник"
          }
        />

        <div className="relative z-20 flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#4C8DFF_0%,#2959FF_100%)] shadow-[0_20px_60px_rgba(59,130,246,0.24)]">
                <span className="text-2xl">📖</span>
              </div>
              <div>
                <p className="text-[34px] font-semibold leading-[1.05] text-white">
                  Дневник
                </p>
                <p className="mt-1 text-[16px] text-white/55">
                  Последняя запись
                </p>
              </div>
            </div>
            <span className="text-[28px] text-white/45">›</span>
          </div>

          <div className="relative z-20 mt-4 flex-1">
            <p className="line-clamp-2 max-w-[90%] text-[18px] font-medium leading-7 text-white">
              {diary?.content ?? "Сегодня ещё нет записи"}
            </p>
          </div>

          <div className="relative z-20 text-sm text-white/50">
            {diary
              ? new Date(diary.date).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                })
              : "—"}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] overflow-hidden">
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-[180px] w-[180px] rounded-full bg-[#3B82F6]/18 blur-3xl transform scale-125" />
          <div className="pointer-events-none absolute -bottom-4 right-10 h-[140px] w-[140px] rounded-full bg-[#1E40AF]/25 blur-3xl transform scale-110" />
          <div className="pointer-events-none absolute -bottom-16 left-10 h-[160px] w-[160px] rounded-full bg-white/10 blur-3xl transform scale-125" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-[80px] w-[80px] -translate-x-1/2 rounded-full bg-[#1E40AF]/10 blur-2xl" />
        </div>
      </div>

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
    </div>
  );
}
