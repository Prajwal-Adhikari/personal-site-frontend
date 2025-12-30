export type Sender = 'visitor' | 'owner' | 'system';
export type ChatMode = 'visitor' | 'admin';

export type ChatListItem = {
  chat_id: string;
  last_message_at: number;
};

export type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  timestamp: number;
};

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

// WebSocket protocol (Rust will mirror this)
export type ClientWsMessage =
  | { type: 'Hello'; client_id: string; chat_id?: string }
  | { type: 'SendMessage'; chat_id: string; content: string }
  | { type: 'AdminHello'; token: string }
  | { type: 'AdminJoinChat'; chat_id: string }
  | { type: 'AdminSendMessage'; chat_id: string; content: string };

export type ServerWsMessage =
  | { type: 'Welcome'; chat_id: string }
  | {
      type: 'ChatList';
      chats: ChatListItem[];
    }
  | {
      type: 'History';
      chat_id: string;
      messages: {
        id: string;
        sender: Sender;
        content: string;
        timestamp: number;
      }[];
    }
  | {
      type: 'Message';
      chat_id: string;
      sender: Sender;
      content: string;
      timestamp: number;
    }
  | { type: 'Error'; message: string };
