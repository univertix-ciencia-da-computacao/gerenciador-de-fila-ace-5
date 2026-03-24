import React, { useState } from 'react';
import { PlusCircle, User } from 'lucide-react';
import ActivityCard from '@/components/ActivityCard';
import { type Entry } from '@/api/types/fila'; 

type Categoria = 'clinico-geral' | 'cardiologia' | 'ortopedia';

export default function TelaInicial() {
  const [nome, setNome] = useState('');
  const [urgencia, setUrgencia] = useState<boolean>(false); // Prioridade é Booleana
  const [categoria, setCategoria] = useState<Categoria>('clinico-geral');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Objeto que a doc pede
    const payload = {
      person_name: nome,
      unit_id: "default", 
      priority: urgencia,  
      category: categoria
    };

    console.log('Enviando para POST /api/v1/queue/entries:', payload);
    
    // Resetando os campos
    setNome('');
    setUrgencia(false);
  };

  // Mock demonstrativo, ainda tenho que alterar a partir do momento que ouver dados reais
  const atividadesMock: Entry[] = [
    { 
      ticket: 'A001', 
      person_name: 'Elena Rodriguez', 
      unit_id: 'default', 
      category: 'Cardiologia', 
      created_at: new Date().toISOString(), 
      priority: true, 
      status: 'waiting',
      position_token: 'tok1'
    },
    { 
      ticket: 'B004', 
      person_name: 'Marcus Sterling', 
      unit_id: 'default', 
      category: 'Clínica Geral', 
      created_at: new Date().toISOString(), 
      priority: false, 
      status: 'called', 
      position_token: 'tok2'
    },
  ];

  return (
    <div className="p-8 pt-4 flex flex-col xl:flex-row gap-8">
      <div className="flex-1 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Novo Cadastro de Paciente</h1>
          <p className="text-slate-500">Sistema PSF Central</p>
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
                value={urgencia ? "Sim" : "Não"}
                onChange={(e) => setUrgencia(e.target.value === "Sim")}
                className="w-full px-4 py-3.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none text-slate-700 font-medium transition-all"
              >
                <option value="Não">Normal</option>
                <option value="Sim">Prioritário (Urgente/Emergência)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">Categoria</label>
              <select 
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as Categoria)}
                className="w-full px-4 py-3.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none text-slate-700 font-medium transition-all"
              >
                {/*Puxar as categoria do banco de dados*/}
                <option value="clinico-geral">Clínica Geral</option>
                <option value="cardiologia">Cardiologia</option>
                <option value="ortopedia">Ortopedia</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#0A439E] hover:bg-blue-900 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md">
            <PlusCircle size={20} />
            Adicionar à Fila
          </button>
        </form>

        <div className="flex gap-6">
          {/* Card: Total de pessoas aguardando */}
          <div className="flex-1 bg-orange-50/50 p-6 rounded-2xl border border-orange-100 flex flex-col justify-center transition-all hover:shadow-md">
            <p className="text-xs font-bold text-orange-800 mb-1 uppercase tracking-wide">Na Fila</p>
            {/* O valor '14' virá do 'waiting_count' da API/WebSocket futuramente */}
            <p className="text-4xl font-extrabold text-orange-900">14</p>
          </div>

          {/* Card: Última senha chamada ou painel atual */}
          <div className="flex-1 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col justify-center transition-all hover:shadow-md">
            <p className="text-xs font-bold text-blue-800 mb-1 uppercase tracking-wide">Último Chamado</p>
            {/* O valor 'B-04' virá do 'current_ticket' da API */}
            <p className="text-4xl font-extrabold text-blue-900">A-001</p>
          </div>
        </div>
      </div>

      <div className="w-full xl:w-96 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-[fit-content]">
        <h3 className="font-bold text-blue-900 text-lg mb-6">Atividade Recente</h3>

        <div className="flex-1 space-y-4">
          {atividadesMock.map((atividade) => (
            // Jogando o objeto INTEIRO no card
            <ActivityCard key={atividade.ticket} data={atividade} />
          ))}
        </div>
      </div>
    </div>
  );
}