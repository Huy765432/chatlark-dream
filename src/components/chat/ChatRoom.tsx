import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatRoom } from "./ChatLayout";
import ChatMessage from "./ChatMessage";

interface ChatRoomProps {
  room?: ChatRoom;
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
      <div className="p-4 border-t">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}