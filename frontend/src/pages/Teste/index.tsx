import { useFila } from '../../hooks/useFila';

export default function Teste() {
  // Busca os pacientes da fila via React Query → filaService → fetchClient
  const { data: pacientes, isLoading, isError } = useFila();

  // carregando
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Carregando fila...</p>
      </div>
    );
  }

  // erro na requisição
  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <p>Erro ao buscar dados. Verifique se o back-end está rodando.</p>
      </div>
    );
  }

  // sucesso
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Fila de Pacientes
      </h1>

      {/* Lista de pacientes retornados pela API */}
      {pacientes && pacientes.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {pacientes.map((paciente) => (
            <li
              key={paciente.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              {/* Exibe nome e status; ajuste os campos conforme a API do back-end */}
              <span className="font-semibold text-gray-700">{paciente.nome}</span>
              <span className="ml-3 text-sm text-gray-400">— {paciente.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">Nenhum paciente na fila no momento.</p>
      )}
    </div>
  );
}