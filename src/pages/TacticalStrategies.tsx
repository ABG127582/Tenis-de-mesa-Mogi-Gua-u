import { useState, useEffect } from 'react';
import {
  Crosshair,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  ChevronDown,
  Trash2,
  Download,
  Lock,
  Plus,
  Save,
  Trophy,
  TrendingUp,
  Award,
  Calendar,
  Flame,
  History,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { INITIAL_STRATEGIES } from '../data/mockData';
import { TacticalStyle, TacticalScoutingSheet, AuthUser, MatchDiaryEntry } from '../types';
import { apiService } from '../services/api';
import DemoBadge from '../components/DemoBadge';

interface TacticalStrategiesProps {
  currentUser?: AuthUser | null;
  onNavigate?: (tabId: string) => void;
}

export default function TacticalStrategies({ currentUser, onNavigate }: TacticalStrategiesProps) {
  const [selectedStyle, setSelectedStyle] = useState<TacticalStyle>(INITIAL_STRATEGIES[0]);
  const [activeTab, setActiveTab] = useState<'estilos' | 'ficha' | 'diario-partidas'>('estilos');

  // Match Scouting Interactive Sheet State
  const [scoutingSheets, setScoutingSheets] = useState<TacticalScoutingSheet[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);

  const [scoutOpponent, setScoutOpponent] = useState('');
  const [scoutGrip, setScoutGrip] = useState('Clássica Destro');
  const [scoutRubber, setScoutRubber] = useState('Borrachas Lisas em Ambos os Lados');
  const [scoutFavoriteServe, setScoutFavoriteServe] = useState('');
  const [scoutWeakness, setScoutWeakness] = useState('');
  const [scoutMyGameplan, setScoutMyGameplan] = useState('');
  const [scoutNotes, setScoutNotes] = useState('');
  const [scoutSaved, setScoutSaved] = useState(false);
  const [scoutError, setScoutError] = useState('');

  // Match Diary State (Ferramenta #3)
  const [matches, setMatches] = useState<MatchDiaryEntry[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [showMatchForm, setShowMatchForm] = useState(false);

  const [matchOpponent, setMatchOpponent] = useState('');
  const [matchClub, setMatchClub] = useState('');
  const [matchStyle, setMatchStyle] = useState('Atacante Topspin Forehand');
  const [matchFormat, setMatchFormat] = useState<3 | 5 | 7>(5);
  const [matchSetsWonPlayer, setMatchSetsWonPlayer] = useState(3);
  const [matchSetsWonOpponent, setMatchSetsWonOpponent] = useState(1);
  const [matchSetsDetail, setMatchSetsDetail] = useState('');
  const [matchEvent, setMatchEvent] = useState('Treino de Mesa Mogi Guaçu');
  const [matchPositive, setMatchPositive] = useState('');
  const [matchDifficulties, setMatchDifficulties] = useState('');
  const [matchCoachFocus, setMatchCoachFocus] = useState('');
  const [matchSavedMsg, setMatchSavedMsg] = useState('');

  // Fetch saved scouting sheets for current user
  useEffect(() => {
    if (!currentUser) {
      setScoutingSheets([]);
      return;
    }

    let isMounted = true;
    setLoadingSheets(true);
    apiService.tactical.getScoutings()
      .then((data) => {
        if (isMounted && data) {
          setScoutingSheets(data);
        }
      })
      .catch((err) => {
        console.error('Error loading scoutings:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingSheets(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Fetch match diary entries
  const fetchMatches = () => {
    if (!currentUser) {
      setMatches([]);
      return;
    }
    setLoadingMatches(true);
    apiService.matches.getMatches()
      .then((data) => {
        if (data) setMatches(data);
      })
      .catch((err) => {
        console.error('Error loading matches:', err);
      })
      .finally(() => setLoadingMatches(false));
  };

  useEffect(() => {
    fetchMatches();
  }, [currentUser, activeTab]);

  // Save New Scouting Sheet
  const handleSaveScouting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!scoutOpponent.trim()) {
      setScoutError('Informe o nome do adversário.');
      return;
    }

    setScoutError('');
    try {
      const newSheet = await apiService.tactical.addScouting({
        opponentName: scoutOpponent.trim(),
        opponentGrip: scoutGrip,
        opponentRubber: scoutRubber,
        favoriteServe: scoutFavoriteServe.trim(),
        weakness: scoutWeakness.trim(),
        myGameplan: scoutMyGameplan.trim(),
        notes: scoutNotes.trim(),
        createdAtISO: new Date().toISOString()
      });

      setScoutingSheets([newSheet, ...scoutingSheets]);
      setScoutSaved(true);
      setScoutOpponent('');
      setScoutFavoriteServe('');
      setScoutWeakness('');
      setScoutMyGameplan('');
      setScoutNotes('');
      setTimeout(() => setScoutSaved(false), 3000);
    } catch {
      setScoutError('Erro ao gravar ficha no servidor. Verifique sua conexão.');
    }
  };

  // Delete Scouting Sheet
  const handleDeleteScouting = async (id: string) => {
    try {
      await apiService.tactical.deleteScouting(id);
      setScoutingSheets(scoutingSheets.filter((s) => s.id !== id));
    } catch {
      alert('Erro ao excluir ficha.');
    }
  };

  // Export Scouting Sheet as Text File
  const handleExportScouting = (sheet: TacticalScoutingSheet) => {
    const dateStr = sheet.createdAtISO ? new Date(sheet.createdAtISO).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
    const text = `=== FICHA DE OBSERVAÇÃO TÁTICA • TÊNIS DE MESA MOGI GUAÇU ===
Data: ${dateStr}
Atleta: ${currentUser?.name || 'Equipe Mogi Guaçu'}
Adversário: ${sheet.opponentName}
Empunhadura: ${sheet.opponentGrip}
Borrachas / Material: ${sheet.opponentRubber}

[SAQUE E PADRÃO PRINCIPAL]
${sheet.favoriteServe || 'Não especificado'}

[PONTO FRACO IDENTIFICADO]
${sheet.weakness || 'Não especificado'}

[MEU PLANO DE AÇÃO TÁTICO]
${sheet.myGameplan || 'Não especificado'}

[NOTAS ADICIONAIS]
${sheet.notes || 'Nenhuma'}
===========================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scouting_${sheet.opponentName.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Save Manual Match
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!matchOpponent.trim()) return;

    const isVict = matchSetsWonPlayer > matchSetsWonOpponent;
    const setsDetailCalc = matchSetsDetail.trim() || `${matchSetsWonPlayer}x${matchSetsWonOpponent}`;

    try {
      const created = await apiService.matches.saveMatch({
        athleteName: currentUser.name,
        opponentName: matchOpponent.trim(),
        opponentClub: matchClub.trim() || 'Regional',
        opponentStyle: matchStyle,
        matchFormat,
        setsWonPlayer: matchSetsWonPlayer,
        setsWonOpponent: matchSetsWonOpponent,
        setsDetail: setsDetailCalc,
        isVictory: isVict,
        competitionOrEvent: matchEvent.trim() || 'Treino',
        positiveTakeaways: matchPositive.trim(),
        difficultiesFaced: matchDifficulties.trim(),
        coachFocusNext: matchCoachFocus.trim()
      });

      setMatches([created, ...matches]);
      setMatchSavedMsg('Partida registrada no diário com sucesso!');
      setMatchOpponent('');
      setMatchClub('');
      setMatchSetsDetail('');
      setMatchPositive('');
      setMatchDifficulties('');
      setMatchCoachFocus('');
      setShowMatchForm(false);
      setTimeout(() => setMatchSavedMsg(''), 4000);
    } catch {
      alert('Erro ao registrar partida.');
    }
  };

  // Delete Match
  const handleDeleteMatch = async (id: string) => {
    try {
      await apiService.matches.deleteMatch(id);
      setMatches(matches.filter((m) => m.id !== id));
    } catch {
      alert('Erro ao excluir partida.');
    }
  };

  // Calculate Match Stats
  const totalMatches = matches.length;
  const totalVictories = matches.filter((m) => m.isVictory).length;
  const totalDefeats = totalMatches - totalVictories;
  const winRate = totalMatches > 0 ? Math.round((totalVictories / totalMatches) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Crosshair className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Estratégias Contra Adversários e Inteligência Tática
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mapeamento de padrões de jogo, scouting de adversários e diário de partidas pós-jogo.
          </p>
        </div>
        <DemoBadge minimal={true} text="Inteligência Tática ITTF/CBTM" />
      </div>

      {/* Realistic tactical disclaimer */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Diretriz Técnica do Prof. Max:</span> As táticas descritas são hipóteses analíticas para guiar o treino e a observação de jogo. O tempo de reação, o posicionamento dos pés e a capacidade de adaptação em tempo real são os pilares decisivos da vitória.
        </div>
      </div>

      {/* Tabs: [Estilos de Jogo] [Ficha de Observação / Scouting] [Diário de Partidas] */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('estilos')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'estilos'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Crosshair className="w-4 h-4" /> Estilos e Perfis de Adversários
        </button>

        <button
          onClick={() => setActiveTab('ficha')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'ficha'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Ficha de Observação & Scouting ({scoutingSheets.length})
        </button>

        <button
          onClick={() => setActiveTab('diario-partidas')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'diario-partidas'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4 text-orange-400" /> Diário de Partidas & Análise Pós-Jogo ({matches.length})
        </button>
      </div>

      {/* TAB 1: ESTILOS DE JOGO */}
      {activeTab === 'estilos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Style Selector Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Escolha o Perfil do Adversário:
            </h3>
            {INITIAL_STRATEGIES.map((style) => (
              <div
                key={style.id}
                onClick={() => setSelectedStyle(style)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  selectedStyle.id === style.id
                    ? 'bg-white border-orange-500 shadow-md ring-2 ring-orange-500/10'
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{style.styleName}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {style.proExample ? style.proExample.split(' ')[0] : 'CBTM'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {style.shortDescription}
                </p>
              </div>
            ))}
          </div>

          {/* Style Detailed Strategy Display */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                  Perfil Tático Mapeado
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  Como Jogar Contra: {selectedStyle.styleName}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {selectedStyle.shortDescription}
                </p>
              </div>

              {/* Strengths & Weaknesses Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" /> Pontos Fortes do Estilo:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedStyle.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fragilidades Táticas:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedStyle.weaknesses.map((wk, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Plan */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-500" />
                  Plano de Jogo Recomendado (Checklist Tático):
                </h4>
                <div className="space-y-2">
                  {selectedStyle.recommendedTactics.map((plan: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#0c2340] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{plan}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FICHA DE OBSERVAÇÃO & SCOUTING */}
      {activeTab === 'ficha' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scouting Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Registrar Observação de Adversário
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mapeie saques perigosos, borracha e fragilidades de atletas de clubes da região.
              </p>
            </div>

            {!currentUser && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Faça login para salvar suas fichas de forma permanente.</span>
              </div>
            )}

            {scoutSaved && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Ficha salva no banco com sucesso!
              </div>
            )}

            {scoutError && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                {scoutError}
              </div>
            )}

            <form onSubmit={handleSaveScouting} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Adversário *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos (Campinas) ou Rodrigo (Itapira)"
                  value={scoutOpponent}
                  onChange={(e) => setScoutOpponent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Empunhadura</label>
                  <select
                    value={scoutGrip}
                    onChange={(e) => setScoutGrip(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  >
                    <option value="Clássica Destro">Clássica Destro</option>
                    <option value="Clássica Canhoto">Clássica Canhoto</option>
                    <option value="Caneta Japonesa Destro">Caneta Japonesa Destro</option>
                    <option value="Caneta Japonesa Canhoto">Caneta Japonesa Canhoto</option>
                    <option value="Classineta (CPen)">Classineta (CPen)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Borrachas / Material</label>
                  <select
                    value={scoutRubber}
                    onChange={(e) => setScoutRubber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  >
                    <option value="Borrachas Lisas em Ambos os Lados">Lisas em Ambos os Lados</option>
                    <option value="Pino Longo no Backhand">Pino Longo no Backhand</option>
                    <option value="Pino Curto no Forehand">Pino Curto no Forehand</option>
                    <option value="Anti-spin no Backhand">Anti-spin no Backhand</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Saque mais Perigoso / Característica</label>
                <input
                  type="text"
                  placeholder="Ex: Saque rápido lateral na ponta do backhand"
                  value={scoutFavoriteServe}
                  onChange={(e) => setScoutFavoriteServe(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ponto Fraco Identificado</label>
                <input
                  type="text"
                  placeholder="Ex: Dificuldade contra bola lenta no meio do corpo (cotovelo)"
                  value={scoutWeakness}
                  onChange={(e) => setScoutWeakness(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meu Plano de Ação Tático</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Sacar curto no meio, bloquear firme no backhand e abrir acelerado de forehand."
                  value={scoutMyGameplan}
                  onChange={(e) => setScoutMyGameplan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={!currentUser}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Salvar Ficha no Banco
              </button>
            </form>
          </div>

          {/* Saved Scouting Sheets */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Minhas Fichas Registradas ({scoutingSheets.length})</span>
            </h3>

            {scoutingSheets.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400">
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Nenhuma ficha registrada ainda. Preencha o formulário ao lado para começar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scoutingSheets.map((sheet) => (
                  <div key={sheet.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {sheet.opponentGrip}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base mt-1">
                          {sheet.opponentName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Borracha: <b className="text-slate-700">{sheet.opponentRubber}</b>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleExportScouting(sheet)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Exportar / Baixar Texto da Ficha"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteScouting(sheet.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Ficha"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                      {sheet.favoriteServe && (
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="font-bold text-slate-700 block">Saque Perigoso:</span>
                          <span className="text-slate-600">{sheet.favoriteServe}</span>
                        </div>
                      )}
                      {sheet.weakness && (
                        <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                          <span className="font-bold text-red-900 block">Ponto Fraco:</span>
                          <span className="text-red-800">{sheet.weakness}</span>
                        </div>
                      )}
                    </div>

                    {sheet.myGameplan && (
                      <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-xs">
                        <span className="font-bold text-emerald-950 block mb-0.5">Meu Plano de Ação:</span>
                        <p className="text-emerald-900 leading-relaxed">{sheet.myGameplan}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DIÁRIO DE PARTIDAS & ANÁLISE PÓS-JOGO (FERRAMENTA #3) */}
      {activeTab === 'diario-partidas' && (
        <div className="space-y-6">
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jogos Registrados</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalMatches}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Vitórias</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{totalVictories}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-red-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Derrotas</span>
              <p className="text-2xl font-black text-red-600 mt-1">{totalDefeats}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-orange-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">Aproveitamento</span>
              <p className="text-2xl font-black text-orange-600 mt-1">{winRate}%</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Registro de Jogos & Súmulas Pós-Partida</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Partidas concluídas no <b>Placar Oficial de Mesa</b> são automaticamente gravadas aqui.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onNavigate && (
                <button
                  onClick={() => onNavigate('placar')}
                  className="px-3.5 py-2 rounded-xl bg-[#0c2340] hover:bg-[#14325a] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-orange-400" />
                  Abrir Placar de Mesa
                </button>
              )}

              <button
                onClick={() => setShowMatchForm(!showMatchForm)}
                className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {showMatchForm ? 'Fechar Formulário' : 'Registrar Jogo Manualmente'}
              </button>
            </div>
          </div>

          {/* Feedback Msg */}
          {matchSavedMsg && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {matchSavedMsg}
            </div>
          )}

          {/* Manual Match Registration Form (Collapsible) */}
          {showMatchForm && (
            <div className="bg-white p-6 rounded-3xl border border-orange-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Novo Registro de Partida</h3>
              <form onSubmit={handleCreateMatch} className="space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nome do Adversário *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Gabriel (São João da Boa Vista)"
                      value={matchOpponent}
                      onChange={(e) => setMatchOpponent(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Clube / Origem</label>
                    <input
                      type="text"
                      placeholder="Ex: Associação Itapirense"
                      value={matchClub}
                      onChange={(e) => setMatchClub(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Estilo do Adversário</label>
                    <select
                      value={matchStyle}
                      onChange={(e) => setMatchStyle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    >
                      <option value="Atacante Topspin Forehand">Atacante Topspin Forehand</option>
                      <option value="Bloqueador Rápido na Mesa">Bloqueador Rápido na Mesa</option>
                      <option value="Pino Longo / Defensor Clássico">Pino Longo / Defensor Clássico</option>
                      <option value="Caneteiro Tradicional Agressivo">Caneteiro Tradicional Agressivo</option>
                      <option value="Allround Geral">Allround Geral</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Formato</label>
                    <select
                      value={matchFormat}
                      onChange={(e) => setMatchFormat(Number(e.target.value) as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    >
                      <option value={3}>Melhor de 3 Sets</option>
                      <option value={5}>Melhor de 5 Sets (Padrão CBTM)</option>
                      <option value={7}>Melhor de 7 Sets</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Meus Sets Ganhos</label>
                    <input
                      type="number"
                      min={0}
                      max={4}
                      value={matchSetsWonPlayer}
                      onChange={(e) => setMatchSetsWonPlayer(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sets do Adversário</label>
                    <input
                      type="number"
                      min={0}
                      max={4}
                      value={matchSetsWonOpponent}
                      onChange={(e) => setMatchSetsWonOpponent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Parciais dos Sets</label>
                    <input
                      type="text"
                      placeholder="Ex: 11x9, 8x11, 11x7, 12x10"
                      value={matchSetsDetail}
                      onChange={(e) => setMatchSetsDetail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pontos Positivos do Meu Jogo</label>
                    <input
                      type="text"
                      placeholder="Ex: Excelente saque curto com efeito cortado"
                      value={matchPositive}
                      onChange={(e) => setMatchPositive(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Dificuldades Enfrentadas</label>
                    <input
                      type="text"
                      placeholder="Ex: Bola rápida no cotovelo me pegou sem base"
                      value={matchDifficulties}
                      onChange={(e) => setMatchDifficulties(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Foco para o Treino com Prof. Max</label>
                    <input
                      type="text"
                      placeholder="Ex: Bloqueio ativo de backhand e transição"
                      value={matchCoachFocus}
                      onChange={(e) => setMatchCoachFocus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Partida no Diário
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Matches */}
          <div className="space-y-3">
            {matches.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center text-slate-400">
                <Trophy className="w-10 h-10 mx-auto mb-2 opacity-40 text-orange-500" />
                <h4 className="font-bold text-slate-700 text-sm">Nenhuma partida registrada no diário ainda</h4>
                <p className="text-xs mt-1 max-w-md mx-auto leading-relaxed">
                  Utilize o <b>Placar Oficial de Mesa</b> durante treinos e jogos para salvar súmulas automaticamente, ou registre um confronto anterior no botão acima.
                </p>
              </div>
            ) : (
              matches.map((m) => (
                <div
                  key={m.id}
                  className={`bg-white rounded-3xl p-5 border transition-all ${
                    m.isVictory ? 'border-emerald-200 shadow-xs' : 'border-slate-200/90 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          m.isVictory
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {m.isVictory ? 'Vitória' : 'Derrota'}
                      </span>
                      <div>
                        <h4 className="font-black text-slate-900 text-base">
                          {m.athleteName} vs {m.opponentName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {m.competitionOrEvent || 'Treino'} • {m.opponentClub || 'Regional'} • Estilo: <b>{m.opponentStyle}</b>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
                          {m.setsWonPlayer} x {m.setsWonOpponent}
                        </span>
                        <p className="text-[11px] font-mono text-slate-500">[{m.setsDetail}]</p>
                      </div>

                      <button
                        onClick={() => handleDeleteMatch(m.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Excluir partida do diário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Positive & Focus Takeaways */}
                  {(m.positiveTakeaways || m.coachFocusNext) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                      {m.positiveTakeaways && (
                        <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                          <span className="font-bold text-emerald-950 block">O que funcionou bem:</span>
                          <span className="text-emerald-900">{m.positiveTakeaways}</span>
                        </div>
                      )}
                      {m.coachFocusNext && (
                        <div className="bg-orange-50/60 p-2.5 rounded-xl border border-orange-100">
                          <span className="font-bold text-orange-950 block">Foco no próximo treino:</span>
                          <span className="text-orange-900">{m.coachFocusNext}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
