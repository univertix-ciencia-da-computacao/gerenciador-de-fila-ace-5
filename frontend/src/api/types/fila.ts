// Baseado na doc do Pedro
export interface Entry {
  ticket: string;
  person_name: string;
  unit_id: string;
  priority: boolean;      // true = Urgente/Emergência, false = Normal
  category: string;      // ex: "clinico-geral"
  status: 'waiting' | 'called' | 'finished';
  created_at: string;    // Usado para o "tempoAtras"
  position_token: string;
}

// UI para o Card 
export type NivelUrgencia = 'Normal' | 'Urgente' | 'Emergência' | 'Chamado' | 'Finalizado';