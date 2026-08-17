import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { DiaryEntry } from "../types/day";

interface Props {
  diary: DiaryEntry[] | null;
}

export default function DiaryCard({ diary }: Props) {
  const navigate = useNavigate();
  const latestDiary = diary?.length ? diary[0] : null;

  function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const openDiary = () => {
    navigate(`/day/${formatLocalDate(new Date())}`);
  };

  const createDiaryEntry = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    navigate(`/day/${formatLocalDate(new Date())}`, {
      state: { openNewDiary: true },
    });
  };

  return (
    <div className="relative">
      <div
        onClick={openDiary}
        className="relative h-[190px] w-full cursor-pointer overflow-hidden rounded-[24px] border border-white/15 bg-[linear-gradient(160deg,#0F2239_0%,#132C49_50%,#0D2036_100%)] shadow-[0_10px_26px_rgba(0,0,0,0.18)] transition duration-250 ease-in-out hover:-translate-y-0.5 active:scale-[0.98]"
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openDiary();
          }
        }}
        aria-label={
          latestDiary ? "Открыть дневник" : "Добавить запись в дневник"
        }
      >
        <div className="relative z-20 flex h-full flex-col items-center justify-start p-4 pt-5 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#4C8DFF_0%,#2959FF_100%)] shadow-[0_10px_24px_rgba(59,130,246,0.24)]">
            <span className="text-xl">📖</span>
          </div>

          <p className="mt-3 text-[24px] font-semibold leading-none text-white">
            Дневник
          </p>

          <div className="mt-4 h-px w-full bg-white/15" />

          <button
            type="button"
            onClick={createDiaryEntry}
            className="relative z-30 mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[16px] bg-[linear-gradient(180deg,#4C8DFF_0%,#2F60FF_100%)] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_12px_28px_rgba(59,130,246,0.32)] transition hover:brightness-110 active:scale-[0.98]"
            aria-label="Добавить запись"
          >
            <span className="text-xl leading-none">＋</span>
            Запись
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] overflow-hidden">
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-[140px] w-[140px] rounded-full bg-[#3B82F6]/18 blur-3xl transform scale-125" />
          <div className="pointer-events-none absolute -bottom-4 right-10 h-[110px] w-[110px] rounded-full bg-[#1E40AF]/25 blur-3xl transform scale-110" />
          <div className="pointer-events-none absolute -bottom-16 left-10 h-[130px] w-[130px] rounded-full bg-white/10 blur-3xl transform scale-125" />
        </div>
      </div>
    </div>
  );
}
