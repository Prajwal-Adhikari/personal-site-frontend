import React, { useMemo, useState } from 'react';
import type { ChatMode } from '../../types/chat';
import ChatPanel from './ChatPanel';

type ChatWidgetProps = {
  mode?: ChatMode;
  adminToken?: string;
};

const ChatWidget: React.FC<ChatWidgetProps> = ({ mode, adminToken }) => {
  const [open, setOpen] = useState(false);
  const { resolvedMode, resolvedToken } = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryAdmin = searchParams.get('admin') === 'true';
    const queryToken = searchParams.get('token') ?? undefined;
    const envMode = import.meta.env.VITE_CHAT_MODE;
    const envToken = import.meta.env.VITE_ADMIN_TOKEN;
    const resolvedMode: ChatMode =
      mode ?? (queryAdmin || envMode === 'admin' ? 'admin' : 'visitor');
    const resolvedToken = adminToken ?? queryToken ?? envToken ?? undefined;
    return { resolvedMode, resolvedToken };
  }, [adminToken, mode]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 1000,
          padding: '10px 14px',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(20,20,20,0.92)',
          color: 'white',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        {open ? 'Close' : 'Chat'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            right: 16,
            bottom: 64,
            width: 420,
            maxWidth: 'calc(100vw - 32px)',
            zIndex: 999,
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
          }}
        >
          <ChatPanel mode={resolvedMode} adminToken={resolvedToken} />
        </div>
      )}
    </>
  );
};

export default ChatWidget;
