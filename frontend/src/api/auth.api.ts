import { api } from "./axios";

export interface AuthUser {
  id: string;
  telegramId: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  timezone: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

/**
 * Вход по подписанной строке Telegram initData.
 *
 * Раньше здесь была функция loginDev с захардкоженным чужим telegramId —
 * единственный путь входа во всём приложении. Из-за неё все пользователи
 * Mini App работали в одном аккаунте: читали и правили чужой дневник.
 */
export async function loginTelegram(
  initData: string,
  timezone: string,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/telegram", {
    initData,
    timezone,
  });

  return data;
}

/**
 * Вход для локальной разработки вне Telegram.
 * На проде эндпоинт отвечает 404 — подставить чужой аккаунт им нельзя.
 */
export async function loginDev(timezone: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/dev", { timezone });

  return data;
}
