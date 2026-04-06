import { fetchClient } from '../api/client';
import type { 
  Queue, 
  AddEntryRequest, 
  AddEntryResponse 
} from '../api/types/queue';

//PADRÃO DA API
const API_PREFIX = '/api/v1';

// contrução da api + endpoints
const ENDPOINTS = {
  QUEUE: (unitId: string) => `${API_PREFIX}/queue/${unitId}`,
  ENTRIES: `${API_PREFIX}/queue/entries`,
  CALL_NEXT: `${API_PREFIX}/queue/call-next`,
  FINISH_CURRENT: `${API_PREFIX}/queue/finish-current`,
} as const;

export const queueService = {
  /**
   * Busca o estado atual da fila de uma unidade específica.
   */
  getQueue: (unitId: string = 'default') => 
    fetchClient<Queue>(ENDPOINTS.QUEUE(unitId)),

  /**
   * Adiciona um novo paciente à fila e retorna o token de posição.
   */
  addEntry: (data: AddEntryRequest) =>
    fetchClient<AddEntryResponse>(ENDPOINTS.ENTRIES, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * (Operador) Chama o próximo paciente da fila.
   */
  callNext: () =>
    fetchClient(ENDPOINTS.CALL_NEXT, { method: 'POST' }),

  /**
   * (Operador) Finaliza o atendimento do paciente atual.
   */
  finishCurrent: () =>
    fetchClient(ENDPOINTS.FINISH_CURRENT, { method: 'POST' }),
};