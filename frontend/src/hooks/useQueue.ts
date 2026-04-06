import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueService } from '../services/queueService';
import { ApiError } from '../api/errors/ApiError';
import type { AddEntryResponse } from '../api/types/queue';


export function useQueue(unitId: string = 'default') {
  return useQuery({
    
    queryKey: ['fila-pacientes', unitId], 
    
    queryFn: () => queueService.getQueue(unitId), 
  });
}


export function useAddEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: queueService.addEntry, 
    
    onSuccess: (response: AddEntryResponse) => {
      const { entry, queue } = response.data;

      // 1. Guarda tokens de acompanhamento
      if (entry.position_token && entry.position_path) {
        sessionStorage.setItem('@PSF:position_token', entry.position_token);
        sessionStorage.setItem('@PSF:position_path', entry.position_path);
      }

      // 2. Atualiza a fila local - usar smp a msm key do useQueue
      queryClient.setQueryData(['fila-pacientes', queue.unit_id], queue);
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