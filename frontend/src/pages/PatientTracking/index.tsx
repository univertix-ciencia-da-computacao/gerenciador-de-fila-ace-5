import { useParams } from 'react-router-dom';
import { Activity, Radio } from 'lucide-react';

import { usePositionRealtime } from '../../hooks/usePositionRealtime';

function statusLabel(status: string) {
  if (status === 'called') return 'Senha chamada';
  if (status === 'finished') return 'Atendimento finalizado';
  return 'Aguardando chamada';
}

export default function PatientTracking() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, isError, connectionStatus, socketError } = usePositionRealtime(token);

  if (!token) {
    return <div className="p-8 text-center text-red-600">Link de acompanhamento inválido.</div>;
  }

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-8 text-slate-900">
      <main className="mx-auto flex max-w-md flex-col gap-5">
        <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700">
          <Radio className="h-4 w-4" />
          WebSocket: {connectionStatus}
        </div>

        <section className="rounded-[2rem] bg-white p-8 text-center shadow-xl">
          <Activity className="mx-auto h-10 w-10 text-blue-700" />
          <p className="mt-5 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Sua senha</p>
          <h1 className="mt-3 text-7xl font-black text-blue-900">{isLoading ? '...' : data?.ticket ?? '--'}</h1>
          <p className="mt-4 text-xl font-bold text-slate-700">{data ? statusLabel(data.status) : 'Carregando...'}</p>
          <p className="mt-2 text-sm text-slate-500">{data?.person_name ?? 'Paciente'}</p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Posição</p>
            <strong className="mt-2 block text-4xl font-black text-blue-900">{data?.position ?? '--'}</strong>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">À frente</p>
            <strong className="mt-2 block text-4xl font-black text-blue-900">{data?.people_ahead ?? '--'}</strong>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Classificação de risco</p>
          <p className="mt-2 text-lg font-black capitalize text-slate-800">{data?.risk_classification.replace(/_/g, ' ') ?? '--'}</p>
          <p className="mt-1 text-sm text-slate-500">Senha atual: {data?.current_ticket ?? '--'}</p>
        </section>

        {(socketError || isError) && (
          <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">
            {socketError ?? 'Não foi possível carregar sua posição.'}
          </p>
        )}
      </main>
    </div>
  );
}
