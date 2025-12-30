import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ClientWsMessage,
  ConnectionStatus,
  ServerWsMessage,
} from '../types/chat';

type UseChatSocketArgs = {
  url: string; // e.g. "ws://localhost:3000/ws"
  onServerMessage: (msg: ServerWsMessage) => void;
  enabled?: boolean;
};

export function useChatSocket({
  url,
  onServerMessage,
  enabled = true,
}: UseChatSocketArgs) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  // simple reconnect backoff
  const retryRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (!enabled) return;
    shouldReconnectRef.current = true;
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    setStatus('connecting');

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      retryRef.current = 0;
      setStatus('connected');
    };

    ws.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data) as ServerWsMessage;
        onServerMessage(parsed);
      } catch {
        // ignore invalid messages
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      setStatus('disconnected');
      if (!shouldReconnectRef.current) {
        return;
      }

      // schedule reconnect
      const attempt = Math.min(retryRef.current + 1, 6);
      retryRef.current = attempt;
      const delay = Math.min(1000 * 2 ** attempt, 15000);

      reconnectTimerRef.current = window.setTimeout(() => {
        connect();
      }, delay);
    };

    ws.onerror = () => {
      // onclose will fire anyway
    };
  }, [enabled, onServerMessage, url]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    retryRef.current = 0;
    wsRef.current?.close();
    wsRef.current = null;
    setStatus('disconnected');
  }, []);

  const send = useCallback((msg: ClientWsMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(msg));
    return true;
  }, []);

  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }
    connect();
    return () => disconnect();
  }, [connect, disconnect, enabled]);

  return useMemo(
    () => ({
      status,
      send,
      reconnect: connect,
      disconnect,
    }),
    [connect, disconnect, send, status]
  );
}
