import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import type { ChatRoom as ChatRoomType } from "./ChatLayout";
import ChatMessage from "./ChatMessage";
import { createMessage, fetchMessages } from "@/services/api";
import { getStoredUser } from "@/hooks/use-user";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { API_HOST } from "@/services/api";
import AddMemberDialog from "./AddMemberDialog";

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
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { data: messagesData, isLoading, error } = useQuery({
    queryKey: ['messages', room?.id],
    queryFn: () => room ? fetchMessages(parseInt(room.id)) : null,
    enabled: !!room,
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messagesData]);

  useEffect(() => {
    if (!room) return;

    // Initialize socket connection
    const socket = io(API_HOST, {
      transports: ['websocket'],
      autoConnect: true
    });

    // Handle connection
    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      // Join the room
      socket.emit('join', { room: room.id });
    });

    // Handle new messages
    socket.on('new_message', (messageData) => {
      // Invalidate and refetch messages query
      queryClient.invalidateQueries({ queryKey: ['messages', room.id] });
      toast.success("New message received!");
      // Scroll to bottom when new message arrives
      scrollToBottom();
    });

    // Handle status messages
    socket.on('status', (data) => {
      console.log('Status:', data.msg);
    });

    // Cleanup on unmount
    return () => {
      socket.emit('leave', { room: room.id });
      socket.disconnect();
    };
  }, [room?.id, queryClient]);

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
      scrollToBottom();
      
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
        <button 
          className="flex items-center gap-3 hover:bg-accent p-2 rounded-lg transition-colors"
          onClick={() => setIsAddMemberOpen(true)}
        >
          <Avatar>
            <AvatarImage src={room.avatar} />
            <AvatarFallback>{room.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{room.name}</h2>
            <p className="text-sm text-muted-foreground">{room.member_count} members</p>
          </div>
        </button>
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
        <div ref={messagesEndRef} />
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

      <AddMemberDialog 
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        roomId={room.id}
      />
    </div>
  );
}