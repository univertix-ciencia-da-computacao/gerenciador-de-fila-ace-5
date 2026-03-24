import React, { useState } from 'react';
import { PlusCircle, User, Clock } from 'lucide-react';
import ActivityCard, { type NivelUrgencia } from '@/components/ActivityCard';

type Categoria = 'Clínica Geral' | 'Cardiologia' | 'Ortopedia';

export default function TelaInicial() {
  const [nome, setNome] = useState('');
  const [urgencia, setUrgencia] = useState<NivelUrgencia>('Normal');
  const [categoria, setCategoria] = useState<Categoria>('Clínica Geral');

  //Vai ter coisa aqui: 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
  // Boa sorte galera do back

    console.log('Enviando para a API:', { nome, urgencia, categoria });
    setNome(''); 
  };

  // Fazer com que a lista via useEffect busque no Websocket e retone a fila
  const atividadesMock = [
    { id: '1', nome: 'Elena Rodriguez', categoria: 'Cardiologia', tempoAtras: '2m atrás', urgencia: 'Emergência' as NivelUrgencia },
    { id: '2', nome: 'Marcus Sterling', categoria: 'Clínica Geral', tempoAtras: '14m atrás', urgencia: 'Normal' as NivelUrgencia },
    { id: '3', nome: 'Jonathan Wu', categoria: 'Ortopedia', tempoAtras: '35m atrás', urgencia: 'Urgente' as NivelUrgencia },
  ];

  return (
    <div className="p-8 pt-4 flex flex-col xl:flex-row gap-8">
      
      <div className="flex-1 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Novo Cadastro de Paciente</h1>
          <p className="text-slate-500">Cadastre o Paciente</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="mb-6">
            <label className="block text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">Nome do Paciente</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome completo" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400 font-medium"
                required
              />
            </div>
          </div>

          <div className="flex gap-6 mb-8">
            <div className="flex-1">
              <label className="block text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">Nível de Urgência</label>
              <select 
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value as NivelUrgencia)}
                className="w-full px-4 py-3.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none text-slate-700 font-medium transition-all"
              >
                <option value="Normal">Normal</option>
                <option value="Urgente">Urgente</option>
                <option value="Emergência">Emergência</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">Categoria / Especialidade</label>
              <select 
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as Categoria)}
                className="w-full px-4 py-3.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none text-slate-700 font-medium transition-all"
              >
                {/*Puxar as categoria do banco */}
                <option value="Clínica Geral">Clínica Geral</option>
                <option value="Cardiologia">Cardiologia</option>
                <option value="Ortopedia">Ortopedia</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#0A439E] hover:bg-blue-900 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md">
            <PlusCircle size={20} />
            Adicionar à Fila
          </button>
        </form>

        <div className="flex gap-6">
          <div className="flex-1 bg-orange-50/50 p-6 rounded-2xl border border-orange-100 flex flex-col justify-center">
            <p className="text-xs font-bold text-orange-800 mb-1 uppercase tracking-wide">Na Fila</p>
            {/* Implementar contagem de fila */}
            <p className="text-4xl font-extrabold text-orange-900">14</p>
          </div>
          <div className="flex-1 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col justify-center">
            <p className="text-xs font-bold text-blue-800 mb-1 uppercase tracking-wide">Ala Ativa</p>
            <p className="text-4xl font-extrabold text-blue-900">B-04</p>
          </div>
        </div>
      </div>

      <div className="w-full xl:w-96 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-[fit-content]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-blue-900 text-lg">Atividade Recente</h3>
          <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <Clock size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 space-y-4">
          {atividadesMock.map((atividade) => (
            <ActivityCard 
              key={atividade.id}
              nome={atividade.nome}
              categoria={atividade.categoria}
              tempoAtras={atividade.tempoAtras}
              urgencia={atividade.urgencia}
            />
          ))}
        </div>

        <button className="w-full py-3.5 mt-6 text-blue-700 font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          Ver Histórico Completo
        </button>
      </div>

    </div>
  );
}