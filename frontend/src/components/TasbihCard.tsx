import { useNavigate } from "react-router-dom";
import { useTasbih } from "../hooks/useTasbih";
import type { TasbihCounter } from "../api/tasbih.api";

export default function TasbihCard() {
  const navigate = useNavigate();
  const { data: counters = [], isLoading, isError } = useTasbih();

  const handleCardClick = () => {
    navigate("/tasbih");
  };

  const formatProgressValue = (counter: TasbihCounter): string => {
    if (counter.isInfinite) {
      return `${counter.count} / ∞`;
    }
    return `${counter.count} / ${counter.target}`;
  };

  const getDotsCount = (): number => {
    if (counters.length === 0) return 0;
    return Math.min(counters.length, 4);
  };

  const isDotGreen = (index: number): boolean => {
    if (index >= counters.length) return false;
    const counter = counters[index];
    return counter.dailyCompleted > 0;
  };

  const dotsCount = getDotsCount();

  return (
    <div className="relative">
      <div
        onClick={handleCardClick}
        className="relative h-[190px] w-full cursor-pointer overflow-hidden rounded-[24px] border border-[#f5b266]/30 bg-[linear-gradient(160deg,#191510_0%,#201d18_35%,#171310_100%)] shadow-[0_10px_26px_rgba(0,0,0,0.18)] transition duration-250 ease-in-out hover:-translate-y-0.5 active:scale-[0.98]"
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleCardClick();
          }
        }}
        aria-label="Открыть счётчики Азкаров"
      >
        <div className="relative z-20 flex h-full flex-col justify-between p-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#f5b266]/40 bg-[linear-gradient(180deg,#f8d19c_0%,#f5a847_100%)] shadow-[0_10px_24px_rgba(245,168,71,0.22)]">
              <span className="text-xl">📿</span>
            </div>
            <p className="text-[26px] font-semibold leading-none text-white">
              Асхары
            </p>
          </div>

          <div className="mt-4 flex min-h-0 flex-col items-end justify-between gap-3">
            <div className="w-full">
              {isLoading || isError ? (
                <p className="text-[13px] font-medium text-white/60">
                  {isError ? "Ошибка загрузки" : "Загрузка..."}
                </p>
              ) : counters.length > 0 ? (
                <>
                  {dotsCount > 0 && (
                    <div className="mt-2 flex gap-1.5">
                      {Array.from({ length: dotsCount }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 w-1.5 rounded-full transition ${
                            isDotGreen(idx) ? "bg-emerald-500" : "bg-white/40"
                          }`}
                          aria-label={`Счётчик ${idx + 1}: ${isDotGreen(idx) ? "завершён сегодня" : "не завершён"}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[13px] font-medium text-white/60">
                  Нет счётчиков
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] overflow-hidden">
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-[140px] w-[140px] rounded-full bg-[#f5a847]/18 blur-3xl transform scale-125" />
          <div className="pointer-events-none absolute -bottom-4 right-10 h-[110px] w-[110px] rounded-full bg-[#f59e0b]/20 blur-3xl transform scale-110" />
          <div className="pointer-events-none absolute -bottom-16 left-10 h-[130px] w-[130px] rounded-full bg-white/10 blur-3xl transform scale-125" />
        </div>
      </div>
    </div>
  );
}
