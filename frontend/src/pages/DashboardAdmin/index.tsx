import { useQueue } from '../../hooks/useQueue';
import { RegisterForm } from './components/RegisterForm';
import { QueueList } from './components/QueueList';
import { QueueStatic } from './components/QueueStatic';

export default function Register() {
    // Busca os dados da fila aqui no orquestrador
    const { data: queueData, isLoading } = useQueue();

    return (
        // Layout principal em duas colunas
        <div className="flex gap-8 w-full max-w-screen-2xl mx-auto min-h-full font-sans">

            {/* COLUNA ESQUERDA: Formulário e Estatísticas */}
            <div className="flex-1 flex flex-col gap-6">

                <div>
                    <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Novo Cadastro de Paciente</h1>
                    <p className="text-slate-500 mt-1">Cadastre o Paciente</p>
                </div>

                {/* Componente especializado no formulário */}
                <RegisterForm />

                {/* Componente especializado nos cards de status */}
                <QueueStatic queueData={queueData} isLoading={isLoading} />

            </div>

            {/* COLUNA DIREITA: Atividade Recente */}
            <QueueList queueData={queueData} isLoading={isLoading} />

        </div>
    );
}