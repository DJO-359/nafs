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

  const handleCardClick = () => {
    navigate(`/day/${formatLocalDate(new Date())}`);
  };

  return (
    <div className="relative">
      <div className="relative h-[190px] w-full overflow-hidden rounded-[24px] border border-white/15 bg-[linear-gradient(160deg,#0F2239_0%,#132C49_50%,#0D2036_100%)] shadow-[0_10px_26px_rgba(0,0,0,0.18)] transition duration-250 ease-in-out hover:-translate-y-0.5 active:scale-[0.98]">
        <button
          type="button"
          onClick={handleCardClick}
          className="absolute inset-0 z-30 cursor-pointer pointer-events-auto"
          aria-label={
            latestDiary ? "Открыть дневник" : "Добавить запись в дневник"
          }
        />

        <div className="relative z-20 flex h-full flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#4C8DFF_0%,#2959FF_100%)] shadow-[0_10px_24px_rgba(59,130,246,0.24)]">
                <span className="text-xl">📖</span>
              </div>
              <div>
                <p className="text-[26px] font-semibold leading-none text-white">
                  Дневник
                </p>
              </div>
            </div>
            <span className="text-[22px] text-white/45">›</span>
          </div>

          <div className="mt-1 space-y-1">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">
              Последняя запись
            </p>
            <p className="line-clamp-3 text-[14px] font-medium leading-5 text-white/90">
              {latestDiary?.content ?? "Сегодня ещё нет записей"}
            </p>
          </div>
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
