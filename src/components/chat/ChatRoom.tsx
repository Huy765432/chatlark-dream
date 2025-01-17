import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import type { ChatRoom as ChatRoomType } from "./ChatLayout";
import ChatMessage from "./ChatMessage";

interface ChatRoomProps {
  room?: ChatRoomType;
}

export default function ChatRoom({ room }: ChatRoomProps) {
  if (!room) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar>
          <AvatarImage src={room.avatar} />
          <AvatarFallback>{room.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{room.name}</h2>
          <p className="text-sm text-muted-foreground">3 members</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <ChatMessage 
          message="Hey everyone!"
          sender="John Doe"
          timestamp="12:30 PM"
          avatar="https://api.dicebear.com/7.x/avatars/svg?seed=john"
        />
        <ChatMessage 
          message="Hi John! How are you?"
          sender="Jane Smith"
          timestamp="12:32 PM"
          avatar="https://api.dicebear.com/7.x/avatars/svg?seed=jane"
          isOwn
        />
      </div>
      <div className="p-4 border-t flex gap-2">
        <Input
          type="text"
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button size="icon" className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}