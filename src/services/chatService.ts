import { apiClient } from '../api/fastapiClient';
import type { ChatRoom, ChatMessage, ChatUser } from '../types/chat';

// Beanie/FastAPI sometimes returns _id instead of id — normalize it
function normalizeId<T extends { id?: string }>(obj: any): T {
  if (obj && !obj.id && obj._id) {
    obj.id = typeof obj._id === 'object' ? String(obj._id.$oid || obj._id) : String(obj._id);
  }
  return obj as T;
}

export const chatService = {
  // GET /chat-room/ — my chatrooms
  async getMyChatrooms(): Promise<ChatRoom[]> {
    try {
      const res = await apiClient.get('/chat-room/');
      const data = res.data;
      let rooms: any[] = [];
      if (Array.isArray(data)) rooms = data;
      else if (Array.isArray(data?.rooms)) rooms = data.rooms;
      return rooms.map(r => normalizeId<ChatRoom>(r));
    } catch (err: any) {
      // 404 means no rooms yet — return empty
      if (err?.response?.status === 404) return [];
      throw err;
    }
  },

  // POST /chat-room/?userId=xxx — create chatroom
  async createChatroom(userId: string, payload: {
    name: string;
    description?: string;
    roomType?: string;
    isPrivate?: boolean;
  }): Promise<ChatRoom> {
    const res = await apiClient.post(`/chat-room/?userId=${userId}`, {
      roomType: 'direct',
      isPrivate: true,
      ...payload,
    });
    return normalizeId<ChatRoom>(res.data);
  },

  // GET /api/messages/{roomId} — get messages in a chatroom
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    try {
      const res = await apiClient.get(`/api/messages/${roomId}`);
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.messages)) return data.messages;
      return [];
    } catch {
      return [];
    }
  },

  // Search users — GET /api/users?search=xxx
  async searchUsers(query: string): Promise<ChatUser[]> {
    try {
      const res = await apiClient.get('/api/users', {
        params: { search: query, limit: 20 }
      });
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.users)) return data.users;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    } catch {
      return [];
    }
  },
};
