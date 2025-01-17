import ChatLayout from "@/components/chat/ChatLayout";
import { useUser } from "@/hooks/use-user";
import { useTelegramUser } from "@/hooks/use-telegram-user";

export default function Index() {
  const telegramUser = useTelegramUser();
  useUser(telegramUser?.id?.toString() || "5031217165"); // Sử dụng test ID nếu không có Telegram user ID
  
  return <ChatLayout />;
}