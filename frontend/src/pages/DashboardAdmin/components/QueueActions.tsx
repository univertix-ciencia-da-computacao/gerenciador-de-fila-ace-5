import { CheckCircle2, Megaphone } from 'lucide-react';

import { useCallNext, useFinishCurrent } from '../../../hooks/useQueue';

interface QueueActionsProps {
  unitId?: string;
  hasWaiting: boolean;
  hasCurrent: boolean;
}

export function QueueActions({ unitId = 'default', hasWaiting, hasCurrent }: QueueActionsProps) {
  const callNext = useCallNext(unitId);
  const finishCurrent = useFinishCurrent(unitId);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="button"
        disabled={!hasWaiting || callNext.isPending}
        onClick={() => callNext.mutate()}
        className="flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 font-bold text-white shadow-md transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <Megaphone className="h-5 w-5" />
        {callNext.isPending ? 'Chamando...' : 'Chamar próximo'}
      </button>

      <button
        type="button"
        disabled={!hasCurrent || finishCurrent.isPending}
        onClick={() => finishCurrent.mutate()}
        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white shadow-md transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <CheckCircle2 className="h-5 w-5" />
        {finishCurrent.isPending ? 'Finalizando...' : 'Finalizar atual'}
      </button>
    </div>
  );
}
