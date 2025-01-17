import { useQuery } from "@tanstack/react-query";
import { fetchUserByIdentity, User } from "@/services/api";
import { useEffect } from "react";
import { toast } from "sonner";

const USER_STORAGE_KEY = 'app_user';

export const useUser = (identityVer: string) => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', identityVer],
    queryFn: () => fetchUserByIdentity(identityVer),
    retry: false,
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load user data");
    }
  }, [error]);

  return {
    user,
    isLoading,
    error,
  };
};

export const getStoredUser = (): User | null => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
};