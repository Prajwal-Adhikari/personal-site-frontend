// src/hooks/useChat.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ChatListItem,
  ChatMessage,
  ChatMode,
  ServerWsMessage,
  Sender,
} from '../types/chat';
import { useLocalStorageState } from './useLocalStorageState';
import { useChatSocket } from './useChatSocket';

type UseChatArgs = {
  mode?: ChatMode;
  adminToken?: string;
};

function getOrCreateClientId() {
  const key = 'chat_client_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    sender: 'owner',
    text: 'Hi! 👋 Leave a message here — I’ll get back to you soon.',
    timestamp: Date.now(),
  },
];

const VISITOR_WS_URL =
  import.meta.env.VITE_CHAT_WS_URL ?? 'ws://localhost:3000/ws';
const ADMIN_WS_URL =
  import.meta.env.VITE_CHAT_ADMIN_WS_URL ?? 'ws://localhost:3000/admin/ws';

function toChatMessage(m: {
  id: string;
  sender: Sender;
  content: string;
  timestamp: number;
}): ChatMessage {
  return {
    id: m.id,
    sender: m.sender,
    text: m.content,
    timestamp: m.timestamp,
  };
}

function sortChatList(list: ChatListItem[]) {
  return [...list].sort((a, b) => b.last_message_at - a.last_message_at);
}

function appendMessage(messages: ChatMessage[], next: ChatMessage) {
  const exists = messages.some(
    (msg) =>
      msg.id === next.id ||
      (msg.sender === next.sender &&
        msg.text === next.text &&
        msg.timestamp === next.timestamp)
  );
  if (exists) return messages;
  return [...messages, next];
}

export function useChat({ mode = 'visitor', adminToken }: UseChatArgs = {}) {
  const isAdmin = mode === 'admin';
  const clientId = useMemo(() => getOrCreateClientId(), []);
  const pendingEchoRef = useRef<Map<string, number>>(new Map());
  const helloSentRef = useRef(false);

  const [chatId, setChatId] = useLocalStorageState<string | null>(
    'chat_chat_id',
    null
  );
  const [messages, setMessages] = useLocalStorageState<ChatMessage[]>(
    'chat_messages',
    DEFAULT_MESSAGES
  );

  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const [selectedChatId, setSelectedChatId] = useLocalStorageState<
    string | null
  >('admin_selected_chat_id', null);
  const [messagesByChat, setMessagesByChat] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [adminReady, setAdminReady] = useState(false);

  const chatIdRef = useRef<string | null>(chatId);
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  const selectedChatIdRef = useRef<string | null>(selectedChatId);
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);
  const lastJoinedChatRef = useRef<string | null>(null);

  const makeEchoKey = useCallback(
    (activeChatId: string, sender: Sender, content: string) =>
      `${activeChatId}|${sender}|${content}`,
    []
  );

  const markPendingEcho = useCallback(
    (activeChatId: string, sender: Sender, content: string) => {
      const key = makeEchoKey(activeChatId, sender, content);
      const count = pendingEchoRef.current.get(key) ?? 0;
      pendingEchoRef.current.set(key, count + 1);
    },
    [makeEchoKey]
  );

  const consumePendingEcho = useCallback(
    (activeChatId: string, sender: Sender, content: string) => {
      const key = makeEchoKey(activeChatId, sender, content);
      const count = pendingEchoRef.current.get(key) ?? 0;
      if (count <= 0) return false;
      if (count === 1) {
        pendingEchoRef.current.delete(key);
      } else {
        pendingEchoRef.current.set(key, count - 1);
      }
      return true;
    },
    [makeEchoKey]
  );

  const clearPendingForChat = useCallback((activeChatId: string) => {
    const prefix = `${activeChatId}|`;
    for (const key of pendingEchoRef.current.keys()) {
      if (key.startsWith(prefix)) {
        pendingEchoRef.current.delete(key);
      }
    }
  }, []);

  const upsertChatList = useCallback((activeChatId: string, ts: number) => {
    setChatList((prev) => {
      const next = prev.some((chat) => chat.chat_id === activeChatId)
        ? prev.map((chat) =>
            chat.chat_id === activeChatId
              ? { ...chat, last_message_at: ts }
              : chat
          )
        : [...prev, { chat_id: activeChatId, last_message_at: ts }];
      return sortChatList(next);
    });
  }, []);

  const onServerMessage = useCallback(
    (msg: ServerWsMessage) => {
      if (msg.type === 'Welcome') {
        if (!isAdmin) {
          setChatId(msg.chat_id);
        }
        return;
      }

      if (msg.type === 'ChatList') {
        if (isAdmin) {
          setAdminReady(true);
          const sorted = sortChatList(msg.chats);
          setChatList(sorted);
          const current = selectedChatIdRef.current;
          if (!current && sorted.length > 0) {
            setSelectedChatId(sorted[0].chat_id);
          } else if (
            current &&
            !sorted.some((chat) => chat.chat_id === current)
          ) {
            setSelectedChatId(sorted[0]?.chat_id ?? null);
          }
        }
        return;
      }

      if (msg.type === 'History') {
        clearPendingForChat(msg.chat_id);
        const history = msg.messages.map(toChatMessage);

        if (isAdmin) {
          setMessagesByChat((prev) => ({
            ...prev,
            [msg.chat_id]: history,
          }));
          if (!selectedChatIdRef.current) {
            setSelectedChatId(msg.chat_id);
          }
          return;
        }

        setChatId(msg.chat_id);
        setMessages((prev) => (history.length > 0 ? history : prev));
        return;
      }

      if (msg.type === 'Message') {
        const selfSender: Sender = isAdmin ? 'owner' : 'visitor';
        if (msg.sender === selfSender) {
          if (consumePendingEcho(msg.chat_id, msg.sender, msg.content)) {
            return;
          }
        }

        const nextMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sender: msg.sender,
          text: msg.content,
          timestamp: msg.timestamp,
        };

        if (isAdmin) {
          setMessagesByChat((prev) => {
            const current = prev[msg.chat_id] ?? [];
            const next = appendMessage(current, nextMessage);
            if (next === current) return prev;
            return { ...prev, [msg.chat_id]: next };
          });
          upsertChatList(msg.chat_id, msg.timestamp);
          if (!selectedChatIdRef.current) {
            setSelectedChatId(msg.chat_id);
          }
          return;
        }

        if (msg.chat_id !== chatIdRef.current) return;
        setMessages((prev) => appendMessage(prev, nextMessage));
        return;
      }

      if (msg.type === 'Error') {
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'system',
          text: `Error: ${msg.message}`,
          timestamp: Date.now(),
        };

        if (isAdmin) {
          const activeChatId = selectedChatIdRef.current;
          if (!activeChatId) return;
          setMessagesByChat((prev) => {
            const current = prev[activeChatId] ?? [];
            return { ...prev, [activeChatId]: [...current, errorMessage] };
          });
          return;
        }

        setMessages((prev) => [...prev, errorMessage]);
      }
    },
    [
      clearPendingForChat,
      consumePendingEcho,
      isAdmin,
      setAdminReady,
      setChatId,
      setChatList,
      setMessages,
      setMessagesByChat,
      setSelectedChatId,
      upsertChatList,
    ]
  );

  const socket = useChatSocket({
    url: isAdmin ? ADMIN_WS_URL : VISITOR_WS_URL,
    onServerMessage,
    enabled: !isAdmin || Boolean(adminToken),
  });

  useEffect(() => {
    if (socket.status !== 'connected') {
      helloSentRef.current = false;
      if (isAdmin) {
        setAdminReady(false);
        lastJoinedChatRef.current = null;
      }
      return;
    }
    if (helloSentRef.current) return;

    if (isAdmin) {
      if (!adminToken) return;
      socket.send({ type: 'AdminHello', token: adminToken });
    } else {
      socket.send({
        type: 'Hello',
        client_id: clientId,
        chat_id: chatIdRef.current ?? undefined,
      });
    }

    helloSentRef.current = true;
  }, [adminToken, clientId, isAdmin, socket]);

  useEffect(() => {
    if (!isAdmin) return;
    if (!adminToken || !adminReady) return;
    if (socket.status !== 'connected') return;
    if (!selectedChatId) return;
    if (lastJoinedChatRef.current === selectedChatId) return;

    socket.send({ type: 'AdminJoinChat', chat_id: selectedChatId });
    lastJoinedChatRef.current = selectedChatId;
  }, [
    adminReady,
    adminToken,
    isAdmin,
    selectedChatId,
    socket,
    socket.status,
  ]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const now = Date.now();
      if (isAdmin) {
        if (!adminToken || !selectedChatId) return;
        const optimistic: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'owner',
          text: trimmed,
          timestamp: now,
        };

        setMessagesByChat((prev) => {
          const current = prev[selectedChatId] ?? [];
          const next = appendMessage(current, optimistic);
          if (next === current) return prev;
          return { ...prev, [selectedChatId]: next };
        });
        upsertChatList(selectedChatId, now);

        const sent = socket.send({
          type: 'AdminSendMessage',
          chat_id: selectedChatId,
          content: trimmed,
        });
        if (sent) {
          markPendingEcho(selectedChatId, 'owner', trimmed);
        }
        return;
      }

      const optimistic: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'visitor',
        text: trimmed,
        timestamp: now,
      };
      setMessages((prev) => appendMessage(prev, optimistic));

      if (!chatId) return;
      const sent = socket.send({
        type: 'SendMessage',
        chat_id: chatId,
        content: trimmed,
      });
      if (sent) {
        markPendingEcho(chatId, 'visitor', trimmed);
      }
    },
    [
      adminToken,
      chatId,
      isAdmin,
      markPendingEcho,
      selectedChatId,
      setMessages,
      setMessagesByChat,
      socket,
      upsertChatList,
    ]
  );

  const activeChatId = isAdmin ? selectedChatId : chatId;
  const activeMessages = isAdmin
    ? activeChatId
      ? messagesByChat[activeChatId] ?? []
      : []
    : messages;

  return {
    mode,
    messages: activeMessages,
    chatId: activeChatId,
    chatList: isAdmin ? chatList : [],
    selectedChatId: isAdmin ? selectedChatId : null,
    setSelectedChatId,
    connectionStatus: socket.status,
    sendMessage,
    canSend: !isAdmin || (Boolean(activeChatId) && Boolean(adminToken)),
    tokenMissing: isAdmin && !adminToken,
    reconnect: socket.reconnect,
  };
}
