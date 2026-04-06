import React, { useEffect, useMemo, useRef, useState } from 'react';
// Importando o seu novo hook!
import { useQueue } from '../../hooks/useQueue';

// Função que dispara o som do alerta (Estilo Ding-Dong clássico)
const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playNote = (frequencia: number, tempoInicio: number, duracao: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'triangle'; 
      oscillator.frequency.value = frequencia;

      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + tempoInicio);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + tempoInicio + duracao);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime + tempoInicio);
      oscillator.stop(audioCtx.currentTime + tempoInicio + duracao);
    };

    playNote(880, 0, 0.6); 
    playNote(659, 0.4, 1.2); 

    setTimeout(() => audioCtx.close(), 2000);
  } catch (error) {
    console.warn('Som não disponível:', error);
  }
};

const DashboardTv: React.FC = () => {
  const [painelIniciado, setPainelIniciado] = useState(false);
  
  // Utilizando o seu novo hook useQueue
  const { data, isLoading, isError } = useQueue();
  const previousCurrentId = useRef<string | null>(null);


// 🛡️ Proteção Inteligente ajustada para o TypeScript:
  const listaPacientes = useMemo(() => {
    if (!data) return [];
        if (Array.isArray(data)) return data;
            const dadosSeguros = data as any;
            
    return dadosSeguros.entries || dadosSeguros.pacientes || dadosSeguros.items || [];
  }, [data]);

  const filaOrdenada = useMemo(() => {
    if (!listaPacientes.length) return [];
    return [...listaPacientes].sort((a, b) => new Date(a.dataEntrada).getTime() - new Date(b.dataEntrada).getTime());
  }, [listaPacientes]);

  const current = useMemo(() => {
    if (!filaOrdenada.length) return null;
    const emAtendimento = filaOrdenada.find((item) => item.status === 'em_atendimento');
    return emAtendimento || filaOrdenada.find((item) => item.status === 'aguardando') || null;
  }, [filaOrdenada]);

  const ultimasChamadas = useMemo(() => {
    if (!filaOrdenada.length) return [];
    return [...filaOrdenada]
      .filter((item) => item.status !== 'aguardando')
      .sort((a, b) => new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime())
      .slice(0, 4);
  }, [filaOrdenada]);

  useEffect(() => {
    if (!current || !painelIniciado) return;
    if (previousCurrentId.current && previousCurrentId.current !== current.id) {
      playBeep();
    }
    previousCurrentId.current = current.id;
  }, [current, painelIniciado]);

  if (!painelIniciado) {
    return (
      <div className="h-screen w-screen bg-blue-600 flex items-center justify-center">
        <button
          onClick={() => {
            setPainelIniciado(true);
            playBeep();
          }}
          className="bg-white text-blue-600 text-3xl font-bold px-12 py-8 rounded-lg hover:bg-blue-50 transition shadow-lg"
        >
          ▶ Iniciar Painel
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-blue-600 text-white overflow-hidden">
      {/* Grid: esquerda e direita */}
      <div className="grid grid-cols-2 h-full gap-4 p-4">
        {/* ===== ESQUERDA: CONSULTÓRIO + ÚLTIMAS CHAMADAS ===== */}
        <div className="flex flex-col gap-4">
          {/* Consultório número (gigante) */}
          <div className="bg-white rounded-lg p-6 flex flex-col flex-shrink-0 shadow-md">
            <p className="text-blue-500 text-sm font-bold uppercase">Consultório</p>
            <p className="text-blue-600 text-8xl font-black">04</p>
          </div>

          {/* Últimas Chamadas */}
          <div className="bg-white rounded-lg p-4 flex-1 overflow-hidden shadow-md">
            <p className="text-blue-500 text-xs font-bold uppercase mb-3">Últimas Chamadas</p>
            <div className="space-y-2 overflow-y-auto max-h-96">
              {isLoading ? (
                <p className="text-gray-400 text-sm">Carregando...</p>
              ) : isError ? (
                <p className="text-red-500 text-sm">Erro na conexão</p>
              ) : ultimasChamadas.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhuma chamada</p>
              ) : (
                ultimasChamadas.map((item, idx) => (
                  <div key={item.id} className="bg-blue-50 p-2 rounded text-blue-900 text-sm font-semibold border border-blue-100">
                    {idx + 1}. {item.nome}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ===== DIREITA: PACIENTE ATUAL ===== */}
        <div className="flex flex-col gap-4">
          {/* Paciente em Atendimento */}
          <div className="bg-white rounded-lg p-6 flex flex-col justify-center flex-1 min-h-0 shadow-md">
            <p className="text-blue-500 text-sm font-bold uppercase mb-4">Paciente</p>
            <p className="text-blue-600 text-6xl font-black text-center break-words leading-tight">
              {current?.nome || '-'}
            </p>
          </div>

          {/* Consultório destino */}
          <div className="bg-blue-800 rounded-lg p-6 text-center flex-shrink-0 shadow-md">
            <p className="text-white text-2xl font-black">PSF CENTRO</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTv;