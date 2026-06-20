export type QueueEntryStatus = 'waiting' | 'called' | 'finished';

export type RiskClassification =
  | 'emergencia'
  | 'muito_urgente'
  | 'urgente'
  | 'pouco_urgente'
  | 'nao_urgente';

export interface QueueEntrySummary {
  ticket: string;
  person_name: string;
  priority: boolean;
  category: string | null;
  risk_classification: RiskClassification;
  status: QueueEntryStatus;
}

export interface CurrentQueueEntry extends QueueEntrySummary {
  called_at: string | null;
}

export interface Entry extends QueueEntrySummary {
  unit_id: string;
  position_token: string;
  position_path: string;
  created_at: string;
  called_at: string | null;
  finished_at: string | null;
}

export interface Position {
  token: string;
  unit_id: string;
  ticket: string;
  person_name: string | null;
  category: string | null;
  risk_classification: RiskClassification;
  status: QueueEntryStatus;
  position: number | null;
  people_ahead: number | null;
  current_ticket: string | null;
  position_path: string;
}

export interface Queue {
  unit_id: string;
  current_ticket: string | null;
  current_entry: CurrentQueueEntry | null;
  last_called: string | null;
  waiting_count: number;
  queue: QueueEntrySummary[];
}

export interface AddEntryRequest {
  person_name: string;
  unit_id: string;
  priority: boolean;
  category: string | null;
  risk_classification: RiskClassification;
}

export interface AddEntryResponse {
  entry: Entry;
  position: Position;
  queue: Queue;
}

export interface QueueActionResponse {
  entry: Entry;
  queue: Queue;
}
