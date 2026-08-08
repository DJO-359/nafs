import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { bindBackButton } from "../lib/telegram";

/**
 * Показывает нативную кнопку «Назад» Telegram на вложенных экранах.
 * Без неё с /calendar, /history и /day/:date уйти назад было нечем:
 * привычного системного жеста в Mini App нет.
 */
export function useBackButton(target: string | (() => void) = "/") {
  const navigate = useNavigate();

  useEffect(() => {
    const handler =
      typeof target === "function" ? target : () => navigate(target);

    return bindBackButton(handler);
  }, [navigate, target]);
}
