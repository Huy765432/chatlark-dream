import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";
import { useQuery } from "@tanstack/react-query";
import { fetchChatRooms } from "@/services/api";
import { toast } from "sonner";
import { useTelegramUser } from "@/hooks/use-telegram-user";

export interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  avatar: string;
  member_count: number;
}

export default function ChatLayout() {
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const telegramUser = useTelegramUser();

  const { data: roomsData, isLoading, error } = useQuery({
    queryKey: ['chatRooms', telegramUser?.id],
    queryFn: () => telegramUser?.id ? fetchChatRooms(telegramUser.id.toString()) : null,
    enabled: !!telegramUser?.id,
  });

  if (error) {
    toast.error("Failed to load chat rooms");
  }

  const rooms: ChatRoom[] = roomsData?.items.map(room => ({
    id: room.id.toString(),
    name: room.name,
    lastMessage: `${room.member_count} members, ${room.message_count} messages`,
    lastMessageTime: new Date(room.created_at).toLocaleString(),
    avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${room.name}`,
    member_count: room.member_count
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
          <div className="flex justify-between items-center">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="text-sm font-medium ml-auto">
              {telegramUser.first_name} {telegramUser.last_name}
              {telegramUser.username && ` (@${telegramUser.username})`}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex">
        {isMobile ? (
          <div className="flex-1 relative">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
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