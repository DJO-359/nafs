import { useEffect, useState } from "react";
import { getWebApp } from "../lib/telegram";

type HomeStatus = "added" | "missed" | "unsupported" | null;

export default function AddToHomeScreenCard() {
  const webApp = getWebApp();
  const [status, setStatus] = useState<HomeStatus>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!webApp || typeof webApp.checkHomeScreenStatus !== "function") {
      return undefined;
    }

    const sync = () => {
      const result = webApp.checkHomeScreenStatus?.();
      const nextStatus = result?.status ?? "missed";
      setStatus(nextStatus);
    };

    sync();

    webApp.onEvent?.("homeScreenChecked", sync);
    webApp.onEvent?.("homeScreenAdded", () => {
      setStatus("added");
    });

    return () => {
      // Telegram event handlers are optional and the mini app hook is not used elsewhere.
    };
  }, [webApp]);

  if (!webApp || typeof webApp.checkHomeScreenStatus !== "function") {
    return null;
  }

  if (status === "unsupported") {
    return (
      <section className="rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-xl text-[var(--app-text)]">
            📱
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-[var(--app-text)]">
              Иконка на телефоне
            </h3>
            <p className="mt-1 text-xs leading-5 text-[var(--app-hint)]">
              Добавь ярлык на главный экран —<br />
              открывай Nafs в один тап
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-xl text-[var(--app-text)]">
          📱
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--app-text)]">
            Иконка на телефоне
          </h3>
          <p className="mt-1 text-xs leading-5 text-[var(--app-hint)]">
            Добавь ярлык на главный экран —<br />
            открывай Nafs в один тап
          </p>

          {status === "added" ? (
            <button
              type="button"
              disabled
              className="mt-3 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-hint)] opacity-90"
            >
              Уже на главном экране
            </button>
          ) : status === "missed" || status === null ? (
            <button
              type="button"
              onClick={() => {
                if (!webApp?.addToHomeScreen) return;
                setLoading(true);
                try {
                  webApp.addToHomeScreen?.();
                  setStatus("added");
                } catch {
                  setStatus("missed");
                } finally {
                  setLoading(false);
                }
              }}
              className="mt-3 w-full rounded-2xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Подождите..." : "Добавить на главный экран"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
