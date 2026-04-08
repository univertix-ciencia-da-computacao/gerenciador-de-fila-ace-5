import type { Queue } from '../../../api/types/queue';
import { Clock, User, AlertTriangle } from 'lucide-react';

//não precisa colocar em types, é apenas visual nao comunica com backend
interface FilaListaProps {
  queueData: Queue | undefined;
  isLoading: boolean;
}

// Mapeia prioridade para estilo visual
const getPriorityStyle = (priority: boolean) => {
  if (priority) {
    return {
      borderLeft: 'border-l-orange-400',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500',
      badgeBg: 'bg-orange-100 text-orange-600',
      label: 'URGENTE',
      Icon: AlertTriangle,
    };
  }
  return {
    borderLeft: 'border-l-blue-400',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    badgeBg: 'bg-blue-100 text-blue-700',
    label: 'NORMAL',
    Icon: User,
  };
};

export function QueueList({ queueData, isLoading }: FilaListaProps) {
  return (
    <div className="w-80 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800">Atividade Recente</h2>
        <Clock className="w-4 h-4 text-slate-400" />
      </div>

      {/* Lista de pacientes */}
      <div className="flex flex-col gap-3 overflow-y-auto flex-1 p-4 max-h-[calc(100vh-340px)]">
        {isLoading && <p className="text-slate-500 text-sm">Carregando...</p>}

        {queueData?.queue && queueData.queue.length === 0 && (
          <p className="text-slate-500 text-sm italic">Nenhum paciente aguardando.</p>
        )}

        {queueData?.queue?.map((entry) => {
          const style = getPriorityStyle(entry.priority);
          const { Icon } = style;
          return (
            <div
              key={entry.ticket}
              className={`flex items-center gap-3 p-3 rounded-xl border border-slate-100 border-l-4 bg-white ${style.borderLeft}`}
            >
              {/* Ícone colorido */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg}`}>
                <Icon className={`w-5 h-5 ${style.iconColor}`} />
              </div>

              {/* Informações */}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-slate-800 text-sm truncate" title={entry.person_name}>
                  {entry.person_name}
                </span>
                <span className="text-xs text-slate-500 capitalize mb-1">
                  {entry.category.replace(/-/g, ' ')} • #{entry.ticket}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md w-fit ${style.badgeBg}`}>
                  {style.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rodapé */}
      <div className="px-5 py-3 border-t border-slate-100">
        <button className="w-full text-blue-700 hover:text-blue-900 text-sm font-semibold transition-colors text-center">
          Ver Histórico Completo
        </button>
      </div>
    </div>
  );
}
