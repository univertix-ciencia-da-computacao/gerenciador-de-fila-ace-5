import { User, AlertTriangle, Activity } from 'lucide-react';

export type NivelUrgencia = 'Normal' | 'Urgente' | 'Emergência';

interface ActivityCardProps {
  nome: string;
  categoria: string;
  tempoAtras: string;
  urgencia: NivelUrgencia;
}

export default function ActivityCard({ nome, categoria, tempoAtras, urgencia }: ActivityCardProps) {
  const getEstiloUrgencia = (nivel: NivelUrgencia) => {
    switch (nivel) {
      case 'Emergência': return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700', iconBg: 'bg-red-200 text-red-600', icon: <Activity size={20} /> };
      case 'Urgente': return { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', iconBg: 'bg-orange-200 text-orange-600', icon: <AlertTriangle size={20} /> };
      case 'Normal': return { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', iconBg: 'bg-blue-200 text-blue-600', icon: <User size={20} /> };
    }
  };

  const estilos = getEstiloUrgencia(urgencia);

  return (
    <div className={`flex items-center p-4 bg-white border-l-4 rounded-r-xl shadow-sm border ${estilos.border} ${estilos.bg}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${estilos.iconBg}`}>
        {estilos.icon}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-slate-800 text-sm">{nome}</h4>
        <p className="text-xs text-slate-500 font-medium">{categoria} • {tempoAtras}</p>
        <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${estilos.badge}`}>
          {urgencia}
        </span>
      </div>
    </div>
  );
}