// Chat-related TypeScript types

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  roomType: 'direct' | 'group';
  Avatar?: string;
  isPrivate: boolean;
  createdBy: string;
  lastMessageId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  isMuted: boolean;
  createdAt?: string;
  // enriched on frontend
  otherUser?: ChatUser;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderUsername?: string;
  receiverId: string;
  message: string;
  messageType: 'text' | 'image' | 'video' | 'file';
  status: 'send' | 'delivered' | 'read' | 'pending' | 'failed';
  replyTo?: string;
  isEdited: boolean;
  editedAt?: string;
  createdAt?: string;
}

export interface ChatUser {
  id: string;
  fname: string;
  lname: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}

export type WsIncomingEvent =
  | { event: 'join_room'; roomId: string }
  | { event: 'new_message'; data: ChatMessage }
  | { event: 'typing'; senderId: string };
