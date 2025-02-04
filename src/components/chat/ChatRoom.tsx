import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, UserPlus, Users, UserMinus } from "lucide-react";
import type { ChatRoom as ChatRoomType } from "./ChatLayout";
import ChatMessage from "./ChatMessage";
import { createMessage, fetchMessages, fetchRoomMembers, removeMemberFromRoom } from "@/services/api";
import { getStoredUser } from "@/hooks/use-user";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { API_HOST } from "@/services/api";
import AddMemberDialog from "./AddMemberDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Message {
  id: string;
  content: string;
  sender: string;
  sender_name: string;
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
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch room members
  const { data: membersData } = useQuery({
    queryKey: ['roomMembers', room?.id],
    queryFn: () => room ? fetchRoomMembers(parseInt(room.id)) : null,
    enabled: !!room,
  });
  console.log(membersData)

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        
        // Đăng ký nhận thông báo push nếu được cấp quyền
        if (permission === "granted" && 'serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY' // Thay thế bằng VAPID key của bạn
            }).then(subscription => {
              // Gửi subscription object lên server của bạn
              console.log('Push Notification subscription:', subscription);
            }).catch(err => {
              console.log('Push subscription error: ', err);
            });
          });
        }
      });
    }
  }, []);

  const showNotification = (message: Message) => {
    if (notificationPermission === "granted" && !document.hasFocus()) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(message.sender_name, {
            body: message.content,
            icon: message.avatar,
            tag: 'message',
            data: {
              timestamp: Date.now(),
              message: message.content
            }
          });
        });
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { data: messagesData, isLoading, error } = useQuery({
    queryKey: ['messages', room?.id],
    queryFn: () => room ? fetchMessages(parseInt(room.id)) : null,
    enabled: !!room,
  });

  useEffect(() => {
    if (!room) return;

    const socket = io(API_HOST, {
      transports: ['websocket'],
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      socket.emit('join', { room: room.id });
    });

    socket.on('new_message', (messageData) => {
      queryClient.invalidateQueries({ queryKey: ['messages', room.id] });
      
      const currentUser = getStoredUser();
      if (messageData.sender_id !== currentUser?.id) {
        const notificationMessage = {
          id: messageData.id.toString(),
          content: messageData.content,
          sender_name: messageData.sender_name || messageData.sender?.login || "Unknown",
          sender: messageData.sender?.login || "",
          timestamp: new Date(messageData.created_at).toLocaleTimeString(),
          avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${messageData.sender?.login || "anonymous"}`
        };
        showNotification(notificationMessage);
      }
      
      toast.success("Có tin nhắn mới!");
      scrollToBottom();
    });

    socket.on('status', (data) => {
      console.log('Status:', data.msg);
    });

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
    sender_name: msg.sender_name || "",
    timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${msg.sender?.login || "anonymous"}`,
    isOwn: getStoredUser()?.id === msg.sender_id
  })) || [])].reverse();

  if (!room) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-background to-accent/20">
        <div className="text-center space-y-2 animate-fade-in">
          <p className="text-lg">Select a chat to start messaging</p>
          <p className="text-sm text-muted-foreground">Choose a room from the list to begin your conversation</p>
        </div>
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
      inputRef.current?.focus();

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
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-background to-accent/20">
        <div className="animate-pulse text-center">
          <p className="text-lg">Loading messages...</p>
        </div>
      </div>
    );
  }

  const handleRemoveMember = async (userId: number) => {
    try {
      await removeMemberFromRoom(parseInt(room.id), userId);
      queryClient.invalidateQueries({ queryKey: ['roomMembers', room?.id] });
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-accent/10">
      <div className="p-4 border-b flex justify-between items-center backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <button
          className="flex items-center gap-3 hover:bg-accent/80 p-2 rounded-lg transition-all group"
          onClick={() => setIsAddMemberOpen(true)}
        >
          <Avatar className="transition-transform group-hover:scale-110">
            <AvatarImage src={room.avatar} />
            <AvatarFallback>{room.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{room.name}</h2>
            <p className="text-sm text-muted-foreground">{room.member_count} members</p>
          </div>
          <UserPlus className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Users className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Members ({membersData?.items.length || 0})</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              {membersData?.items.map((member) => {
                return(
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avatars/svg?seed=${member.user.login}`} />
                          <AvatarFallback>{member.user.login[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user.login}</p>
                          <p className="text-sm text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.user.id)}
                      >
                        <UserMinus className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.content}
            sender={message.sender_name}
            timestamp={message.timestamp}
            avatar={message.avatar}
            isOwn={message.isOwn}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 pb-8 md:pb-4 border-t backdrop-blur-sm bg-background/80 sticky bottom-0 safe-area-bottom">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-background/50 backdrop-blur-sm focus:bg-background transition-colors"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            size="icon"
            className="shrink-0 hover:scale-105 transition-transform"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AddMemberDialog
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        roomId={room.id}
      />
    </div>
  );
}
