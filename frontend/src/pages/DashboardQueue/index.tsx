import { Monitor, Radio } from 'lucide-react';

import { useQueueRealtime } from '../../hooks/useQueueRealtime';

export default function DashboardQueue() {
  const { data, isLoading, connectionStatus, socketError } = useQueueRealtime();
  const current = data?.current_entry;

  return (
    <div className="flex min-h-full flex-col gap-6 bg-slate-950 p-8 text-white">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor className="h-8 w-8 text-cyan-300" />
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wide">Painel de chamada</h1>
            <p className="text-sm text-slate-400">Atualização em tempo real via WebSocket</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold uppercase text-cyan-200">
          <Radio className="h-4 w-4" />
          {connectionStatus}
        </div>
      </header>

      {socketError && <p className="rounded-xl bg-red-950 px-4 py-3 text-red-100">{socketError}</p>}

      <main className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="flex flex-col justify-center rounded-[2rem] bg-gradient-to-br from-blue-700 to-cyan-500 p-10 shadow-2xl">
          <p className="text-lg font-bold uppercase tracking-[0.3em] text-blue-100">Senha atual</p>
          <strong className="mt-6 text-[8rem] font-black leading-none tracking-tight">
            {isLoading ? '...' : data?.current_ticket ?? '--'}
          </strong>
          <p className="mt-6 text-3xl font-bold">{current?.person_name ?? 'Aguardando próxima chamada'}</p>
          <p className="mt-2 text-xl text-blue-100">{current?.category?.replace(/-/g, ' ') ?? 'Sem atendimento em curso'}</p>
        </section>

        <section className="rounded-[2rem] bg-white/10 p-6 backdrop-blur">
          <h2 className="text-xl font-black uppercase tracking-wide text-slate-200">Próximos</h2>
          <div className="mt-5 flex flex-col gap-3">
            {data?.queue.slice(0, 6).map((entry) => (
              <div key={entry.ticket} className="flex items-center justify-between rounded-2xl bg-white/10 px-5 py-4">
                <span className="text-2xl font-black">{entry.ticket}</span>
                <span className="text-right text-sm font-semibold text-slate-200">{entry.risk_classification.replace(/_/g, ' ')}</span>
              </div>
            ))}
            {!isLoading && data?.queue.length === 0 && <p className="text-slate-400">Nenhum paciente aguardando.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
