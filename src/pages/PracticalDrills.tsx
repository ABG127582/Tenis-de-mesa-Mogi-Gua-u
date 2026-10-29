import { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  Target,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  Flame,
  Volume2,
  TrendingUp,
  Layers,
  Check,
  History,
  Save,
  Coffee,
  Eye,
  Video,
  Youtube,
  ExternalLink,
  Download
} from 'lucide-react';
import { INITIAL_DRILLS } from '../data/mockData';
import { ExerciseDrill, TrainingRoutinePhase, CompletedDrillSession, AuthUser } from '../types';
import { apiService } from '../services/api';
import DemoBadge from '../components/DemoBadge';
import DrillTableDiagram from '../components/DrillTableDiagram';

interface PracticalDrillsProps {
  currentUser?: AuthUser | null;
}

export default function PracticalDrills({ currentUser }: PracticalDrillsProps) {
  const [activeTab, setActiveTab] = useState<'catalogo' | 'montador' | 'historico'>('catalogo');
  const [selectedLevel, setSelectedLevel] = useState<string>('Todos');
  const [selectedDuration, setSelectedDuration] = useState<string>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [activeDrill, setActiveDrill] = useState<ExerciseDrill | null>(null);

  // Warmup and Video Demonstration Modals
  const [isWarmupModalOpen, setIsWarmupModalOpen] = useState(false);
  const [videoModalDrill, setVideoModalDrill] = useState<ExerciseDrill | null>(null);

  // Drill Timer State
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(60);
  const [completedSets, setCompletedSets] = useState(0);
  const [totalActiveSeconds, setTotalActiveSeconds] = useState(0);

  // Session Builder State
  const [customDuration, setCustomDuration] = useState<15 | 30 | 45 | 60>(30);
  const [customFocus, setCustomFocus] = useState<string>('Regularidade de Forehand/Backhand');
  const [customLevel, setCustomLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Intermediário');
  const [isTableMode, setIsTableMode] = useState(false);

  // Drill History State
  const [drillHistory, setDrillHistory] = useState<CompletedDrillSession[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Load drill history
  useEffect(() => {
    let isMounted = true;
    apiService.drills.getHistory().then((data) => {
      if (isMounted && data) {
        setDrillHistory(data);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Timer interval for standard set and rest
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        if (isResting) {
          setRestSeconds((prev) => {
            if (prev <= 1) {
              setIsResting(false);
              return 60;
            }
            return prev - 1;
          });
        } else {
          setTimerSeconds((prev) => {
            if (prev <= 1) {
              setCompletedSets((s) => s + 1);
              setIsResting(true);
              setRestSeconds(60);
              return 180;
            }
            return prev - 1;
          });
          setTotalActiveSeconds((sec) => sec + 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isResting]);

  const categories = ['Todas', 'Regularidade', 'Deslocamento', 'Multibolas', 'Saque e Recepção'];
  const levels = ['Todos', 'Iniciante', 'Intermediário', 'Avançado'];
  const durations = ['Todos', '15 min', '30 min', '45 min', '60 min'];

  const filteredDrills = INITIAL_DRILLS.filter((drill) => {
    const matchLevel = selectedLevel === 'Todos' || drill.level === selectedLevel;
    const matchCategory = selectedCategory === 'Todas' || drill.category === selectedCategory;
    const matchDuration =
      selectedDuration === 'Todos' || `${drill.durationMinutes} min` === selectedDuration;
    return matchLevel && matchCategory && matchDuration;
  });

  const openDrillModal = (drill: ExerciseDrill) => {
    setActiveDrill(drill);
    setTimerSeconds(180);
    setIsTimerRunning(false);
    setIsResting(false);
    setRestSeconds(60);
    setCompletedSets(0);
    setTotalActiveSeconds(0);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');
  };

  const closeDrillModal = () => {
    setIsTimerRunning(false);
    setIsResting(false);
    setActiveDrill(null);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');
  };

  const handleSaveDrillSession = async () => {
    if (!activeDrill) return;
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const saved = await apiService.drills.saveSession({
        drillId: activeDrill.id,
        drillTitle: activeDrill.title,
        durationSeconds: totalActiveSeconds || (completedSets * 180),
        setsCompleted: Math.max(completedSets, 1),
        restDurationSeconds: 60 * completedSets,
        notes: `Treino técnico de ${activeDrill.category} executado com foco em postura e terminação.`
      });

      setDrillHistory([saved, ...drillHistory]);
      setSaveSuccessMsg('Sessão registrada com sucesso no banco de dados do atleta!');
      setTimeout(() => {
        closeDrillModal();
      }, 1400);
    } catch (err: any) {
      setSaveErrorMsg(err?.message || 'Falha ao registrar sessão no servidor. Conecte-se com sua conta de atleta para salvar seu progresso.');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const generateRoutine = (): TrainingRoutinePhase[] => {
    const warmupTime = customDuration === 15 ? 3 : customDuration === 30 ? 5 : 8;
    const matchTime = customDuration === 15 ? 4 : customDuration === 30 ? 8 : 12;
    const mainTime = customDuration - warmupTime - matchTime;

    return [
      {
        phaseName: 'Fase 1: Aquecimento & Ativação Motora',
        durationMinutes: warmupTime,
        exerciseTitle: 'Troca de Bola em Ritmo Médio e Ajuste de Pés',
        description: 'Aquecer ombros, punho e quadril sem forçar velocidade máxima. Manter contato suave.',
        keyInstructions: [
          '50 bolas cruzadas de Forehand no ritmo do parceiro',
          '50 bolas de Backhand com foco no cotovelo solto',
          'Pequenos saltos nos calcanhares antes de cada bola'
        ]
      },
      {
        phaseName: 'Fase 2: Bloco Técnico Principal',
        durationMinutes: mainTime,
        exerciseTitle: `Exercício Focado em ${customFocus}`,
        description: `Treino direcionado prescrito pelo Prof. Max para nível ${customLevel}.`,
        keyInstructions: [
          'Executar séries ininterruptas de 3 minutos',
          'Parceiro varia a profundidade da bola (curta e longa)',
          'Focar na terminação do golpe e retorno à posição neutra'
        ]
      },
      {
        phaseName: 'Fase 3: Situação sob Pressão / Matchplay',
        durationMinutes: matchTime,
        exerciseTitle: 'Tie-break a partir do 9x9 e Saque Decisivo',
        description: 'Simulação de final de set para consolidar o aprendizado sob pressão emocional.',
        keyInstructions: [
          'Iniciar o placar empatado em 9 a 9',
          'Aplicar obrigatoriamente a rotina pré-saque de 3 segundos',
          'Quem perder faz 5 polichinelos antes do próximo tie-break'
        ]
      }
    ];
  };

  const generatedRoutine = generateRoutine();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Treinamentos Práticos de Mesa • Prof. Max
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Exercícios homologados para a equipe de Mogi Guaçu, cronômetro de mesa com descanso ativo e registro de histórico.
          </p>
        </div>
        <DemoBadge minimal={true} text="Treinamento Técnico Ativo" />
      </div>

      {/* Coach Advisory with Warmup Chart Link */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <div className="leading-relaxed">
            <span className="font-black text-amber-950 mr-1.5">Orientação do Prof. Max:</span>
            <button
              type="button"
              onClick={() => setIsWarmupModalOpen(true)}
              className="font-bold text-amber-950 underline decoration-orange-500 decoration-2 underline-offset-4 hover:text-orange-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer text-left mr-1.5"
              title="Clique para abrir o cartaz oficial de 23 exercícios de aquecimento e alongamento"
            >
              Todos os exercícios devem respeitar o aquecimento articular prévio.
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider no-underline shadow-xs hover:bg-orange-600 transition-colors">
                <Eye className="w-3 h-3" /> Ver Cartaz (23 Passos)
              </span>
            </button>
            <span className="text-amber-800 hidden md:inline">
              O cronômetro registra suas séries e o descanso ativo de 60 segundos.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsWarmupModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Eye className="w-3.5 h-3.5" /> Cartaz de Aquecimento
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('catalogo')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'catalogo'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" /> Catálogo de Exercícios ({INITIAL_DRILLS.length})
        </button>

        <button
          onClick={() => setActiveTab('montador')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'montador'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-orange-400" /> Montador de Sessão
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'historico'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4 text-emerald-400" /> Histórico do Atleta ({drillHistory.length})
        </button>
      </div>

      {activeTab === 'catalogo' && (
        <>
          {/* Filter Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Categoria:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Nível: {lvl}
                  </option>
                ))}
              </select>

              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                {durations.map((dur) => (
                  <option key={dur} value={dur}>
                    Duração: {dur}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDrills.map((drill) => (
              <div
                key={drill.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                      {drill.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-orange-500" /> {drill.durationMinutes} min
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {drill.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {drill.objective}
                  </p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1 mb-4">
                    <div>
                      <b className="text-slate-800">Séries e Repetições:</b> {drill.seriesAndReps}
                    </div>
                    <div>
                      <b className="text-slate-800">Material:</b> {drill.materials.join(', ')}
                    </div>
                  </div>

                  {/* Visual Tactical Table Diagram */}
                  <div className="mb-4">
                    <DrillTableDiagram
                      type={drill.diagramType || 'crosscourt'}
                      title={drill.title}
                    />
                  </div>

                  {/* YouTube Video Demonstration Box */}
                  {(drill.youtubeVideoId || drill.videoUrl) && (
                    <div className="mb-2 flex items-center justify-between bg-red-50/70 border border-red-200/80 rounded-2xl p-2.5 sm:p-3">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="p-2 bg-red-600 text-white rounded-xl shrink-0 shadow-xs">
                          <Youtube className="w-4 h-4 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
                              Vídeo Demonstrativo
                            </span>
                            {drill.videoDuration && (
                              <span className="text-[10px] font-mono text-slate-500 font-semibold bg-white px-1.5 py-0.2 rounded border border-red-100">
                                {drill.videoDuration}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate block">
                            {drill.videoTitle || 'Exemplo técnico em vídeo (ITTF / Seleção)'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setVideoModalDrill(drill)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-current" /> Ver Vídeo
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">
                    Nível: <b className="text-slate-800">{drill.level}</b>
                  </span>

                  <button
                    onClick={() => openDrillModal(drill)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Iniciar Treino
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'montador' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" /> Personalizar Treino do Dia com Prof. Max
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Duração Total:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((d) => (
                    <button
                      key={d}
                      onClick={() => setCustomDuration(d as any)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        customDuration === d
                          ? 'bg-[#0c2340] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Foco Técnico:</label>
                <select
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                >
                  <option value="Regularidade de Forehand/Backhand">Regularidade de Forehand/Backhand</option>
                  <option value="Deslocamento Canto-Meio (Footwork)">Deslocamento Canto-Meio (Footwork)</option>
                  <option value="Saque Curto com Efeito e Recepção">Saque Curto com Efeito e Recepção</option>
                  <option value="Transição de Bloqueio para Contra-Ataque">Transição de Bloqueio para Contra-Ataque</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nível de Exigência:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Iniciante', 'Intermediário', 'Avançado'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setCustomLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        customLevel === lvl
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Rotina estruturada em 3 fases: Aquecimento, Bloco Principal e Situação sob Pressão.
              </span>
              <button
                onClick={() => {
                  setTimerSeconds(customDuration * 60);
                  setIsTableMode(true);
                  setIsTimerRunning(true);
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Maximize2 className="w-4 h-4" /> Ativar Modo Mesa de Treino ({customDuration} min)
              </button>
            </div>
          </div>

          {/* Generated 3 Phases Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generatedRoutine.map((phase, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    {phase.phaseName.split(':')[0]}
                  </span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500" /> {phase.durationMinutes} min
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {phase.exerciseTitle}
                </h4>
                <p className="text-xs text-slate-500">
                  {phase.description}
                </p>
                <ul className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  {phase.keyInstructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'historico' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" /> Histórico de Sessões Concluídas • Adilson Bernardo Gomes
              </h2>
              <p className="text-xs text-slate-500">
                Registro persistente de treinamentos executados com cronômetro, séries e tempo ativo.
              </p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
              {drillHistory.length} Treino{drillHistory.length !== 1 ? 's' : ''} Gravado{drillHistory.length !== 1 ? 's' : ''}
            </span>
          </div>

          {drillHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              Nenhum treino registrado ainda. Abra um exercício do catálogo, inicie as séries e clique em &quot;Salvar Sessão no Histórico&quot;.
            </div>
          ) : (
            <div className="space-y-3">
              {drillHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-orange-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.drillTitle}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded font-semibold">
                        {item.setsCompleted} série{item.setsCompleted > 1 ? 's' : ''} concluída{item.setsCompleted > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{item.notes}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>Atleta: <b className="text-slate-700">{item.athleteName}</b></span>
                      <span>•</span>
                      <span>Data: {new Date(item.completedAtISO).toLocaleDateString('pt-BR')} às {new Date(item.completedAtISO).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="text-right sm:text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-800 block">
                      {formatTime(item.durationSeconds)} tempo ativo
                    </span>
                    <span className="text-[10px] text-orange-600 font-medium">
                      Validado pela Comissão
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drill Detail & Stopwatch Modal (Standard) */}
      {activeDrill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[92vh] flex flex-col">
            <button
              onClick={closeDrillModal}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto pr-2 space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                    {activeDrill.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Nível: {activeDrill.level}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500" /> Duração: {activeDrill.durationMinutes} min
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {activeDrill.title}
                </h2>
              </div>

              {/* Integrated Drill Timer with Active Rest Detection */}
              <div
                className={`p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md transition-colors ${
                  isResting ? 'bg-[#0f2e22] text-white border border-emerald-500/40' : 'bg-[#0c2340] text-white'
                }`}
              >
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                    {isResting ? (
                      <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Coffee className="w-3 h-3" /> Descanso Ativo (60 segundos)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold tracking-wider uppercase text-orange-400">
                        Série em Andamento (3 minutos)
                      </span>
                    )}
                  </div>

                  <div className="text-4xl sm:text-5xl font-mono font-black text-white">
                    {isResting ? formatTime(restSeconds) : formatTime(timerSeconds)}
                  </div>

                  <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-3">
                    <span>Séries Concluídas: <b className="text-white text-sm">{completedSets}</b></span>
                    <span>•</span>
                    <span>Tempo Ativo Total: <b className="text-orange-400 font-mono">{formatTime(totalActiveSeconds)}</b></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      isTimerRunning
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                        : isResting
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    {isTimerRunning ? 'Pausar Cronômetro' : isResting ? 'Continuar Descanso' : 'Iniciar Série'}
                  </button>

                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setIsResting(false);
                      setTimerSeconds(180);
                      setRestSeconds(60);
                    }}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300"
                    title="Reiniciar série"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tactical Diagram inside Active Drill Modal */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-800">
                    Esquema Tático da Mesa & Posição de Golpe:
                  </span>
                  {(activeDrill.youtubeVideoId || activeDrill.videoUrl) && (
                    <button
                      type="button"
                      onClick={() => setVideoModalDrill(activeDrill)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
                    >
                      <Youtube className="w-3.5 h-3.5 fill-current" /> Ver Vídeo Exemplo ({activeDrill.videoDuration || 'Vídeo'})
                    </button>
                  )}
                </div>

                <DrillTableDiagram
                  type={activeDrill.diagramType || 'crosscourt'}
                  title={activeDrill.title}
                />
              </div>

              {/* Instructions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Instruções Passo a Passo:
                </h4>
                <ol className="space-y-2">
                  {activeDrill.instructions.map((step, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Match Application */}
              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 text-xs">
                <span className="font-bold text-blue-900">Aplicação no jogo de Mogi Guaçu:</span>{' '}
                <span className="text-blue-800">{activeDrill.matchApplication}</span>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {saveErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{saveErrorMsg}</span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeDrillModal}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Fechar sem Salvar
              </button>

              <button
                type="button"
                onClick={handleSaveDrillSession}
                className="px-5 py-2.5 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Salvar Sessão no Histórico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN "MODO MESA DE TREINO" */}
      {isTableMode && (
        <div className="fixed inset-0 z-50 bg-[#081320] text-white flex flex-col justify-between p-6 sm:p-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-orange-500 text-white font-black text-xs uppercase tracking-wider animate-pulse">
                Modo Mesa de Treino Ativo
              </span>
              <span className="text-slate-400 text-sm hidden sm:inline">
                Apoie o celular na borda da mesa • Foco Total em Mogi Guaçu
              </span>
            </div>

            <button
              onClick={() => {
                setIsTableMode(false);
                setIsTimerRunning(false);
                setIsResting(false);
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white flex items-center gap-2 border border-white/20"
            >
              <Minimize2 className="w-4 h-4" /> Sair do Modo Mesa
            </button>
          </div>

          {/* Huge Central Display */}
          <div className="flex-1 flex flex-col items-center justify-center text-center my-6 space-y-4">
            <span className="text-orange-400 font-bold uppercase tracking-widest text-sm sm:text-base">
              {customFocus}
            </span>

            {/* Giant Timer Numbers */}
            <div className="text-7xl sm:text-9xl md:text-[10rem] font-mono font-black tracking-tight text-white select-none">
              {formatTime(timerSeconds)}
            </div>

            <div className="flex items-center gap-4 text-slate-300 text-sm sm:text-base">
              <span>Séries Concluídas: <b className="text-white text-lg">{completedSets}</b></span>
              <span>•</span>
              <span>Duração Total: <b className="text-orange-400">{customDuration} min</b></span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-8 py-4 rounded-2xl font-black text-lg sm:text-xl flex items-center gap-3 transition-all shadow-xl hover:scale-105 active:scale-95 ${
                  isTimerRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30'
                }`}
              >
                {isTimerRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                {isTimerRunning ? 'Pausar Treino' : 'Iniciar Cronômetro'}
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(customDuration * 60);
                }}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10"
                title="Reiniciar tempo da sessão"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Quick instructions at bottom */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-xs text-slate-300">
            <b>Dica do Prof. Max na Mesa:</b> Mantenha os joelhos semiflexionados e não deixe os calcanhares colados no chão durante os giros de forehand.
          </div>
        </div>
      )}

      {/* MODAL 1: 23-STEP JOINT WARMUP & STRETCHING CHART */}
      {isWarmupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 relative my-6 max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsWarmupModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors z-10"
              aria-label="Fechar modal de aquecimento"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4 pr-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-black uppercase tracking-wider">
                    Protocolo Oficial • SEMEL / Prof. Max
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    23 Exercícios Guiados (15s cada)
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Cartaz Oficial de Aquecimento Articular & Alongamento
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  &quot;Todos os exercícios devem respeitar o aquecimento articular prévio.&quot;
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/assets/aistudio/aquecimento_articular.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir Alta Resolução
                </a>
              </div>
            </div>

            {/* Image Viewer with Scroll */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div className="bg-slate-50 p-2 sm:p-4 rounded-2xl border border-slate-200/80 flex items-center justify-center">
                <img
                  src="/assets/aistudio/aquecimento_articular.jpg"
                  alt="Cartaz Oficial de Aquecimento Articular para Tênis de Mesa (23 Passos)"
                  className="max-h-[68vh] w-auto max-w-full object-contain rounded-xl shadow-md border border-slate-200"
                />
              </div>

              {/* 4 Muscle Groups Checklist Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
                  <b className="text-indigo-900 block mb-1">Passos 1 a 8:</b>
                  <p className="text-indigo-800 text-[11px]">
                    Pescoço e Ombros (Rotação, inclinação lateral, círculos e deltoides).
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                  <b className="text-blue-900 block mb-1">Passos 9 a 12:</b>
                  <p className="text-blue-800 text-[11px]">
                    Tronco e Costas (Giros, inclinação torácica, gato-camelo e rotação espinal).
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
                  <b className="text-amber-900 block mb-1">Passos 13 a 16:</b>
                  <p className="text-amber-800 text-[11px]">
                    Quadril e Glúteos (Rotação pélvica, avanço com torção e abdutores).
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                  <b className="text-emerald-900 block mb-1">Passos 17 a 23:</b>
                  <p className="text-emerald-800 text-[11px]">
                    Pernas e Panturrilhas (Isquiotibiais, quadríceps, mariposa, gêmeos e sóleo).
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Tempo total sugerido: ~6 minutos antes de iniciar o primeiro saque.
              </span>
              <button
                type="button"
                onClick={() => setIsWarmupModalOpen(false)}
                className="px-5 py-2 bg-[#0c2340] hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Entendido, Iniciar Treinamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: YOUTUBE COACHING VIDEO PLAYER MODAL */}
      {videoModalDrill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-800 relative my-6 max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95">
            <button
              onClick={() => setVideoModalDrill(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
              aria-label="Fechar vídeo"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Header */}
            <div className="border-b border-slate-800 pb-3 mb-4 pr-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Youtube className="w-3 h-3 fill-current" /> Demonstração em Vídeo
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {videoModalDrill.category} • Nível {videoModalDrill.level}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {videoModalDrill.videoTitle || videoModalDrill.title}
              </h3>
            </div>

            {/* Video Embed */}
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-xl relative">
                {videoModalDrill.youtubeVideoId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoModalDrill.youtubeVideoId}?rel=0&autoplay=1`}
                    title={videoModalDrill.videoTitle || videoModalDrill.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <Youtube className="w-12 h-12 text-red-500" />
                    <p className="text-xs text-slate-400">
                      Vídeo de treinamento disponível no canal parceiro.
                    </p>
                    <a
                      href={videoModalDrill.videoUrl || 'https://www.youtube.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" /> Abrir no YouTube
                    </a>
                  </div>
                )}
              </div>

              {/* Coaching points from Prof. Max */}
              <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-orange-400 font-bold">
                  <span>Dica Técnica do Prof. Max para este Exercício:</span>
                  <a
                    href={videoModalDrill.videoUrl || `https://www.youtube.com/watch?v=${videoModalDrill.youtubeVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    Abrir no app YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {videoModalDrill.objective}
                </p>
                <div className="text-[11px] text-slate-400 pt-1">
                  <b>Material necessário:</b> {videoModalDrill.materials.join(', ')} • <b>Séries recomendadas:</b> {videoModalDrill.seriesAndReps}
                </div>
              </div>
            </div>

            {/* Video Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Vídeo homologado para os atletas de Mogi Guaçu.
              </span>
              <button
                type="button"
                onClick={() => setVideoModalDrill(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Fechar Vídeo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
