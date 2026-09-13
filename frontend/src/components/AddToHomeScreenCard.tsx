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

    return undefined;
  }, [webApp]);

  if (!webApp || typeof webApp.checkHomeScreenStatus !== "function") {
    return null;
  }

  if (status === "unsupported") {
    return null;
  }

  return (
    <div className="mt-3">
      {status === "added" ? (
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm opacity-90 transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed"
        >
          <span className="text-base">📱</span>
          <span>✓ Уже на главном экране</span>
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
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-70"
          disabled={loading}
        >
          <span className="text-base">📱</span>
          <span>
            {loading ? "Подождите..." : "Добавить ярлык на главный экран"}
          </span>
        </button>
      ) : null}
    </div>
  );
}
