interface TelegramUser {
  username?: string;
  first_name?: string;
  last_name?: string;
}

export const useTelegramUser = (): TelegramUser | null => {
  if (!window.Telegram?.WebApp?.initDataUnsafe?.user) {
    console.log("Telegram user data not available:", window.Telegram?.WebApp?.initDataUnsafe);
    return null;
  }

  const user = window.Telegram.WebApp.initDataUnsafe.user;
  console.log("Telegram user data:", user);
  return user;
};