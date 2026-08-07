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
      <div className="relative h-[260px] w-full overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#0F2239_0%,#132C49_50%,#0D2036_100%)] shadow-[0_14px_40px_rgba(0,0,0,0.22)] transition duration-250 ease-in-out hover:-translate-y-0.5 active:scale-[0.98]">
        <button
          type="button"
          onClick={handleCardClick}
          className="absolute inset-0 z-30 cursor-pointer pointer-events-auto"
          aria-label={
            latestDiary ? "Открыть дневник" : "Добавить запись в дневник"
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
              {latestDiary?.content ?? "Сегодня ещё нет записей"}
            </p>
          </div>

          <div className="relative z-20 text-sm text-white/50">
            {latestDiary
              ? new Date(latestDiary.date).toLocaleDateString("ru-RU", {
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
    </div>
  );
}
