import { useQueueRealtime } from '../../hooks/useQueueRealtime';
import { RegisterForm } from './components/RegisterForm';
import { QueueList } from './components/QueueList';
import { QueueStatic } from './components/QueueStatic';
import { QueueActions } from './components/QueueActions';

export default function Register() {
    // Busca os dados da fila aqui no orquestrador
    const { data: queueData, isLoading, connectionStatus, socketError } = useQueueRealtime();

    return (
        // Layout principal em duas colunas
        <div className="flex gap-8 w-full max-w-screen-2xl mx-auto min-h-full font-sans">

            {/* COLUNA ESQUERDA: Formulário e Estatísticas */}
            <div className="flex-1 flex flex-col gap-6">

                <div>
                    <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Novo Cadastro de Paciente</h1>
                 <p className="text-slate-500 mt-1">Cadastre o Paciente</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        WebSocket: {connectionStatus}
                    </p>
                    {socketError && <p className="mt-1 text-sm text-red-600">{socketError}</p>}
                </div>

                {/* Componente especializado no formulário */}
                <RegisterForm />

                <QueueActions
                    hasWaiting={Boolean(queueData?.waiting_count)}
                    hasCurrent={Boolean(queueData?.current_entry)}
                    unitId={queueData?.unit_id ?? 'default'}
                />

                {/* Componente especializado nos cards de status */}
                <QueueStatic queueData={queueData} isLoading={isLoading} />

            </div>

            {/* COLUNA DIREITA: Atividade Recente */}
            <QueueList queueData={queueData} isLoading={isLoading} />

        </div>
    );
}
