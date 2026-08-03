import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { AuthError, ensureAuth } from "../hooks/useAuth";
import ScreenMessage from "../components/ui/ScreenMessage";

interface Props {
  children: ReactNode;
}

/**
 * Авторизация внутри дерева React, а не до рендера.
 *
 * Раньше bootstrap() вызывал createRoot только после успешного await:
 * любая сетевая ошибка — метро, холодный старт хостинга, запрет CORS —
 * оставляла пользователя с пустым белым экраном без единой подсказки.
 *
 * Состояния берём из useQuery, а не из useState в эффекте: так не возникает
 * каскадных перерисовок и бесплатно появляется повтор запроса.
 */
export default function AuthGate({ children }: Props) {
  const auth = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      await ensureAuth();
      return true;
    },
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  if (auth.isPending) {
    return <ScreenMessage icon="⏳" title="Загрузка…" />;
  }

  if (auth.isError) {
    const error =
      auth.error instanceof AuthError
        ? auth.error
        : new AuthError("Не удалось войти.", "network");

    const outsideTelegram = error.kind === "outside-telegram";

    return (
      <ScreenMessage
        icon={outsideTelegram ? "🤖" : "⚠️"}
        title={outsideTelegram ? "Откройте через Telegram" : "Не удалось войти"}
        description={
          outsideTelegram
            ? "Приложение работает внутри Telegram: найдите бота и нажмите «Открыть Nafs»."
            : error.message
        }
        actionLabel={outsideTelegram ? undefined : "Повторить"}
        onAction={outsideTelegram ? undefined : () => void auth.refetch()}
      />
    );
  }

  return <>{children}</>;
}
