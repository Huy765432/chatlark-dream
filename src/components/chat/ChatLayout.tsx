import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/services/api";
import { toast } from "sonner";
import { useTelegramUser } from "@/hooks/use-telegram-user";

export interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  avatar: string;
}

export default function ChatLayout() {
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const telegramUser = useTelegramUser();

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  if (error) {
    toast.error("Failed to load users");
  }

  const rooms: ChatRoom[] = usersData?.items.map(user => ({
    id: user.id.toString(),
    name: user.login,
    lastMessage: user.additional_info || "No message yet",
    lastMessageTime: user.logged_on || "Never",
    avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${user.login}`
  })) || [];

  // Set initial selected room if not set and rooms are available
  if (rooms.length > 0 && !selectedRoom) {
    setSelectedRoom(rooms[0].id);
  }

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const currentRoom = rooms.find(room => room.id === selectedRoom);

  return (
    <div className="h-screen flex flex-col">
      {/* Telegram User Info */}
      {telegramUser && (
        <div className="p-4 bg-primary/10 border-b">
          <p className="text-sm font-medium">
            Welcome, {telegramUser.first_name} {telegramUser.last_name}
            {telegramUser.username && ` (@${telegramUser.username})`}
          </p>
        </div>
      )}
      
      <div className="flex-1 flex">
        {isMobile ? (
          <div className="flex-1 relative">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="fixed top-4 left-4 z-50"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[300px]">
                <ChatList 
                  rooms={rooms}
                  selectedRoom={selectedRoom}
                  onRoomSelect={handleRoomSelect}
                  isLoading={isLoading}
                />
              </SheetContent>
            </Sheet>
            <div className="flex-1 h-full">
              <ChatRoom room={currentRoom} />
            </div>
          </div>
        ) : (
          <>
            <div className="w-[300px] border-r">
              <ChatList
                rooms={rooms}
                selectedRoom={selectedRoom}
                onRoomSelect={handleRoomSelect}
                isLoading={isLoading}
              />
            </div>
            <div className="flex-1">
              <ChatRoom room={currentRoom} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}