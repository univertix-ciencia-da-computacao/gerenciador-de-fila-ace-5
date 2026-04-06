// base pra reutilizar em algumas interfaces
interface BaseIdentity {
  unit_id: string;
  ticket: string;
  status: 'waiting' | 'called' | 'finished';
  position_path: string;
}

//registro do paciente entrando na fila
export interface Entry extends BaseIdentity {
  person_name: string;
  priority: boolean;
  category: string;
  position_token: string;
  created_at?: string;
  called_at?: string | null;   
  finished_at?: string | null; 
}

export interface Position extends BaseIdentity {
  token: string; 
  position: number | null;
  people_ahead: number;
  current_ticket: string | null;
}

export interface Queue {
  unit_id: string;
  current_ticket: string | null;
  current_entry: Entry | null;      
  last_called: Entry[] | null;       
  waiting_count: number;
  // Usamos Pick para garantir que a lista da fila seja leve (sem tokens/paths pesados)
  queue: Pick<Entry, 'ticket' | 'person_name' | 'priority' | 'category' | 'status'>[];
}

//enviamos para o backend
export interface AddEntryRequest extends Pick<Entry, 'person_name' | 'unit_id' | 'priority' | 'category'> {}

//backend devolve
export interface AddEntryResponse {
  success: boolean;
  message: string;
  data: {
    entry: Entry;
    position: Position;
    queue: Queue;
  };
}