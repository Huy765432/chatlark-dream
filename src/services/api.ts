export interface User {
  id: number;
  login: string;
  email: string;
  additional_info: string;
  disabled: boolean;
  pending: boolean;
  requested_on: string | null;
  registered_on: string | null;
  logged_on: string | null;
  groups: string[];
}

export interface ChatRoom {
  id: number;
  name: string;
  type: string;
  created_at: string;
  member_count: number;
  message_count: number;
}

export interface PaginationResponse<T> {
  items: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export const fetchUsers = async (): Promise<PaginationResponse<User>> => {
  const response = await fetch('http://127.0.0.1:5005/api/v1/users?page=1&per_page=10');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const fetchChatRooms = async (userId: string): Promise<PaginationResponse<ChatRoom>> => {
  const response = await fetch(`http://127.0.0.1:5005/api/v1/users/${userId}/chat-rooms?page=1&per_page=10`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};