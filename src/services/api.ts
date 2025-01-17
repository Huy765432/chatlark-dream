export const API_HOST = 'https://cb99-2402-800-61b3-c7bb-da39-7e8-1321-b637.ngrok-free.app';

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
  capabilities?: string[];
}

export interface ChatRoom {
  id: number;
  name: string;
  type: string;
  created_at: string;
  member_count: number;
  message_count: number;
}

export interface Message {
  id: number;
  chat_room_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  sender: {
    id: number;
    login: string;
  };
}

export interface Member {
  id: number;
  user_id: number;
  chat_room_id: number;
  user: User;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

export interface PaginationResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

export const fetchUserByIdentity = async (identityVer: string): Promise<User> => {
  const response = await fetch(`${API_HOST}/api/v1/users/identity/${identityVer}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
  });
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const fetchUsers = async (): Promise<PaginationResponse<User>> => {
  const response = await fetch(`${API_HOST}/api/v1/users?page=1&per_page=10`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
  });
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const fetchChatRooms = async (userId: string): Promise<PaginationResponse<ChatRoom>> => {
  const response = await fetch(`${API_HOST}/api/v1/users/${userId}/chat-rooms?page=1&per_page=10`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
  });
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const fetchMessages = async (roomId: number, page: number = 1, perPage: number = 50): Promise<PaginationResponse<Message>> => {
  const response = await fetch(`${API_HOST}/api/v1/chat-rooms/${roomId}/messages?page=${page}&per_page=${perPage}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
};

export const createMessage = async (roomId: number, content: string, senderId: number): Promise<Message> => {
  const response = await fetch(`${API_HOST}/api/v1/chat-rooms/${roomId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify({
      content,
      sender_id: senderId
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  return response.json();
};

export const searchUsers = async (): Promise<PaginationResponse<User>> => {
  const response = await fetch(`${API_HOST}/api/v1/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to search users');
  }
  return response.json();
};

export const addMemberToRoom = async (roomId: number, userId: number): Promise<void> => {
  const response = await fetch(`${API_HOST}/api/v1/chat-rooms/${roomId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify({ user_id: userId })
  });
  
  if (!response.ok) {
    throw new Error('Failed to add member to room');
  }
};

export const fetchRoomMembers = async (roomId: number): Promise<PaginationResponse<Member>> => {
  const response = await fetch(`${API_HOST}/api/v1/chat-rooms/${roomId}/members`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch room members');
  }
  return response.json();
};

export const createChatRoom = async (name: string, type: 'public' | 'private'): Promise<ChatRoom> => {
  const response = await fetch(`${API_HOST}/api/v1/chat-rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify({ name, type })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create chat room');
  }
  return response.json();
};