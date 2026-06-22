import { useQueue } from '../../hooks/useQueue';
import { RegisterForm } from './components/RegisterForm';
import { QueueList } from './components/QueueList';
import { QueueStatic } from './components/QueueStatic';

export default function Register() {
  const { data: queueData, isLoading } = useQueue();

  return (
    // MUDANÇA: era "flex gap-8", agora é flex-col no mobile e flex-row no lg+
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-screen-2xl mx-auto min-h-full font-sans">

      {/* COLUNA ESQUERDA: Formulário e Estatísticas */}
      {/* MUDANÇA: era "flex-1", agora limita largura no desktop para não esticar demais */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight">
            Novo Cadastro de Paciente
          </h1>
          <p className="text-slate-500 mt-1">Cadastre o Paciente</p>
        </div>

        <RegisterForm />
        <QueueStatic queueData={queueData} isLoading={isLoading} />
      </div>

      {/* COLUNA DIREITA: Atividade Recente */}
      {/* MUDANÇA: era "w-80 flex-shrink-0", agora ocupa largura total no mobile */}
      <div className="w-full lg:w-80 lg:flex-shrink-0">
        <QueueList queueData={queueData} isLoading={isLoading} />
      </div>

    </div>
  );
}