interface TelegramUser {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export const useTelegramUser = (): TelegramUser | null => {
  if (!window.Telegram?.WebApp?.initDataUnsafe?.user) {
    console.log("Telegram user data not available, using test data");
    // Return test data when running in browser
    return {
      id: 5031217165,
      username: "test_user",
      first_name: "Test",
      last_name: "User"
    };
  }

  const user = window.Telegram.WebApp.initDataUnsafe.user;
  console.log("Telegram user data:", user);
  return user;
};