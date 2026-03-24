import { useQuery } from '@tanstack/react-query';
import { filaService } from '../services/filaService';

export function useFila() {
  return useQuery({
    queryKey: ['fila-pacientes'], // Chave única para o cache dessa requisição
    queryFn: filaService.getFila,
  });
}