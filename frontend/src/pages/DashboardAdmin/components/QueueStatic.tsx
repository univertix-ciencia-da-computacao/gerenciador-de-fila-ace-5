import type { Queue } from '../../../api/types/queue';

//não precisa colocar em types, é apenas visual nao comunica com backend
interface EstatisticasFilaProps {
  queueData: Queue | undefined;
  isLoading: boolean;
}

export function QueueStatic({ queueData, isLoading }: EstatisticasFilaProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Aguardando na Fila</h3>
        <p className="text-4xl font-extrabold text-orange-600">
          {isLoading ? '...' : queueData?.waiting_count || 0}
        </p>
      </div>
      <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Unidade Ativa</h3>
        <p className="text-3xl font-extrabold text-blue-600 truncate" title={queueData?.unit_id}>
          {isLoading ? '...' : queueData?.unit_id || '---'}
        </p>
      </div>
    </div>
  );
}