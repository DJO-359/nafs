import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { bindBackButton } from "../lib/telegram";

/**
 * Показывает нативную кнопку «Назад» Telegram на вложенных экранах.
 * Без неё с /calendar, /history и /day/:date уйти назад было нечем:
 * привычного системного жеста в Mini App нет.
 */
export function useBackButton(target = "/") {
  const navigate = useNavigate();

  useEffect(() => bindBackButton(() => navigate(target)), [navigate, target]);
}
