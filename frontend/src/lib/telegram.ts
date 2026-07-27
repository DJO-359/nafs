export function getTelegramUser() {
  const tg = (window as any).Telegram?.WebApp;

  if (!tg) {
    return null;
  }

  const user = tg.initDataUnsafe?.user;

  if (!user) {
    return null;
  }

  return {
    telegramId: user.id.toString(),
    username: user.username ?? "",
    firstName: user.first_name ?? "",
    lastName: user.last_name ?? "",
  };
}
