import { AxiosError } from "axios";

/**
 * Человекочитаемое сообщение из ответа бэкенда.
 * Вынесено из providers.tsx: файл с компонентом не должен экспортировать
 * ещё и утилиты — это ломает fast refresh.
 */
export function describeError(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: string | string[] })
      ?.message;

    if (Array.isArray(message)) return message[0];
    if (typeof message === "string") return message;

    if (!error.response) return "Нет связи с сервером";
  }

  return error instanceof Error ? error.message : "Неизвестная ошибка";
}
