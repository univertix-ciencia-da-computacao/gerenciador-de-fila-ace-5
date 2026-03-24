export interface PacienteFila {
//mudar de acordo com API do back-end
  id: string;
  nome: string;
  cpf: string;
  prioridade: boolean; // Atendimento prioritário (idosos, gestantes, etc.) - qualquer coisa remove de acordo com os endpoints
  status: 'aguardando' | 'em_atendimento' | 'finalizado';
  dataEntrada: string;
}