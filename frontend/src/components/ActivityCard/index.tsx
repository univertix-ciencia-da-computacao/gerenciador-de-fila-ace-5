import { User, Activity } from 'lucide-react';
import { type Entry, type NivelUrgencia } from '../../api/types/fila';
import type { JSX } from 'react';

interface ActivityCardProps {
  data: Entry;
}

export default function ActivityCard({ data }: ActivityCardProps) {
  
  // Define a cor de acordo com o que puxar do back
  const definirEstilo = (): { border: string; bg: string; text: string; badge: string; iconBg: string; icon: JSX.Element; label: NivelUrgencia } => {
    
    // Caso for prioridade trata como Urgencia e Emergia
    if (data.priority) {
      return { 
        border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', 
        badge: 'bg-red-100 text-red-700', iconBg: 'bg-red-200 text-red-600', 
        icon: <Activity size={20} />, label: 'Urgente' 
      };
    }

    // Se o status for 'called', da um destaque azul 
    if (data.status === 'called') {
        return { 
          border: 'border-blue-600', bg: 'bg-blue-50', text: 'text-blue-800', 
          badge: 'bg-blue-600 text-white', iconBg: 'bg-blue-200 text-blue-600', 
          icon: <Activity size={20} />, label: 'Chamado' 
        };
    }

    // Padrão
    return { 
      border: 'border-slate-300', bg: 'bg-white', text: 'text-slate-700', 
      badge: 'bg-slate-100 text-slate-600', iconBg: 'bg-slate-100 text-slate-500', 
      icon: <User size={20} />, label: 'Normal' 
    };
  };

  const estilos = definirEstilo();

  return (
    <div className={`flex items-center p-4 border-l-4 rounded-r-xl shadow-sm border ${estilos.border} ${estilos.bg} transition-all`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${estilos.iconBg}`}>
        {estilos.icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-slate-800 text-sm">{data.person_name}</h4>
            <span className="text-[10px] font-mono font-bold text-slate-400">{data.ticket}</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
            {data.category} • {new Date(data.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>
        <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${estilos.badge}`}>
          {estilos.label}
        </span>
      </div>
    </div>
  );
}