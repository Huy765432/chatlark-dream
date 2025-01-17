import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import type { ChatRoom as ChatRoomType } from "./ChatLayout";
import ChatMessage from "./ChatMessage";
import { createMessage, fetchMessages } from "@/services/api";
import { getStoredUser } from "@/hooks/use-user";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  avatar: string;
  isOwn?: boolean;
}

interface ChatRoomProps {
  room?: ChatRoomType;
}

export default function ChatRoom({ room }: ChatRoomProps) {
  const [newMessage, setNewMessage] = useState("");

  const { data: messagesData, isLoading, error } = useQuery({
    queryKey: ['messages', room?.id],
    queryFn: () => room ? fetchMessages(parseInt(room.id)) : null,
    enabled: !!room,
  });

  if (error) {
    toast.error("Failed to load messages");
  }

  const messages: Message[] = [...(messagesData?.items.map(msg => ({
    id: msg.id.toString(),
    content: msg.content,
    sender: msg.sender?.login || "",
    timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${msg.sender?.login || "anonymous"}`,
    isOwn: getStoredUser()?.id === msg.sender_id
  })) || [])].reverse();

  if (!room) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a chat to start messaging
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const user = getStoredUser();
    if (!user) {
      toast.error("You must be logged in to send messages");
      return;
    }

    try {
      await createMessage(
        parseInt(room.id), 
        newMessage.trim(),
        user.id
      );

      setNewMessage("");
      
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex md:justify-start justify-center items-center">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={room.avatar} />
            <AvatarFallback>{room.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{room.name}</h2>
            <p className="text-sm text-muted-foreground">3 members</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.content}
            sender={message.sender}
            timestamp={message.timestamp}
            avatar={message.avatar}
            isOwn={message.isOwn}
          />
        ))}
      </div>
      <div className="p-4 border-t flex gap-2">
        <Input
          type="text"
          placeholder="Type a message..."
          className="flex-1"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button size="icon" className="shrink-0" onClick={handleSendMessage}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}