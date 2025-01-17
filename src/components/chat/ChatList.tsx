import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatRoom } from "./ChatLayout";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreateRoomDialog from "./CreateRoomDialog";

interface ChatListProps {
  rooms: ChatRoom[];
  selectedRoom: string;
  onRoomSelect: (roomId: string) => void;
  isLoading: boolean;
}

export default function ChatList({ rooms, selectedRoom, onRoomSelect, isLoading }: ChatListProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-accent to-background sticky top-0 z-10">
        <h2 className="font-semibold text-lg">Messages</h2>
      </div>
      <div className="p-4 border-b sticky top-[73px] bg-background z-10">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 hover:scale-105 transition-transform" 
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-5 w-5" />
          Create New Room
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-4 flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))
        ) : (
          rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room.id)}
              className={cn(
                "w-full p-4 flex items-start gap-3 transition-all duration-200 hover:bg-accent/50",
                selectedRoom === room.id ? "bg-accent/80 shadow-md" : ""
              )}
            >
              <Avatar className="transition-transform hover:scale-110">
                <AvatarImage src={room.avatar} />
                <AvatarFallback>{room.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-baseline gap-2">
                  <p className="font-medium truncate">{room.name}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {room.lastMessageTime}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {room.lastMessage}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
      <CreateRoomDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}