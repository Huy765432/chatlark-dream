interface TelegramUser {
  username?: string;
  first_name?: string;
  last_name?: string;
}

export const useTelegramUser = (): TelegramUser | null => {
  if (!window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return null;
  }

  return window.Telegram.WebApp.initDataUnsafe.user;
};