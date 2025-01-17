import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatRoom } from "./ChatLayout";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatListProps {
  rooms: ChatRoom[];
  selectedRoom: string;
  onRoomSelect: (roomId: string) => void;
  isLoading: boolean;
}

export default function ChatList({ rooms, selectedRoom, onRoomSelect, isLoading }: ChatListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          // Loading skeletons
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
                "w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors",
                selectedRoom === room.id && "bg-accent"
              )}
            >
              <Avatar>
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
    </div>
  );
}