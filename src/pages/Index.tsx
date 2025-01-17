import ChatLayout from "@/components/chat/ChatLayout";
import { useUser } from "@/hooks/use-user";

export default function Index() {
  // Thay thế "your-identity-version" bằng identity version thực tế của user
  useUser("your-identity-version");
  
  return <ChatLayout />;
}