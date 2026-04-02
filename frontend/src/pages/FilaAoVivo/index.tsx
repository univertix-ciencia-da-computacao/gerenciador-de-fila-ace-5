import { useEffect, useState } from 'react';
import { filaService } from '../../services/filaService';
import type { PacienteFila } from '../../api/types/fila';

export default function FilaAoVivo() {
  const [pacientes, setPacientes] = useState<PacienteFila[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('Todos');

  // 1. Carregar dados da API
  const carregarDados = async () => {
    try {
      setCarregando(true);
      const dados = await filaService.getFila();
      setPacientes(dados);
    } catch (error) {
      console.error("Erro ao carregar a fila:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const intervalo = setInterval(carregarDados, 30000); // Atualiza a cada 30s
    return () => clearInterval(intervalo);
  }, []);

  // 2. Função para Chamar Paciente
  const handleChamarPaciente = async (id: string) => {
    try {
      // Aqui você integrará com o endpoint de 'chamar' quando estiver pronto
      // Ex: await filaService.chamar(id);
      setPacientes(prev => prev.filter(p => p.id !== id));
      alert(`Paciente chamado com sucesso!`);
    } catch (error) {
      alert("Erro ao processar chamada.");
    }
  }

  // 3. Lógica de Filtro (Tratando a ausência do campo no Tipo oficial)
  const pacientesFiltrados = filtro === 'Todos'
    ? pacientes
    : pacientes.filter(p => (p as any).categoria === filtro);

  // 4. Cores baseadas no booleano de prioridade
  const getPriorityBadge = (isPrioritario: boolean) => {
    return isPrioritario 
      ? 'bg-amber-100 text-amber-700 border-amber-200' 
      : 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Fila ao Vivo</h1>
          <p className="text-gray-500 text-sm">Controle de chamadas e triagem em tempo real.</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            className="border border-gray-300 p-2 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="Todos">Todas as Categorias</option>
            <option value="Clínica Geral">Clínica Geral</option>
            <option value="Pediatria">Pediatria</option>
          </select>
          
          <button 
            onClick={carregarDados}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Atualizar"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Tabela de Pacientes */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {carregando ? (
          <div className="p-20 text-center text-gray-400">Buscando dados da fila...</div>
        ) : pacientesFiltrados.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Paciente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tipo de Atendimento</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pacientesFiltrados.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{p.nome}</div>
                    <div className="text-[10px] text-gray-400 font-mono">CPF: {p.cpf}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${getPriorityBadge(p.prioridade)}`}>
                      {p.prioridade ? '⚡ Prioritário' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 capitalize">
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleChamarPaciente(p.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95"
                    >
                      Chamar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center text-gray-400">
            Nenhum paciente aguardando nesta categoria.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
        <span>Pacientes na lista: {pacientesFiltrados.length}</span>
        <span>Última atualização: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}