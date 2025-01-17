interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramWebAppUser;
  auth_date?: string;
  hash?: string;
}

interface TelegramWebApp {
  initDataUnsafe: TelegramWebAppInitData;
  initData: string;
  version: string;
  platform: string;
  colorScheme: string;
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: any;
  BackButton: any;
  ready(): void;
  expand(): void;
  close(): void;
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}