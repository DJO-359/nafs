/**
 * Обёртка над Telegram WebApp.
 *
 * Скрипт telegram-web-app.js подключается в index.html.
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

  version?: string;
  platform?: string;
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
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

export function isInsideTelegram(): boolean {
  const webApp = getWebApp();
  return Boolean(webApp && webApp.initData);
}

export function getInitData(): string | null {
  const webApp = getWebApp();
  return webApp?.initData ? webApp.initData : null;
}

export function getTelegramUser(): TelegramUser | null {
  return getWebApp()?.initDataUnsafe?.user ?? null;
}

export function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function initTelegram(): void {
  const webApp = getWebApp();

  console.log("========== TELEGRAM DEBUG ==========");

  console.log("window.Telegram =", window.Telegram);
  console.log("WebApp =", webApp);

  console.log("version =", webApp?.version);
  console.log("platform =", webApp?.platform);

  console.log("location =", window.location.href);
  console.log("search =", window.location.search);
  console.log("hash =", window.location.hash);

  console.log(
    "launchParams =",
    new URLSearchParams(window.location.search).toString(),
  );

  console.log("initData.length =", webApp?.initData?.length ?? 0);
  console.log("initData =", JSON.stringify(webApp?.initData));

  console.log("initDataUnsafe =", webApp?.initDataUnsafe);

  console.log("user =", webApp?.initDataUnsafe?.user);
  console.log("query_id =", (webApp?.initDataUnsafe as any)?.query_id);
  console.log("auth_date =", (webApp?.initDataUnsafe as any)?.auth_date);
  console.log("hash =", (webApp?.initDataUnsafe as any)?.hash);

  console.log("====================================");

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
