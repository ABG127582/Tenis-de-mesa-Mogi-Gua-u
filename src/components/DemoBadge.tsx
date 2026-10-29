import { Info } from 'lucide-react';

export default function DemoBadge({
  text = 'Ambiente de Testes da Equipe (Dados Pré-carregados)',
  minimal = false,
}: {
  text?: string;
  minimal?: boolean;
}) {
  if (minimal) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
        <Info className="w-3 h-3 text-slate-500" />
        {text}
      </span>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-800 shadow-2xs">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-slate-900">Plataforma Comunitária:</span>
        <span className="text-slate-600 hidden sm:inline">{text}</span>
        <span className="text-slate-600 sm:hidden">Mogi Guaçu</span>
      </div>
      <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
        Mogi Guaçu • SP
      </span>
    </div>
  );
}
