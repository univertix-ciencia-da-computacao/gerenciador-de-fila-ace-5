import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueService } from '../services/queueService';
import { ApiError } from '../api/errors/ApiError';
import type { AddEntryResponse } from '../api/types/queue';

export const queueKeys = {
  queue: (unitId: string) => ['fila-pacientes', unitId] as const,
};

export function useQueue(unitId: string = 'default') {
  return useQuery({
    queryKey: queueKeys.queue(unitId), 
    queryFn: () => queueService.getQueue(unitId), 
  });
}


export function useAddEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: queueService.addEntry, 
    
    onSuccess: (response: AddEntryResponse) => {
      const { entry, queue } = response;

      // 1. Guarda tokens de acompanhamento
      if (entry.position_token && entry.position_path) {
        sessionStorage.setItem('@PSF:position_token', entry.position_token);
        sessionStorage.setItem('@PSF:position_path', entry.position_path);
      }

      // 2. Atualiza a fila local - usar smp a msm key do useQueue
      queryClient.setQueryData(queueKeys.queue(queue.unit_id), queue);
    },
    
    onError: (error: unknown) => { 
      if (error instanceof ApiError) {
        console.error(`Falha ao adicionar: [${error.status}] ${error.message}`);
        toast.error(error.message || 'Não foi possível adicionar o paciente.');
      } else {
        console.error('Erro desconhecido:', error);
        toast.error('Erro de conexão ou instabilidade no servidor.');
      }
    }
  });
}

export function useCallNext(unitId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => queueService.callNext(unitId),
    onSuccess: (response) => {
      queryClient.setQueryData(queueKeys.queue(response.queue.unit_id), response.queue);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Não foi possível chamar o próximo paciente.');
        return;
      }

      toast.error('Erro de conexão ou instabilidade no servidor.');
    },
  });
}

export function useFinishCurrent(unitId: string = 'default') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => queueService.finishCurrent(unitId),
    onSuccess: (response) => {
      queryClient.setQueryData(queueKeys.queue(response.queue.unit_id), response.queue);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Não foi possível finalizar o atendimento.');
        return;
      }

      toast.error('Erro de conexão ou instabilidade no servidor.');
    },
  });
}
