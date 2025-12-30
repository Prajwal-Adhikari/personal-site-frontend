// src/components/chat/ChatPanel.tsx
import React from 'react';
import {
  MainContainer,
  Sidebar,
  ConversationList,
  Conversation,
  Avatar,
  ChatContainer,
  ConversationHeader,
  MessageList,
  Message,
  MessageInput,
} from '@chatscope/chat-ui-kit-react';
import type { ChatMode, Sender } from '../../types/chat';
import { useChat } from '../../hooks/useChat';

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatLastActivity = (timestamp: number) =>
  new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

type ChatPanelProps = {
  mode?: ChatMode;
  adminToken?: string;
};

const ChatPanel: React.FC<ChatPanelProps> = ({ mode = 'visitor', adminToken }) => {
  const {
    messages,
    sendMessage,
    connectionStatus,
    chatList,
    chatId,
    selectedChatId,
    setSelectedChatId,
    canSend,
    tokenMissing,
  } = useChat({ mode, adminToken });
  const isAdmin = mode === 'admin';
  const outgoingSender: Sender = isAdmin ? 'owner' : 'visitor';

  const headerTitle = isAdmin
    ? chatId
      ? `Chat ${chatId.slice(0, 8)}`
      : 'Select a chat'
    : 'Contact';

  const headerInfo = tokenMissing
    ? 'Admin token required'
    : connectionStatus === 'connected'
    ? isAdmin
      ? 'Admin Online'
      : 'Online'
    : connectionStatus === 'connecting'
    ? 'Connecting...'
    : isAdmin
    ? 'Offline'
    : 'Offline (messages saved locally)';

  return (
    <div style={{ height: 560, width: '100%' }}>
      {/* ✅ no responsive prop */}
      <MainContainer>
        {/* ✅ fixed sidebar width */}
        <Sidebar position="left" scrollable={isAdmin} style={{ width: 220 }}>
          <ConversationList>
            {!isAdmin && (
            <Conversation
              name="Chat"
              info="Typically replies within a day"
              active
            >
                <Avatar
                  name="You"
                  src="https://api.dicebear.com/7.x/identicon/svg?seed=you"
                />
              </Conversation>
            )}
            {isAdmin &&
              (chatList.length > 0 ? (
                chatList.map((chat) => {
                  const shortId = chat.chat_id.slice(0, 8);
                  return (
                    <Conversation
                      key={chat.chat_id}
                      name={`Chat ${shortId}`}
                      info={
                        chat.last_message_at > 0
                          ? formatLastActivity(chat.last_message_at)
                          : 'No messages yet'
                      }
                      active={chat.chat_id === selectedChatId}
                      onClick={() => setSelectedChatId(chat.chat_id)}
                    >
                      <Avatar
                        name={`Chat ${shortId}`}
                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${chat.chat_id}`}
                      />
                    </Conversation>
                  );
                })
              ) : (
                <Conversation name="No chats yet" info="Waiting for visitors">
                  <Avatar
                    name="No chats"
                    src="https://api.dicebear.com/7.x/identicon/svg?seed=empty"
                  />
                </Conversation>
              ))}
          </ConversationList>
        </Sidebar>

        <ChatContainer>
          <ConversationHeader>
            {/* ✅ remove Back button to avoid mobile-layout artifacts */}
            <Avatar
              name={isAdmin ? 'Admin' : 'You'}
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${
                chatId ?? (isAdmin ? 'admin' : 'you')
              }`}
            />
            <ConversationHeader.Content
              userName={headerTitle}
              info={headerInfo}
            />
          </ConversationHeader>

          <MessageList>
            {messages.map((m) => (
              <Message
                key={m.id}
                model={{
                  message: m.text,
                  sentTime: formatTime(m.timestamp),
                  sender:
                    m.sender === 'system'
                      ? 'System'
                      : m.sender === outgoingSender
                      ? 'You'
                      : isAdmin
                      ? 'Visitor'
                      : 'Me',
                  direction:
                    m.sender === outgoingSender ? 'outgoing' : 'incoming',
                  position: 'single',
                }}
              />
            ))}
          </MessageList>

          <MessageInput
            placeholder={
              tokenMissing
                ? 'Admin token required'
                : isAdmin && !chatId
                ? 'Select a chat to reply...'
                : 'Type your message...'
            }
            attachButton={false}
            disabled={!canSend}
            sendDisabled={!canSend}
            onSend={(text) => sendMessage(text)}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default ChatPanel;
