import type { Queue } from '../../../api/types/queue';

//não precisa colocar em types, é apenas visual nao comunica com backend
interface FilaListaProps {
  queueData: Queue | undefined;
  isLoading: boolean;
}

export function QueueList({ queueData, isLoading }: FilaListaProps) {
  return (
    <div className="w-96 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-slate-800 mb-2">Fila de Atendimento (Hoje)</h2>

      <div className="flex flex-col gap-4 overflow-y-auto h-[calc(100vh-180px)] pr-2">
        {isLoading && <p className="text-slate-500 text-sm">Carregando fila...</p>}
        
        {queueData?.queue && queueData.queue.length === 0 && (
          <p className="text-slate-500 text-sm italic bg-white p-4 rounded-lg border">Nenhum paciente aguardando.</p>
        )}

        {queueData?.queue?.map((entry) => (
          <div key={entry.ticket} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4 items-center">
            <div className={`w-14 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 ${
              entry.priority ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <span className="text-base font-extrabold">{entry.ticket}</span>
            </div>
            <div className="flex flex-col flex-1 truncate">
              <span className="font-bold text-slate-800 truncate" title={entry.person_name}>
                {entry.person_name}
              </span>
              <span className="text-xs text-slate-500 mb-2 capitalize">{entry.category.replace('-', ' ')}</span>
              <div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                  entry.priority ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {entry.priority ? 'Urgente' : 'Normal'}
                </span>
              </div>
            </div>
          </div>
         ))}
      </div>
    </div>
  );
}