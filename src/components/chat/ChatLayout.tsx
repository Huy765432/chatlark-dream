import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";

export interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  avatar: string;
}

const mockRooms: ChatRoom[] = [
  {
    id: "1",
    name: "General Chat",
    lastMessage: "Hey everyone! How are you doing?",
    lastMessageTime: "12:30 PM",
    avatar: "https://api.dicebear.com/7.x/avatars/svg?seed=1"
  },
  {
    id: "2", 
    name: "Design Team",
    lastMessage: "The new mockups look great!",
    lastMessageTime: "10:15 AM",
    avatar: "https://api.dicebear.com/7.x/avatars/svg?seed=2"
  },
  {
    id: "3",
    name: "Development",
    lastMessage: "PR is ready for review",
    lastMessageTime: "Yesterday",
    avatar: "https://api.dicebear.com/7.x/avatars/svg?seed=3"
  },
];

export default function ChatLayout() {
  const [selectedRoom, setSelectedRoom] = useState<string>(mockRooms[0].id);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const currentRoom = mockRooms.find(room => room.id === selectedRoom);

  return (
    <div className="h-screen flex">
      {isMobile ? (
        <div className="flex-1 relative">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[300px]">
              <ChatList 
                rooms={mockRooms}
                selectedRoom={selectedRoom}
                onRoomSelect={handleRoomSelect}
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
              rooms={mockRooms}
              selectedRoom={selectedRoom}
              onRoomSelect={handleRoomSelect}
            />
          </div>
          <div className="flex-1">
            <ChatRoom room={currentRoom} />
          </div>
        </>
      )}
    </div>
  );
}