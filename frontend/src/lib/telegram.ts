/**
 * Обёртка над Telegram WebApp.
 *
 * Скрипт telegram-web-app.js подключается в index.html. Раньше его не было
 * вовсе, поэтому window.Telegram.WebApp не существовал: приложение не вызывало
 * ready() (Telegram держал лоадер поверх интерфейса), не разворачивалось на
 * весь экран и не читало тему клиента.
 */

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
}

interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  section_bg_color?: string;
}

interface BackButton {
  show: () => void;
  hide: () => void;
  onClick: (handler: () => void) => void;
  offClick: (handler: () => void) => void;
}

interface HapticFeedback {
  impactOccurred: (style: "light" | "medium" | "heavy") => void;
  notificationOccurred: (type: "error" | "success" | "warning") => void;
  selectionChanged: () => void;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { user?: TelegramUser };
  colorScheme?: "light" | "dark";
  themeParams?: ThemeParams;
  ready: () => void;
  expand: () => void;
  close: () => void;
  BackButton?: BackButton;
  HapticFeedback?: HapticFeedback;
  onEvent?: (event: string, handler: () => void) => void;
  offEvent?: (event: string, handler: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

/** Приложение открыто внутри Telegram и получило подписанные данные. */
export function isInsideTelegram(): boolean {
  const webApp = getWebApp();
  return Boolean(webApp && webApp.initData);
}

/** Сырая подписанная строка для отправки на бэкенд. */
export function getInitData(): string | null {
  const webApp = getWebApp();
  return webApp?.initData ? webApp.initData : null;
}

export function getTelegramUser(): TelegramUser | null {
  return getWebApp()?.initDataUnsafe?.user ?? null;
}

/** Часовой пояс устройства — от него сервер считает «сегодня». */
export function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Сообщает Telegram, что интерфейс готов, разворачивает окно
 * и прокидывает тему клиента в CSS-переменные.
 */
export function initTelegram(): void {
  const webApp = getWebApp();

  // ---- ДОБАВЛЕННЫЕ ЛОГИ ДЛЯ ОТЛАДКИ ----
  console.log("Telegram WebApp:", webApp);
  console.log("initData:", webApp?.initData);
  console.log("initDataUnsafe:", webApp?.initDataUnsafe);
  // ---------------------------------------

  if (!webApp) {
    return;
  }

  webApp.ready();
  webApp.expand();

  applyTheme(webApp);

  webApp.onEvent?.("themeChanged", () => applyTheme(webApp));
}

function applyTheme(webApp: TelegramWebApp): void {
  const root = document.documentElement;
  const theme = webApp.themeParams ?? {};

  const variables: Record<string, string | undefined> = {
    "--tg-bg": theme.bg_color,
    "--tg-text": theme.text_color,
    "--tg-hint": theme.hint_color,
    "--tg-link": theme.link_color,
    "--tg-button": theme.button_color,
    "--tg-button-text": theme.button_text_color,
    "--tg-secondary-bg": theme.secondary_bg_color,
    "--tg-section-bg": theme.section_bg_color,
  };

  for (const [name, value] of Object.entries(variables)) {
    if (value) {
      root.style.setProperty(name, value);
    }
  }

  root.dataset.theme = webApp.colorScheme ?? "light";
}

/** Тактильный отклик. Молча игнорируется вне Telegram. */
export function haptic(
  type: "success" | "error" | "warning" | "selection" = "success",
): void {
  const feedback = getWebApp()?.HapticFeedback;

  if (!feedback) return;

  if (type === "selection") {
    feedback.selectionChanged();
    return;
  }

  feedback.notificationOccurred(type);
}

/** Нативная кнопка «Назад» на вложенных экранах. */
export function bindBackButton(handler: () => void): () => void {
  const backButton = getWebApp()?.BackButton;

  if (!backButton) {
    return () => undefined;
  }

  backButton.onClick(handler);
  backButton.show();

  return () => {
    backButton.offClick(handler);
    backButton.hide();
  };
}
