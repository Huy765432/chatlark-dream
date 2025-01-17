import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatRoom } from "./ChatLayout";
import { cn } from "@/lib/utils";

interface ChatListProps {
  rooms: ChatRoom[];
  selectedRoom: string;
  onRoomSelect: (roomId: string) => void;
}

export default function ChatList({ rooms, selectedRoom, onRoomSelect }: ChatListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {rooms.map((room) => (
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
        ))}
      </div>
    </div>
  );
}