import React, { useState } from 'react';
import {
  HeartPulse,
  Moon,
  Utensils,
  Dumbbell,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Droplets,
  Flame,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  Info,
  Maximize2,
  RotateCcw,
  Apple,
  Activity,
  Heart,
  Zap,
  Bed,
  Sun,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import DemoBadge from '../components/DemoBadge';

export default function PhysicalHealthMindmap() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBranch, setActiveBranch] = useState<'all' | 'descanso' | 'alimentacao' | 'atividade' | 'preventiva'>('all');
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  // Interactive Hydration Calculator
  const [bodyWeight, setBodyWeight] = useState<number>(70);
  const [exerciseHours, setExerciseHours] = useState<number>(1.5);

  // Strength Set Demo
  const [selectedRepScheme, setSelectedRepScheme] = useState<number>(1);

  const toggleNode = (nodeId: string) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const isCollapsed = (nodeId: string) => Boolean(collapsedNodes[nodeId]);

  // Daily water math: Weight * 35mL + (exerciseHours * 500mL)
  const baseWaterLiters = (bodyWeight * 35) / 1000;
  const trainingWaterLiters = (exerciseHours * 500) / 1000;
  const totalWaterLiters = (baseWaterLiters + trainingWaterLiters).toFixed(2);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-[#0c2340] to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          <HeartPulse className="w-80 h-80 -mr-16 -mt-10 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-3">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            Mapa Mental de Saúde Física Integral • Atletas & Comunidade
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">
            Saúde Física: Os 4 Pilares da Performance
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal mb-5">
            Estrutura médica e desportiva completa dividida em: <b>Descanso</b>, <b>Alimentação</b>, <b>Atividade Física</b> e <b>Medicina Preventiva</b>. Otimize sua recuperação muscular, sono e resistência para a mesa de tênis e para a vida.
          </p>

          {/* Link Pequenos Passos High-Priority Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
                PP
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">Projeto Parceiro</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-300 font-medium">pequenos-passos.ai.studio</span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  Pequenos Passos • Hábitos Diários & Estilo de Vida Saudável
                </h3>
              </div>
            </div>

            <a
              href="https://pequenos-passos.ai.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] shrink-0"
            >
              Acessar pequenos-passos.ai.studio <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Control Strip & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Branch Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveBranch('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeBranch === 'all'
                ? 'bg-[#0c2340] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos os 4 Pilares
          </button>
          <button
            onClick={() => setActiveBranch('descanso')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeBranch === 'descanso'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <Moon className="w-3.5 h-3.5" /> 1. Descanso
          </button>
          <button
            onClick={() => setActiveBranch('alimentacao')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeBranch === 'alimentacao'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" /> 2. Alimentação
          </button>
          <button
            onClick={() => setActiveBranch('atividade')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeBranch === 'atividade'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" /> 3. Atividade Física
          </button>
          <button
            onClick={() => setActiveBranch('preventiva')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeBranch === 'preventiva'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> 4. Preventiva
          </button>
        </div>

        {/* Search within Mind Map */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar no mapa (ex: sono, creatina, FCmáx)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* Interactive Tool Widget Strip: Calculators for Hydration & Strength Routine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hydration Calculator */}
        <div className="bg-gradient-to-br from-blue-500/10 via-sky-500/5 to-white p-5 rounded-3xl border border-sky-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-500 text-white rounded-xl">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Calculadora de Hidratação Diária do Atleta
                </h3>
                <p className="text-[11px] text-slate-500">
                  Regra Oficial: Peso × 35 mL + 500 mL por hora de treino na mesa
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">
              Pilar 2.1
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Seu Peso Corporal: <b className="text-sky-700">{bodyWeight} kg</b>
              </label>
              <input
                type="range"
                min="40"
                max="120"
                step="1"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>40 kg</span>
                <span>80 kg</span>
                <span>120 kg</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Tempo de Treino no Dia: <b className="text-sky-700">{exerciseHours} h</b>
              </label>
              <input
                type="range"
                min="0"
                max="4"
                step="0.5"
                value={exerciseHours}
                onChange={(e) => setExerciseHours(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0 h (Descanso)</span>
                <span>2 h</span>
                <span>4 h (Duplo turno)</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-sky-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Meta Diária Recomendada
              </span>
              <div className="text-2xl font-black text-sky-600 font-mono">
                {totalWaterLiters} Litros / dia
              </div>
              <span className="text-[10px] text-slate-500">
                ({baseWaterLiters.toFixed(2)}L basal + {trainingWaterLiters.toFixed(2)}L reposição de suor)
              </span>
            </div>

            <div className="text-right text-[11px] text-slate-600 space-y-0.5">
              <div className="font-semibold text-slate-800">Tabela Rápida de Referência:</div>
              <div>60 kg → 2,60 L • 70 kg → 2,95 L</div>
              <div>80 kg → 3,30 L • 90 kg → 3,65 L • 100 kg → 4,00 L</div>
            </div>
          </div>
        </div>

        {/* 4-Series Protocol Interactive Guide */}
        <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-white p-5 rounded-3xl border border-orange-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500 text-white rounded-xl">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Protocolo das 4 Séries por Exercício
                </h3>
                <p className="text-[11px] text-slate-500">
                  Resistência → Hipertrofia → Força → Potência (Descanso de 2 min)
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full">
              Pilar 3.2
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, name: '1ª Série', role: 'Resistência / Aquecimento', load: '40–60%', reps: '25–30 mov.', cue: '"Ardendo" / "Queimando"' },
              { num: 2, name: '2ª Série', role: 'Hipertrofia', load: '60–80%', reps: '8–12 mov.', cue: 'Próximo da "Trava" / "Falha"' },
              { num: 3, name: '3ª Série', role: 'Força Pura', load: '80–90%', reps: '4–6 mov.', cue: 'Próximo da "Trava" / "Falha"' },
              { num: 4, name: '4ª Série', role: 'Potência Rápida', load: '30–60%', reps: '3–6 mov.', cue: 'Máxima Velocidade com Técnica' }
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => setSelectedRepScheme(s.num)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  selectedRepScheme === s.num
                    ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${selectedRepScheme === s.num ? 'text-orange-100' : 'text-orange-600'}`}>
                  {s.name}
                </div>
                <div className="text-xs font-black truncate">{s.role}</div>
                <div className="text-[10px] opacity-80 mt-1 font-mono">{s.load}</div>
              </button>
            ))}
          </div>

          <div className="bg-white p-3 rounded-2xl border border-orange-100 text-xs">
            {selectedRepScheme === 1 && (
              <div className="space-y-1">
                <b className="text-orange-700">1ª Série (Resistência & Aquecimento Articular):</b> 40–60% da carga máxima, 25 a 30 repetições. Sensação alvo: início de fadiga com sensação de &quot;ardendo/queimando&quot; na musculatura, preparando ligamentos para as cargas pesadas.
              </div>
            )}
            {selectedRepScheme === 2 && (
              <div className="space-y-1">
                <b className="text-orange-700">2ª Série (Hipertrofia):</b> 60–80% da carga máxima, 8 a 12 repetições. Execução controlada até chegar próximo da &quot;trava/falha&quot; concêntrica (RPE 8-9).
              </div>
            )}
            {selectedRepScheme === 3 && (
              <div className="space-y-1">
                <b className="text-orange-700">3ª Série (Força Pura):</b> 80–90% da capacidade, 4 a 6 repetições pesadas com controle técnico impecável. Estímulo de recrutamento neural profundo.
              </div>
            )}
            {selectedRepScheme === 4 && (
              <div className="space-y-1">
                <b className="text-orange-700">4ª Série (Potência & Explosão):</b> 30–60% de carga moderada/leve, 3 a 6 movimentos com <b>máxima aceleração concêntrica</b> para transferir força em velocidade de golpe no tênis de mesa.
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-orange-500" /> Intervalo Obrigatório entre Séries:
              </span>
              <span className="font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                2 minutos completos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* THE 4 PILLARS MIND MAP TREE VIEW */}
      <div className="space-y-6">
        {/* Pilar 1: DESCANSO */}
        {(activeBranch === 'all' || activeBranch === 'descanso') && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-indigo-50 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20">
                  1
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Pilar Fundamental
                    </span>
                    <span className="text-xs text-slate-400">Recuperação do Sistema Nervoso Central</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    DESCANSO & SONO
                  </h2>
                </div>
              </div>

              <button
                onClick={() => toggleNode('descanso')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 p-2 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                {isCollapsed('descanso') ? 'Expandir Ramo' : 'Recolher'}
                {isCollapsed('descanso') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {!isCollapsed('descanso') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1.1 SONO */}
                <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/80 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span>1.1 SONO</span>
                  </div>

                  {/* Duração por idade */}
                  <div className="bg-white p-3.5 rounded-xl border border-indigo-100 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Duração Recomendada por Idade:</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                      <div>0–3 meses: <b>14–17 h</b></div>
                      <div>4–11 meses: <b>12–15 h</b></div>
                      <div>1–2 anos: <b>11–14 h</b></div>
                      <div>3–5 anos: <b>10–13 h</b></div>
                      <div>6–12 anos: <b>9–12 h</b></div>
                      <div>13–18 anos: <b>8–10 h</b></div>
                      <div className="text-indigo-700 font-bold col-span-2 pt-1 border-t border-indigo-50">
                        Adultos: <b>7–9 h</b> • Idosos: <b>7–8 h</b>
                      </div>
                    </div>
                  </div>

                  {/* Regularidade & Qualidade */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <b className="text-slate-800 block mb-1">Regularidade:</b>
                      <p className="text-slate-600 text-[11px]">
                        Horário fixo para dormir e para acordar, consistência nos fins de semana e pouca variação de horários.
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <b className="text-slate-800 block mb-1">Qualidade & Ambiente:</b>
                      <p className="text-slate-600 text-[11px]">
                        Continuidade do sono, baixa latência (adormecer em até 20 min), ausência de sonolência diurna. Quarto com <b>escuridão total (blackout)</b>, silêncio, temperatura adequada (18–21°C) e conforto.
                      </p>
                    </div>
                  </div>

                  {/* Rotina Pré-sono */}
                  <div className="bg-indigo-900 text-white p-4 rounded-xl space-y-2 text-xs">
                    <b className="text-indigo-200 block">Rotina Pré-Sono do Atleta:</b>
                    <ul className="space-y-1.5 text-[11px] text-indigo-100">
                      <li>• <b>Luz natural pela manhã:</b> 10 minutos de sol após acordar</li>
                      <li>• <b>Alarme de cafeína:</b> cortar café/energético 9 horas antes de deitar</li>
                      <li>• <b>Alarme de fechamento (3h antes):</b> encerrar trabalho, reflexão e preparar o próximo dia</li>
                      <li>• <b>Reduzir luz azul:</b> desligar telas/celular 3 horas antes</li>
                      <li>• <b>Higiene acústica:</b> portas/janelas fechadas e protetor auricular de espuma</li>
                    </ul>
                  </div>
                </div>

                {/* 1.2 RITMO CIRCADIANO */}
                <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/80 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>1.2 RITMO CIRCADIANO</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sincronização dos relógios biológicos periféricos e centrais com o ciclo claro/escuro.
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <b className="text-slate-800 block">Luz Matinal vs Noturna:</b>
                      <span className="text-[11px] text-slate-600">
                        A luz do sol matinal suprime a melatonina e eleva o cortisol produtivo. À noite, a luz artificial inibe o descanso profundo.
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <b className="text-slate-800 block">Horários & Sincronização:</b>
                      <span className="text-[11px] text-slate-600">
                        Manter horários de refeição e treinos alinhados com o fuso para evitar desalinhamento circadiano e queda imune.
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <b className="text-slate-800 block">Prevenção do Desalinhamento:</b>
                      <span className="text-[11px] text-slate-600">
                        Evitar &quot;jetlag social&quot; (dormir 4 horas mais tarde nas noites de sábado/domingo).
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1.3 RECUPERAÇÃO */}
                <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/80 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                    <Bed className="w-4 h-4 text-indigo-600" />
                    <span>1.3 RECUPERAÇÃO</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Processo biológico de restauração da homeostase e supercompensação atlética.
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <b className="text-slate-800 block">Recuperação Pós-Exercício Imediata:</b>
                      <span className="text-[11px] text-slate-600">
                        Desaquecimento ativo, hidratação com eletrólitos e alongamento leve.
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                      <b className="text-slate-800 block">Intervalo Entre Sessões de Treino:</b>
                      <span className="text-[11px] text-slate-600">
                        Mínimo de 24 a 48 horas de recuperação para grupos musculares com sobrecarga excêntrica pesada.
                      </span>
                    </div>

                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-900">
                      <b className="block mb-0.5">Sinais de Fadiga Acumulada:</b>
                      <span className="text-[11px]">
                        Queda na velocidade de reação à mesa, irritabilidade, perda de apetite e dor articular persistente exigem &quot;deload&quot; imediato.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pilar 2: ALIMENTAÇÃO */}
        {(activeBranch === 'all' || activeBranch === 'alimentacao') && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-50 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/20">
                  2
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Energia & Construção Tecidual
                    </span>
                    <span className="text-xs text-slate-400">Nutrição Esportiva de Precisão</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    ALIMENTAÇÃO & NUTRIÇÃO
                  </h2>
                </div>
              </div>

              <button
                onClick={() => toggleNode('alimentacao')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 p-2 rounded-xl hover:bg-emerald-50 transition-colors"
              >
                {isCollapsed('alimentacao') ? 'Expandir Ramo' : 'Recolher'}
                {isCollapsed('alimentacao') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {!isCollapsed('alimentacao') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 2.1 & 2.2 Nutrientes */}
                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/80 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                    <Utensils className="w-4 h-4 text-emerald-600" />
                    <span>2.1 & 2.2 MACRO & MICRONUTRIENTES</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-2 text-xs">
                    <b className="text-slate-800 block">Macronutrientes:</b>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      <li>• <b>Proteínas:</b> reparação muscular (1,6 a 2,2g/kg para atletas)</li>
                      <li>• <b>Carboidratos:</b> glicogênio muscular para sprints e reflexos rápidos</li>
                      <li>• <b>Gorduras saudáveis:</b> síntese hormonal e suporte articular</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-2 text-xs">
                    <b className="text-slate-800 block">Micronutrientes Chave:</b>
                    <p className="text-[11px] text-slate-600">
                      Vitaminas (complexo B para metabolismo energético, C e D3) e Minerais (Zinco, Ferro, Magnésio e Potássio para contração e relaxamento muscular).
                    </p>
                  </div>
                </div>

                {/* 2.3 ALIMENTOS DE ALTA DENSIDADE */}
                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/80 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                    <Apple className="w-4 h-4 text-emerald-600" />
                    <span>2.3 ALIMENTOS SELECIONADOS</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <b className="text-slate-800">Proteínas:</b> Ovos, peixes de água doce (tilápia, truta) e carnes magras.
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <b className="text-slate-800">Vegetais:</b> Brócolis, couve-flor, cenoura, pimentão recheado e cogumelos shitake.
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <b className="text-slate-800">Frutas & Leguminosas:</b> Morango, maçã, laranja (vitamina C) e lentilha.
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <b className="text-slate-800">Gorduras:</b> Azeite de oliva extravirgem.
                    </div>
                    <div className="bg-emerald-900 text-white p-3 rounded-xl text-[11px] space-y-1">
                      <b className="text-emerald-200">Alimentos Funcionais Potentes:</b>
                      <p className="text-emerald-100">
                        Alho, gengibre, linhaça triturada, pimenta, cúrcuma (anti-inflamatório articular), vinagre de maçã e chá verde.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2.4 & 2.5 SUPLEMENTAÇÃO & PADRÃO */}
                <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/80 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>2.4 & 2.5 SUPLEMENTAÇÃO & PADRÃO</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-2 text-xs">
                    <b className="text-slate-800 block">Suplementação Baseada em Evidências:</b>
                    <ul className="space-y-1.5 text-[11px] text-slate-600">
                      <li>• <b>Creatina:</b> 3–5g diários para potência explosiva de pernas</li>
                      <li>• <b>Whey Protein:</b> praticidade no pós-treino imediato</li>
                      <li>• <b>Ômega-3:</b> combate à neuroinflamação e saúde articular</li>
                      <li>• <b>Magnésio & Potássio:</b> alívio de cãibras musculares e relaxamento noturno</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-1 text-xs">
                    <b className="text-slate-800 block">Padrão Alimentar Consciente:</b>
                    <p className="text-[11px] text-slate-600">
                      Variedade de cores no prato, alta densidade nutricional, lista de compras planejada e <b>eliminação estrita de ultraprocessados</b> que degradam o tempo de reação visual.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pilar 3: ATIVIDADE FÍSICA */}
        {(activeBranch === 'all' || activeBranch === 'atividade') && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-orange-50 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-500/20">
                  3
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      Capacidade Muscular & Cardiovascular
                    </span>
                    <span className="text-xs text-slate-400">Cardio, Força, Mobilidade & Coordenação</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    ATIVIDADE FÍSICA & PERIODIZAÇÃO
                  </h2>
                </div>
              </div>

              <button
                onClick={() => toggleNode('atividade')}
                className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1 p-2 rounded-xl hover:bg-orange-50 transition-colors"
              >
                {isCollapsed('atividade') ? 'Expandir Ramo' : 'Recolher'}
                {isCollapsed('atividade') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {!isCollapsed('atividade') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 3.1 Cardiorrespiratório */}
                <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/80 space-y-4">
                  <div className="flex items-center gap-2 text-orange-950 font-black text-sm">
                    <Heart className="w-4 h-4 text-orange-600" />
                    <span>3.1 CARDIORRESPIRATÓRIO</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-orange-100 space-y-2 text-xs">
                    <b className="text-slate-800 block">Zonas de Frequência Cardíaca:</b>
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg">
                        <span>Moderado:</span>
                        <b className="text-amber-700">64% a 76% da FCmáx</b>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg">
                        <span>Vigoroso:</span>
                        <b className="text-red-700">77% a 95% da FCmáx</b>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-900 text-white p-3.5 rounded-xl text-xs space-y-1">
                    <b className="text-orange-200">Protocolo Intervalado HIIT (Até 30 min):</b>
                    <p className="text-[11px] text-orange-100">
                      5 minutos em intensidade moderada intercalados com 1 minuto em ritmo vigoroso, simulando as pausas e acelerações repentinas de um set de tênis de mesa.
                    </p>
                  </div>
                </div>

                {/* 3.3 Mobilidade / Flexibilidade */}
                <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/80 space-y-4">
                  <div className="flex items-center gap-2 text-orange-950 font-black text-sm">
                    <Activity className="w-4 h-4 text-orange-600" />
                    <span>3.3 MOBILIDADE & FLEXIBILIDADE</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Preserva as articulações dos joelhos, quadris, ombros e punhos nas frenagens do footwork.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-orange-100">
                      <b className="text-slate-800 block">Mobilidade Articular:</b>
                      <span className="text-[11px] text-slate-600">
                        Fluidez dos movimentos da coluna torácica, quadril e tornozelos.
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-orange-100">
                      <b className="text-slate-800 block">Amplitude de Movimento (ADM):</b>
                      <span className="text-[11px] text-slate-600">
                        Capacidade de rotação máxima nos drives sem compensação postural lombar.
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-orange-100">
                      <b className="text-slate-800 block">Aquecimento Prévio Obrigatório:</b>
                      <span className="text-[11px] text-slate-600">
                        Seguir o cartaz oficial de 23 passos (15 segundos cada) antes de entrar na mesa.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3.4 Neuromotora */}
                <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/80 space-y-4">
                  <div className="flex items-center gap-2 text-orange-950 font-black text-sm">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span>3.4 CAPACIDADES NEUROMOTORAS</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    A base da inteligência motora para esportes de raquete de alta velocidade.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                      <b className="text-slate-800">Equilíbrio Estático e Dinâmico:</b> Estabilidade sobre a meia ponta dos pés durante trocas rápidas.
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                      <b className="text-slate-800">Agilidade & Mudança de Direção:</b> Tempos de transição no Falkenberg drill.
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                      <b className="text-slate-800">Velocidade da Marcha:</b> Deslocamentos laterais e passos de ajuste microscópicos.
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-orange-100">
                      <b className="text-slate-800">Coordenação Óculo-Manual:</b> Sincronia perfeita entre visão periférica da bolinha e impacto na borracha.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pilar 4: PREVENTIVA */}
        {(activeBranch === 'all' || activeBranch === 'preventiva') && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-rose-50 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-rose-500/20">
                  4
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      Longevidade & Segurança
                    </span>
                    <span className="text-xs text-slate-400">Avaliações Periódicas & Mitigação de Riscos</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    SAÚDE PREVENTIVA & RASTREAMENTO
                  </h2>
                </div>
              </div>

              <button
                onClick={() => toggleNode('preventiva')}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 p-2 rounded-xl hover:bg-rose-50 transition-colors"
              >
                {isCollapsed('preventiva') ? 'Expandir Ramo' : 'Recolher'}
                {isCollapsed('preventiva') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {!isCollapsed('preventiva') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 4.1 & 4.2 Avaliação & Testes Funcionais */}
                <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100/80 space-y-4">
                  <div className="flex items-center gap-2 text-rose-950 font-black text-sm">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>4.1 & 4.2 AVALIAÇÃO & TESTES FUNCIONAIS</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-rose-100 space-y-2 text-xs">
                    <b className="text-slate-800 block">Métricas Biomédicas Contínuas:</b>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      <li>• Peso & Composição corporal (massa magra vs gordura)</li>
                      <li>• Pressão arterial em repouso e frequência cardíaca basal</li>
                      <li>• Glicemia de jejum e exames laboratoriais anuais</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-rose-100 space-y-2 text-xs">
                    <b className="text-slate-800 block">Bateria de Testes Funcionais:</b>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      <li>• <b>Equilíbrio unipodal:</b> ficar 30s sobre 1 perna sem apoio</li>
                      <li>• <b>Preensão manual (Dinamometria):</b> força dos antebraços</li>
                      <li>• <b>Mobilidade articular global:</b> amplitude de ombro e quadril</li>
                      <li>• <b>Capacidade cardiorrespiratória:</b> teste de recuperação de 1 min</li>
                    </ul>
                  </div>
                </div>

                {/* 4.3 & 4.4 Vacinação & Rastreamento */}
                <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100/80 space-y-4">
                  <div className="flex items-center gap-2 text-rose-950 font-black text-sm">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>4.3 & 4.4 VACINAÇÃO & RASTREAMENTO</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-rose-100 space-y-2 text-xs">
                    <b className="text-slate-800 block">Calendário Vacinal:</b>
                    <p className="text-[11px] text-slate-600">
                      Manter a imunização em dia (Tétano, Gripe, Hepatite B, COVID-19 e Febre Amarela) para viagens de torneio e jogos intermunicipais.
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-rose-100 space-y-2 text-xs">
                    <b className="text-slate-800 block">Rastreamento Conforme Idade e Risco:</b>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      <li>• Rastreamento cardiovascular (Eletrocardiograma de esforço)</li>
                      <li>• Rastreamento metabólico (perfil lipídico e hemoglobina glicada)</li>
                      <li>• Rastreamento de câncer conforme faixa etária e histórico</li>
                    </ul>
                  </div>
                </div>

                {/* 4.5 Fatores de Risco */}
                <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100/80 space-y-4">
                  <div className="flex items-center gap-2 text-rose-950 font-black text-sm">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>4.5 FATORES DE RISCO A COMBATER</span>
                  </div>

                  <div className="bg-rose-900 text-white p-4 rounded-xl text-xs space-y-2">
                    <b className="text-rose-200 block">Fatores que Devem Ser Eliminados:</b>
                    <ul className="space-y-1.5 text-[11px] text-rose-100">
                      <li>• <b>Tabagismo:</b> destrói a oxigenação capilar nos músculos</li>
                      <li>• <b>Álcool em excesso:</b> suprime a síntese proteica por até 48h</li>
                      <li>• <b>Sedentarismo nos dias de folga:</b> adotar descanso ativo leve</li>
                      <li>• <b>Excesso de peso / obesidade:</b> sobrecarga destrutiva nos meniscos</li>
                      <li>• <b>Pressão arterial ou glicemia elevadas:</b> risco de eventos vasculares</li>
                      <li>• <b>Exposições prejudiciais:</b> estresse crônico e sono fragmentado</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Banner linking directly to pequenos-passos */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Aprofunde seus Hábitos Saudáveis
          </span>
          <h3 className="text-xl font-black">
            Conheça o Portal Pequenos Passos
          </h3>
          <p className="text-xs text-slate-400 max-w-xl">
            Descubra rotinas guiadas de hidratação, sono restaurador, nutrição equilibrada e passos progressivos para manter a constância física sem sobrecarga mental.
          </p>
        </div>

        <a
          href="https://pequenos-passos.ai.studio/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2 shrink-0"
        >
          Ir para pequenos-passos.ai.studio <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
