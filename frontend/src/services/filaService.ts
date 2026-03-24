import { fetchClient } from '../api/client';
import type { PacienteFila } from '../api/types/fila';

export const filaService = {
  // Retorna todos os pacientes (ALL)
  getFila: () => fetchClient<PacienteFila[]>('/fila'),

  // Adicionar alguém na fila
  adicionarPaciente: (dados: Omit<PacienteFila, 'id' | 'status' | 'dataEntrada'>) =>
    fetchClient<PacienteFila>('/fila', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),
};