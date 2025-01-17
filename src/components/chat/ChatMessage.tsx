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
      "flex gap-3 animate-fade-in",
      isOwn && "flex-row-reverse"
    )}>
      <Avatar className="w-8 h-8 transition-transform hover:scale-110">
        <AvatarImage src={avatar} />
        <AvatarFallback>{sender[0]}</AvatarFallback>
      </Avatar>
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isOwn && "items-end"
      )}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">{sender}</span>
          <span className="text-xs text-muted-foreground/60">{timestamp}</span>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-2xl text-sm transition-all",
          isOwn ? "bg-primary text-primary-foreground rounded-br-none" : "bg-accent rounded-bl-none hover:bg-accent/80"
        )}>
          {message}
        </div>
      </div>
    </div>
  );
}