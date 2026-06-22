import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { Position } from '../api/types/queue';
import { queueService } from '../services/queueService';
import { getWebSocketUrl } from '../services/realtimeService';
import type { RealtimeStatus } from './useQueueRealtime';

const positionKey = (token: string) => ['position', token] as const;

interface WebSocketServerMessage<TData = unknown> {
  type: string;
  channel?: string;
  resource_id?: string | null;
  data?: TData;
}

export function usePositionRealtime(token: string | undefined) {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<RealtimeStatus>('connecting');
  const [socketError, setSocketError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: positionKey(token ?? ''),
    queryFn: () => queueService.getPosition(token ?? ''),
    enabled: Boolean(token),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;
    let isActive = true;
    let attempt = 0;

    const connect = () => {
      setConnectionStatus(attempt === 0 ? 'connecting' : 'reconnecting');
      socket = new WebSocket(getWebSocketUrl());

      socket.addEventListener('open', () => {
        if (!isActive || !socket) {
          return;
        }

        attempt = 0;
        setSocketError(null);
        socket.send(JSON.stringify({
          type: 'subscribe',
          channel: 'position',
          resource_id: token,
        }));
      });

      socket.addEventListener('message', (event: MessageEvent<string>) => {
        if (!isActive) {
          return;
        }

        try {
          const message = JSON.parse(event.data) as WebSocketServerMessage<Position>;

          if (message.type === 'subscribed' && message.channel === 'position') {
            setConnectionStatus('connected');
            return;
          }

          if (message.type === 'position.snapshot' && message.resource_id === token && message.data) {
            queryClient.setQueryData(positionKey(token), message.data);
            setConnectionStatus('connected');
          }
        } catch {
          setConnectionStatus('error');
          setSocketError('O servidor enviou uma atualização inválida da posição.');
        }
      });

      socket.addEventListener('error', () => {
        if (!isActive) {
          return;
        }

        setConnectionStatus('error');
        setSocketError('Falha na conexão em tempo real da posição.');
      });

      socket.addEventListener('close', () => {
        if (!isActive) {
          return;
        }

        attempt += 1;
        setConnectionStatus('reconnecting');
        reconnectTimer = window.setTimeout(connect, Math.min(1000 * attempt, 5000));
      });
    };

    connect();

    return () => {
      isActive = false;

      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'unsubscribe',
          channel: 'position',
          resource_id: token,
        }));
      }

      socket?.close();
    };
  }, [queryClient, token]);

  return {
    ...query,
    connectionStatus,
    socketError,
  };
}
