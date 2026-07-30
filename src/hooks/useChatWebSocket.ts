import { useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../api/fastapiClient';
import type { WsIncomingEvent } from '../types/chat';

// Convert https:// → wss:// or http:// → ws://
function getWsUrl(userId: string): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const wsBase = base.replace(/^https/, 'wss').replace(/^http/, 'ws');
  return `${wsBase}/ws/${userId}`;
}

interface UseChatWebSocketOptions {
  userId: string;
  onMessage: (event: WsIncomingEvent) => void;
}

export function useChatWebSocket({ userId, onMessage }: UseChatWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket(getWsUrl(userId));
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected as', userId);
    };

    ws.onmessage = (e) => {
      try {
        const data: WsIncomingEvent = JSON.parse(e.data);
        onMessageRef.current(data);
      } catch {
        console.warn('[WS] Failed to parse:', e.data);
      }
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected');
    };

    return () => {
      ws.close();
    };
  }, [userId]);

  // Join a chat room
  const joinRoom = useCallback((chatRoomId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'join_room',
        data: { chatRoomId, userId }
      }));
    }
  }, [userId]);

  // Send a message
  const sendMessage = useCallback((
    receiverId: string,
    message: string,
    messageType: string = 'text'
  ) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'send_message',
        data: { senderId: userId, receiverId, message, messageType }
      }));
    }
  }, [userId]);

  // Send typing indicator
  const sendTyping = useCallback((chatRoomId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'typing',
        data: { chatRoomId, senderId: userId }
      }));
    }
  }, [userId]);

  return { joinRoom, sendMessage, sendTyping };
}
