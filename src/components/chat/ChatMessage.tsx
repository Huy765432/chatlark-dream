import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  sender: string;
  timestamp: string;
  avatar: string;
  isOwn?: boolean;
}

export default function ChatMessage({ 
  message, 
  sender, 
  timestamp, 
  avatar,
  isOwn = false 
}: ChatMessageProps) {
  return (
    <div className={cn(
      "flex gap-3",
      isOwn && "flex-row-reverse"
    )}>
      <Avatar>
        <AvatarImage src={avatar} />
        <AvatarFallback>{sender[0]}</AvatarFallback>
      </Avatar>
      <div className={cn(
        "flex flex-col",
        isOwn && "items-end"
      )}>
        <div className="flex items-baseline gap-2">
          <span className="font-medium">{sender}</span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <div className={cn(
          "mt-1 p-3 rounded-lg",
          isOwn ? "bg-primary text-primary-foreground" : "bg-accent"
        )}>
          {message}
        </div>
      </div>
    </div>
  );
}