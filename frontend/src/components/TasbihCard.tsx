import { useNavigate } from "react-router-dom";
import { useTasbih } from "../hooks/useTasbih";
import type { TasbihCounter } from "../api/tasbih.api";

export default function TasbihCard() {
  const navigate = useNavigate();
  const { data: counters = [], isLoading, isError } = useTasbih();

  const firstCounter: TasbihCounter | null =
    counters.length > 0 ? counters[0] : null;

  const handleCardClick = () => {
    navigate("/tasbih");
  };

  const formatProgress = (counter: TasbihCounter): string => {
    if (counter.isInfinite) {
      return `${counter.count} / ∞`;
    }
    return `${counter.count} / ${counter.target}`;
  };

  return (
    <div className="relative">
      <div className="relative h-[260px] w-full overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#0F2239_0%,#132C49_50%,#0D2036_100%)] shadow-[0_14px_40px_rgba(0,0,0,0.22)] transition duration-250 ease-in-out hover:-translate-y-0.5 active:scale-[0.98]">
        <button
          type="button"
          onClick={handleCardClick}
          className="absolute inset-0 z-30 cursor-pointer pointer-events-auto"
          aria-label="Открыть счётчики Азкаров"
        />

        <div className="relative z-20 flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#10B981_0%,#059669_100%)] shadow-[0_20px_60px_rgba(16,185,129,0.24)]">
                <span className="text-2xl">📿</span>
              </div>
              <div>
                <p className="text-[34px] font-semibold leading-[1.05] text-white">
                  Азкары
                </p>
                <p className="mt-1 text-[16px] text-white/55">Счётчик</p>
              </div>
            </div>
            <span className="text-[28px] text-white/45">›</span>
          </div>

          <div className="relative z-20 flex-1">
            {isLoading || isError ? (
              <p className="text-[18px] font-medium text-white/50">
                {isError ? "Ошибка загрузки" : "Загрузка..."}
              </p>
            ) : firstCounter ? (
              <div>
                <p className="line-clamp-1 max-w-[90%] text-[18px] font-medium leading-7 text-white">
                  {firstCounter.name}
                </p>
                <p className="mt-2 text-[28px] font-semibold text-white">
                  {formatProgress(firstCounter)}
                </p>
              </div>
            ) : (
              <p className="text-[18px] font-medium text-white/50">
                Создайте первый счётчик
              </p>
            )}
          </div>

          <div className="relative z-20 text-sm text-white/50">
            {firstCounter ? "Активный счётчик" : "Нет счётчиков"}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] overflow-hidden">
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-[180px] w-[180px] rounded-full bg-[#10B981]/18 blur-3xl transform scale-125" />
          <div className="pointer-events-none absolute -bottom-4 right-10 h-[140px] w-[140px] rounded-full bg-[#059669]/25 blur-3xl transform scale-110" />
          <div className="pointer-events-none absolute -bottom-16 left-10 h-[160px] w-[160px] rounded-full bg-white/10 blur-3xl transform scale-125" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-[80px] w-[80px] -translate-x-1/2 rounded-full bg-[#059669]/10 blur-2xl" />
        </div>
      </div>
    </div>
  );
}
