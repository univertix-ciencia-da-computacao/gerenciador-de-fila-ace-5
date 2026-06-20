import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { Queue } from '../api/types/queue';
import { queueService } from '../services/queueService';
import { getWebSocketUrl } from '../services/realtimeService';
import { queueKeys } from './useQueue';

export type RealtimeStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

interface WebSocketServerMessage<TData = unknown> {
  type: string;
  channel?: string;
  resource_id?: string | null;
  data?: TData;
}

export function useQueueRealtime(unitId: string = 'default') {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<RealtimeStatus>('connecting');
  const [socketError, setSocketError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: queueKeys.queue(unitId),
    queryFn: () => queueService.getQueue(unitId),
    enabled: Boolean(unitId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!unitId) {
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
          channel: 'queue',
          resource_id: unitId,
        }));
      });

      socket.addEventListener('message', (event: MessageEvent<string>) => {
        if (!isActive) {
          return;
        }

        try {
          const message = JSON.parse(event.data) as WebSocketServerMessage<Queue>;

          if (message.type === 'subscribed' && message.channel === 'queue') {
            setConnectionStatus('connected');
            return;
          }

          if (message.type === 'queue.snapshot' && message.resource_id === unitId && message.data) {
            queryClient.setQueryData(queueKeys.queue(unitId), message.data);
            setConnectionStatus('connected');
          }
        } catch {
          setConnectionStatus('error');
          setSocketError('O servidor enviou uma atualização inválida da fila.');
        }
      });

      socket.addEventListener('error', () => {
        if (!isActive) {
          return;
        }

        setConnectionStatus('error');
        setSocketError('Falha na conexão em tempo real da fila.');
      });

      socket.addEventListener('close', () => {
        if (!isActive) {
          return;
        }

        attempt += 1;
        setConnectionStatus('reconnecting');
        const delay = Math.min(1000 * attempt, 5000);
        reconnectTimer = window.setTimeout(connect, delay);
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
          channel: 'queue',
          resource_id: unitId,
        }));
      }

      socket?.close();
    };
  }, [queryClient, unitId]);

  return {
    ...query,
    connectionStatus,
    socketError,
  };
}
