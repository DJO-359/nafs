import { loginDev, loginTelegram, type LoginResponse } from "../api/auth.api";
import {
  getInitData,
  getTelegramUser,
  getTimezone,
  isInsideTelegram,
} from "../lib/telegram";

const TOKEN_KEY = "token";
const TELEGRAM_ID_KEY = "telegramId";

export type AuthErrorKind = "outside-telegram" | "network" | "rejected";

/** Ошибка входа, которую UI показывает отдельным экраном. */
export class AuthError extends Error {
  kind: AuthErrorKind;

  constructor(message: string, kind: AuthErrorKind) {
    super(message);
    this.name = "AuthError";
    this.kind = kind;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TELEGRAM_ID_KEY);
}

function saveSession(response: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, response.accessToken);

  if (response.user.telegramId) {
    localStorage.setItem(TELEGRAM_ID_KEY, response.user.telegramId);
  }
}

/** Срок действия JWT из полезной нагрузки, без проверки подписи. */
function getTokenExpiry(token: string): number | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };

    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Токен пригоден, если не истекает в ближайшую минуту.
 * Раньше срок жизни не проверялся вообще: ровно через 7 дней после первого
 * входа все запросы начинали получать 401, и выйти из этого состояния
 * можно было только очисткой хранилища WebView.
 */
function isTokenUsable(token: string): boolean {
  const expiresAt = getTokenExpiry(token);

  if (expiresAt === null) return true;

  return expiresAt - Date.now() > 60_000;
}

/** Сохранённая сессия принадлежит другому Telegram-аккаунту. */
function isForeignSession(): boolean {
  const storedId = localStorage.getItem(TELEGRAM_ID_KEY);
  const currentUser = getTelegramUser();

  if (!storedId || !currentUser) return false;

  return storedId !== String(currentUser.id);
}

/** Выполняет вход и сохраняет сессию. */
export async function login(): Promise<void> {
  const timezone = getTimezone();
  const initData = getInitData();

  try {
    if (initData) {
      saveSession(await loginTelegram(initData, timezone));
      return;
    }

    // Вне Telegram остаётся только dev-вход; в production его нет
    saveSession(await loginDev(timezone));
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response
      ?.status;

    if (status === 404 || status === 401) {
      throw new AuthError(
        isInsideTelegram()
          ? "Telegram отклонил вход. Откройте приложение заново."
          : "Откройте приложение через Telegram-бота.",
        isInsideTelegram() ? "rejected" : "outside-telegram",
      );
    }

    throw new AuthError("Не удалось связаться с сервером.", "network");
  }
}

/**
 * Гарантирует наличие рабочей сессии.
 * Возвращает управление только когда токен точно пригоден.
 */
export async function ensureAuth(): Promise<void> {
  if (isForeignSession()) {
    clearSession();
  }

  const token = getToken();

  if (token && isTokenUsable(token)) {
    return;
  }

  clearSession();
  await login();
}
