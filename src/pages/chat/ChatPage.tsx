import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';
import type { ChatRoom, ChatMessage, ChatUser, WsIncomingEvent } from '../../types/chat';
import {
  Search, Send, MessageSquare, Users, ArrowLeft,
  Loader2, X, MoreVertical, Phone, Video, Smile,
  CheckCheck, Check, Clock
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(ts?: string) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts?: string) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return formatTime(ts);
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function MessageStatusIcon({ status }: { status: string }) {
  if (status === 'read') return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
  if (status === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-zinc-400" />;
  if (status === 'send') return <Check className="w-3.5 h-3.5 text-zinc-400" />;
  return <Clock className="w-3 h-3 text-zinc-500" />;
}

// Avatar component
function Avatar({ name, size = 'md', online = false }: { name: string; size?: 'sm' | 'md' | 'lg'; online?: boolean }) {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-sky-600',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';

  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizeClass} rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center font-bold text-white`}>
        {getInitials(name)}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0f1117] rounded-full" />
      )}
    </div>
  );
}

// ─── Main Chat Page ────────────────────────────────────────────────────────────

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const userId = (user as any)?.id || (user as any)?._id || '';
  const myName = `${(user as any)?.fname || ''} ${(user as any)?.lname || ''}`.trim() || 'Me';

  // State
  const [chatrooms, setChatrooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Load chatrooms
  useEffect(() => {
    const load = async () => {
      setIsLoadingRooms(true);
      try {
        const rooms = await chatService.getMyChatrooms();
        setChatrooms(rooms);
      } catch {
        setChatrooms([]);
      } finally {
        setIsLoadingRooms(false);
      }
    };
    load();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WS event handler
  const handleWsEvent = useCallback((event: WsIncomingEvent) => {
    if (event.event === 'new_message') {
      const msg = event.data;
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // update last message in room list
      setChatrooms(prev => prev.map(r =>
        r.id === msg.chatRoomId
          ? { ...r, lastMessage: msg.message, lastMessageAt: msg.createdAt }
          : r
      ));
    } else if (event.event === 'typing') {
      const sid = event.senderId;
      if (sid === userId) return;
      setTypingUsers(prev => new Set([...prev, sid]));
      const existing = typingTimeouts.current.get(sid);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        setTypingUsers(prev => { const s = new Set(prev); s.delete(sid); return s; });
      }, 2500);
      typingTimeouts.current.set(sid, t);
    }
  }, [userId]);

  const { joinRoom, sendMessage, sendTyping } = useChatWebSocket({
    userId,
    onMessage: handleWsEvent,
  });

  // Select a chatroom
  const handleSelectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    setShowChatOnMobile(true);
    setIsLoadingMessages(true);
    setMessages([]);
    try {
      joinRoom(room.id);
      const msgs = await chatService.getMessages(room.id);
      // Sort oldest first
      setMessages([...msgs].reverse());
    } catch {
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Send message
  const handleSend = () => {
    if (!inputText.trim() || !selectedRoom) return;
    const receiverId = getOtherUserId(selectedRoom);
    sendMessage(receiverId, inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    if (selectedRoom) sendTyping(selectedRoom.id);
  };

  // Get the other user's id from room name (format: "id1_id2")
  const getOtherUserId = (room: ChatRoom): string => {
    const parts = room.name.split('_');
    return parts.find(p => p !== userId) || '';
  };

  // Get display name for room
  const getRoomDisplayName = (room: ChatRoom): string => {
    if (room.otherUser) {
      return `${room.otherUser.fname} ${room.otherUser.lname}`.trim();
    }
    const otherId = getOtherUserId(room);
    return otherId ? `User ${otherId.slice(-4)}` : room.name;
  };

  // Search users for new chat
  useEffect(() => {
    if (!userSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    clearTimeout(searchTimeout.current);
    setIsSearchingUsers(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await chatService.searchUsers(userSearchQuery.trim());
        setSearchResults(results.filter((u: ChatUser) => (u.id || (u as any)._id) !== userId));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 400);
  }, [userSearchQuery, userId]);

  // Start new chat with a user
  const handleStartChat = async (targetUser: ChatUser) => {
    const targetId = targetUser.id || (targetUser as any)._id;
    // Check if room already exists
    const existing = chatrooms.find(r => {
      const parts = r.name.split('_');
      return parts.includes(userId) && parts.includes(targetId);
    });
    if (existing) {
      setShowNewChat(false);
      setUserSearchQuery('');
      setSearchResults([]);
      handleSelectRoom(existing);
      return;
    }
    // Create new room
    try {
      const ids = [userId, targetId].sort();
      const room = await chatService.createChatroom(userId, {
        name: `${ids[0]}_${ids[1]}`,
        description: 'personal chat room',
        roomType: 'direct',
        isPrivate: true,
      });
      const enriched: ChatRoom = {
        ...room,
        otherUser: {
          id: targetId,
          fname: targetUser.fname,
          lname: targetUser.lname,
          email: targetUser.email,
          name: `${targetUser.fname} ${targetUser.lname}`.trim(),
        }
      };
      setChatrooms(prev => [enriched, ...prev]);
      setShowNewChat(false);
      setUserSearchQuery('');
      setSearchResults([]);
      handleSelectRoom(enriched);
    } catch (e) {
      console.error('Failed to create chatroom:', e);
    }
  };

  // Filter chatrooms by search
  const filteredRooms = chatrooms.filter(r =>
    getRoomDisplayName(r).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isTyping = selectedRoom && typingUsers.size > 0;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0f1117] overflow-hidden rounded-xl border border-zinc-800/60">

      {/* ── LEFT PANEL: Chatroom List ── */}
      <div className={`
        ${isMobile && showChatOnMobile ? 'hidden' : 'flex'}
        flex-col w-full md:w-[320px] lg:w-[360px] border-r border-zinc-800/60 flex-shrink-0 bg-[#13151f]
      `}>

        {/* Header */}
        <div className="p-4 border-b border-zinc-800/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Messages
            </h2>
            <button
              onClick={() => setShowNewChat(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              New Chat
            </button>
          </div>

          {/* Search Chatrooms */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#1a1c28] border border-zinc-700/60 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
        </div>

        {/* New Chat - User Search Panel */}
        {showNewChat && (
          <div className="border-b border-zinc-800/60 bg-[#0f1117] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-zinc-300">Start New Chat</span>
              <button onClick={() => { setShowNewChat(false); setUserSearchQuery(''); setSearchResults([]); }}>
                <X className="w-4 h-4 text-zinc-400 hover:text-white" />
              </button>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search users by name..."
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2 bg-[#1a1c28] border border-zinc-700/60 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {isSearchingUsers && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Searching...
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {searchResults.map(u => {
                  const uid = u.id || (u as any)._id;
                  const name = `${u.fname} ${u.lname}`.trim();
                  return (
                    <button
                      key={uid}
                      onClick={() => handleStartChat(u)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-800/60 transition-colors text-left"
                    >
                      <Avatar name={name || u.email} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">{name || u.email}</p>
                        <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                      </div>
                      {u.role && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-md font-medium">
                          {u.role}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {!isSearchingUsers && userSearchQuery && searchResults.length === 0 && (
              <p className="text-xs text-zinc-500 py-2 text-center">No users found</p>
            )}
          </div>
        )}

        {/* Chatroom List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingRooms ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              <p className="text-xs text-zinc-500">Loading conversations...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4 px-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-zinc-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-400">No conversations yet</p>
                <p className="text-xs text-zinc-600 mt-1">Click "New Chat" to start messaging</p>
              </div>
            </div>
          ) : (
            <div className="py-2">
              {filteredRooms.map(room => {
                const displayName = getRoomDisplayName(room);
                const isActive = selectedRoom?.id === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left
                      ${isActive
                        ? 'bg-blue-600/15 border-r-2 border-blue-500'
                        : 'hover:bg-zinc-800/40 border-r-2 border-transparent'
                      }`}
                  >
                    <Avatar name={displayName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-zinc-200'}`}>
                          {displayName}
                        </p>
                        {room.lastMessageAt && (
                          <span className="text-[10px] text-zinc-500 flex-shrink-0">
                            {formatDate(room.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">
                        {room.lastMessage || 'Start a conversation'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Chat Window ── */}
      <div className={`
        ${isMobile && !showChatOnMobile ? 'hidden' : 'flex'}
        flex-col flex-1 min-w-0
      `}>
        {!selectedRoom ? (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-[#0f1117]">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 flex items-center justify-center">
              <MessageSquare className="w-12 h-12 text-blue-400" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-zinc-200">Select a conversation</h3>
              <p className="text-sm text-zinc-500 mt-2">
                Choose from your existing conversations or start a new chat
              </p>
            </div>
            <button
              onClick={() => setShowNewChat(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-colors"
            >
              <Users className="w-4 h-4" />
              Start a New Chat
            </button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/60 bg-[#13151f] flex-shrink-0">
              {isMobile && (
                <button onClick={() => setShowChatOnMobile(false)} className="text-zinc-400 hover:text-white mr-1">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <Avatar name={getRoomDisplayName(selectedRoom)} size="md" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm">{getRoomDisplayName(selectedRoom)}</h3>
                {isTyping ? (
                  <p className="text-xs text-blue-400 flex items-center gap-1">
                    <span className="flex gap-0.5">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </span>
                    typing...
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500">Active now</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              style={{ background: 'linear-gradient(180deg, #0f1117 0%, #111420 100%)' }}>
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
                    <p className="text-xs text-zinc-500">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center mx-auto mb-4">
                      <Smile className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-sm text-zinc-500">No messages yet.<br />Say hello! 👋</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === userId;
                    const showAvatar = !isMe && (idx === 0 || messages[idx - 1]?.senderId !== msg.senderId);
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {!isMe && (
                          <div className={`flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                            <Avatar name={msg.senderUsername || 'User'} size="sm" />
                          </div>
                        )}
                        <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                          {showAvatar && !isMe && (
                            <span className="text-xs text-zinc-500 mb-1 ml-1">{msg.senderUsername}</span>
                          )}
                          <div className={`
                            relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                            ${isMe
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm'
                              : 'bg-[#1e2030] text-zinc-100 rounded-bl-sm border border-zinc-700/40'
                            }
                          `}>
                            {msg.message}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] text-zinc-600">{formatTime(msg.createdAt)}</span>
                            {isMe && <MessageStatusIcon status={msg.status} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex items-end gap-2">
                      <Avatar name={getRoomDisplayName(selectedRoom)} size="sm" />
                      <div className="bg-[#1e2030] border border-zinc-700/40 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <span key={i} className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.2}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="px-4 py-3 border-t border-zinc-800/60 bg-[#13151f] flex-shrink-0">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    rows={1}
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={e => { setInputText(e.target.value); handleTyping(); }}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 bg-[#1a1c28] border border-zinc-700/60 rounded-2xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none leading-relaxed max-h-32"
                    style={{ minHeight: '46px' }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 mt-1.5 ml-1">Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
