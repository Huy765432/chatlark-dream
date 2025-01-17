import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { searchUsers, addMemberToRoom } from "@/services/api";
import { toast } from "sonner";
import { Loader2, Search, UserPlus } from "lucide-react";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
}

export default function AddMemberDialog({ open, onOpenChange, roomId }: AddMemberDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: searchUsers,
    enabled: open,
  });

  const handleAddMember = async (userId: number) => {
    try {
      await addMemberToRoom(parseInt(roomId), userId);
      toast.success("Member added successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add member");
    }
  };

  const filteredUsers = usersData?.items.filter(user => 
    user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Member to Chat Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/avatars/svg?seed=${user.login}`} />
                      <AvatarFallback>{user.login[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.login}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleAddMember(user.id)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}