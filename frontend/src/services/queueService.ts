import { fetchClient } from '../api/client';
import type { ApiResponse } from '../api/types/common';
import type { 
  Queue, 
  AddEntryRequest, 
  AddEntryResponse,
  Position,
  QueueActionResponse,
} from '../api/types/queue';

//PADRÃO DA API
const API_PREFIX = '/api/v1';

// contrução da api + endpoints
const ENDPOINTS = {
  QUEUE: (unitId: string) => `${API_PREFIX}/queue/${unitId}`,
  ENTRIES: `${API_PREFIX}/queue/entries`,
  POSITION: (token: string) => `${API_PREFIX}/position/${token}`,
  CALL_NEXT: `${API_PREFIX}/queue/call-next`,
  FINISH_CURRENT: `${API_PREFIX}/queue/finish-current`,
} as const;

export const queueService = {
  /**
   * Busca o estado atual da fila de uma unidade específica.
   */
  async getQueue(unitId: string = 'default'): Promise<Queue> {
    const response = await fetchClient<ApiResponse<Queue>>(ENDPOINTS.QUEUE(unitId));
    return response.data;
  },

  /**
   * Adiciona um novo paciente à fila e retorna o token de posição.
   */
  async addEntry(data: AddEntryRequest): Promise<AddEntryResponse> {
    const response = await fetchClient<ApiResponse<AddEntryResponse>>(ENDPOINTS.ENTRIES, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async getPosition(token: string): Promise<Position> {
    const response = await fetchClient<ApiResponse<Position>>(ENDPOINTS.POSITION(token));
    return response.data;
  },

  /**
   * (Operador) Chama o próximo paciente da fila.
   */
  async callNext(unitId: string = 'default'): Promise<QueueActionResponse> {
    const response = await fetchClient<ApiResponse<QueueActionResponse>>(ENDPOINTS.CALL_NEXT, {
      method: 'POST',
      body: JSON.stringify({ unit_id: unitId }),
    });
    return response.data;
  },

  /**
   * (Operador) Finaliza o atendimento do paciente atual.
   */
  async finishCurrent(unitId: string = 'default'): Promise<QueueActionResponse> {
    const response = await fetchClient<ApiResponse<QueueActionResponse>>(ENDPOINTS.FINISH_CURRENT, {
      method: 'POST',
      body: JSON.stringify({ unit_id: unitId }),
    });
    return response.data;
  },
};
