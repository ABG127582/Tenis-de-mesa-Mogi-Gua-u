import React from 'react';
import { Calendar, Trophy, ChevronRight, MapPin, Activity, Flame, Shield, ArrowUpRight } from 'lucide-react';

interface MatchcenterStripProps {
  onNavigate: (tabId: string) => void;
}

export default function MatchcenterStrip({ onNavigate }: MatchcenterStripProps) {
  return (
    <section className="bg-slate-900 rounded-3xl p-5 sm:p-6 text-white border border-slate-800 shadow-xl overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar inspired by Borussia Düsseldorf Matchcenter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[11px] font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Matchcenter Mogi Guaçu
          </div>
          <span className="text-xs font-semibold text-slate-400 hidden md:inline">
            Estrutura Oficial de Competições & Liga Regional
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('placar')}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
          >
            Placar Eletrônico de Mesa <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <button
            onClick={() => onNavigate('agenda')}
            className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            Calendário Geral <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3 Columns inspired by Borussia Düsseldorf: Next Match, Latest Result, League Standing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Next Match (Nächstes Spiel) */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex flex-col justify-between hover:border-orange-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Próximo Confronto
              </span>
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[10px]">Copa SP</span>
            </div>

            <div className="space-y-2 my-2">
              <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50">
                <span className="text-xs font-black text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  CERESC Mogi Guaçu
                </span>
                <span className="text-xs font-bold text-slate-400">MANDANTE</span>
              </div>

              <div className="text-center font-black text-xs text-slate-400 py-0.5">VS</div>

              <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50">
                <span className="text-xs font-black text-slate-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  Piracicaba T.M.
                </span>
                <span className="text-xs font-bold text-slate-400">VISITANTE</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <MapPin className="w-3 h-3 text-red-400" /> Ginásio CERESC
            </span>
            <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
              Sáb • 09:00
            </span>
          </div>
        </div>

        {/* 2. Latest Result (Letztes Spiel) */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Último Resultado
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">Finalizado</span>
            </div>

            <div className="my-2 bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 text-center">
              <div className="text-[11px] text-slate-400 font-medium mb-1">Liga Regional Paulista • Rodada 4</div>
              <div className="flex items-center justify-center gap-4 my-1">
                <div className="text-right">
                  <div className="text-xs font-black text-white">Mogi Guaçu</div>
                  <div className="text-[10px] text-slate-400">Equipe Principal</div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-lg font-black text-emerald-300 font-mono">
                  3 : 1
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-slate-300">Itapira T.M.</div>
                  <div className="text-[10px] text-slate-400">Regional Leste</div>
                </div>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-2">
                Vitória confirmada • Destaque: Carlos Silva & Prof. Max
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Súmula oficial registrada</span>
            <button
              onClick={() => onNavigate('agenda')}
              className="font-bold text-slate-200 hover:text-white flex items-center gap-1"
            >
              Ver Detalhes <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 3. League Standing / Table (Tabelle) */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Classificação Regional
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px]">Divisão 1</span>
            </div>

            <div className="space-y-1.5 my-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <span className="font-black text-white">CERESC Mogi Guaçu</span>
                </div>
                <div className="font-mono font-black text-orange-300">18 pts (Líder)</div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 font-bold text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <span className="font-medium">Campinas T.M.</span>
                </div>
                <div className="font-mono text-slate-400">15 pts</div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-400 font-bold text-[11px] flex items-center justify-center">
                    3
                  </span>
                  <span className="font-medium">Limeira Pong</span>
                </div>
                <div className="font-mono text-slate-400">12 pts</div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Saldo de sets: +14</span>
            <button
              onClick={() => onNavigate('comissao')}
              className="font-bold text-sky-300 hover:text-sky-200 flex items-center gap-1"
            >
              Classificação Completa <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
