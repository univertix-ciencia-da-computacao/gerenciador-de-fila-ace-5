import { useState } from 'react';
import { useFila } from '../../hooks/useFila';
import { filaService } from '../../services/filaService';
import { toast } from 'react-hot-toast';

import type { PacienteFila as Entry } from '../../api/types/fila'; 

export default function FilaAoVivo() {
  const [filtro, setFiltro] = useState('Todos');

  const { data: pacientes, isLoading } = useFila(); 

  const handleChamarPaciente = async () => {
    try {
      console.log("Chamando próximo...");
      toast.success("Próximo paciente chamado!");
    } catch (error) {
      toast.error("Erro ao processar chamada.");
    }
  };

  const pacientesFiltrados = !pacientes 
    ? [] 
    : filtro === 'Todos'
      ? pacientes
      : pacientes.filter((p: Entry) => (p as any).category === filtro);

  const getPriorityBadge = (isPrioritario: boolean) => {
    return isPrioritario 
      ? 'bg-amber-100 text-amber-700 border-amber-200' 
      : 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans text-left">Fila ao Vivo</h1>
          <p className="text-gray-500 text-sm font-sans text-left">Painel de chamadas oficial.</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            className="border border-gray-300 p-2 rounded-lg bg-white shadow-sm text-sm outline-none font-sans"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="Todos">Todas as Categorias</option>
            <option value="Clínica Geral">Clínica Geral</option>
            <option value="Pediatria">Pediatria</option>
          </select>
          
          <button 
            onClick={handleChamarPaciente}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-all font-sans"
          >
            Chamar Próximo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden font-sans">
        {isLoading ? (
          <div className="p-20 text-center text-gray-400">Carregando dados...</div>
        ) : pacientesFiltrados.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioridade</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pacientesFiltrados.map((p: Entry) => (
                <tr key={p.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-6 py-4 text-left">
                    {/* Fallback para person_name ou nome */}
                    <div className="text-sm font-bold text-gray-900">{(p as any).person_name || (p as any).nome}</div>
                    <div className="text-[10px] text-gray-400 font-mono italic">ID: {p.id}</div>
                  </td>
                  <td className="px-6 py-4 text-left whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${getPriorityBadge(p.prioridade)}`}>
                      {p.prioridade ? '⚡ Prioritário' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-left whitespace-nowrap">
                    <span className="text-sm text-gray-600 capitalize">
                      {p.status?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center text-gray-400 font-medium font-sans">
            Nenhum registro encontrado na fila.
          </div>
        )}
      </div>
    </div>
  );
}