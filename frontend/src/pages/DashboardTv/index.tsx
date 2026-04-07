import React, { useEffect, useRef, useState } from 'react';
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
  
  const { data, isLoading, isError } = useQueue('default', { 
    refetchInterval: 5000 
  });

  const previousTicket = useRef<string | null>(null);

  const currentEntry = data?.current_entry;
  const history = data?.last_called || [];

  useEffect(() => {
    if (!currentEntry || !painelIniciado) return;

    if (previousTicket.current && previousTicket.current !== currentEntry.ticket) {
      playBeep();
    }
    
    previousTicket.current = currentEntry.ticket;
  }, [currentEntry, painelIniciado]);

  if (!painelIniciado) {
    return (
      <div className="h-screen w-screen bg-blue-600 flex items-center justify-center">
        <button
          onClick={() => {
            setPainelIniciado(true);
            playBeep();
          }}
          className="bg-white text-blue-600 text-3xl font-bold px-12 py-8 rounded-lg hover:bg-blue-50 transition shadow-lg active:scale-95"
        >
          ▶ Iniciar Painel
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-blue-600 text-white overflow-hidden">
      <div className="grid grid-cols-2 h-full gap-4 p-4">
        {/* ===== ESQUERDA: CONSULTÓRIO + ÚLTIMAS CHAMADAS ===== */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-lg p-6 flex flex-col flex-shrink-0 shadow-md">
            <p className="text-blue-500 text-sm font-bold uppercase">Consultório</p>
            <p className="text-blue-600 text-8xl font-black">04</p>
          </div>

          <div className="bg-white rounded-lg p-4 flex-1 overflow-hidden shadow-md">
            <p className="text-blue-500 text-xs font-bold uppercase mb-3">Últimas Chamadas</p>
            <div className="space-y-2 overflow-y-auto max-h-96">
              {isLoading ? (
                <p className="text-gray-400 text-sm">Carregando...</p>
              ) : isError ? (
                <p className="text-red-500 text-sm">Erro na conexão</p>
              ) : history.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhuma chamada</p>
              ) : (
                history.map((item, idx) => (
                  <div key={item.ticket} className="bg-blue-50 p-2 rounded text-blue-900 text-sm font-semibold border border-blue-100 flex justify-between">
                    <span>{idx + 1}. {item.person_name}</span>
                    <span className="text-blue-400">{item.ticket}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ===== DIREITA: PACIENTE ATUAL ===== */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-lg p-6 flex flex-col justify-center flex-1 min-h-0 shadow-md">
            <p className="text-blue-500 text-sm font-bold uppercase mb-4">Paciente</p>
            <p className="text-blue-600 text-6xl font-black text-center break-words leading-tight">
              {currentEntry?.person_name || '-'}
            </p>
            {currentEntry?.ticket && (
              <p className="text-center text-amber-500 text-2xl font-bold mt-4">
                SENHA: {currentEntry.ticket}
              </p>
            )}
          </div>

          <div className="bg-blue-800 rounded-lg p-6 text-center flex-shrink-0 shadow-md">
            <p className="text-white text-2xl font-black">
              {data?.unit_id || 'PSF CENTRO'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTv;
