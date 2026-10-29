import { useState, useEffect } from 'react';
import {
  Brain,
  ShieldAlert,
  Save,
  CheckCircle2,
  Trash2,
  Lock,
  AlertCircle,
  Sparkles,
  Target,
  HelpCircle,
  Heart
} from 'lucide-react';
import { INITIAL_PSYCHOLOGY } from '../data/mockData';
import DemoBadge from '../components/DemoBadge';
import { AuthUser, PsychologyJournalEntry } from '../types';
import { apiService } from '../services/api';

interface SportsPsychologyProps {
  currentUser?: AuthUser | null;
}

export default function SportsPsychology({ currentUser }: SportsPsychologyProps) {
  const [selectedGuideId, setSelectedGuideId] = useState(INITIAL_PSYCHOLOGY[0].id);

  // Reflection Journal State with backend persistence
  const [journalEntries, setJournalEntries] = useState<PsychologyJournalEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const [formMatch, setFormMatch] = useState('');
  const [formFeeling, setFormFeeling] = useState('Determinado');
  const [formWentWell, setFormWentWell] = useState('');
  const [formToImprove, setFormToImprove] = useState('');
  const [formFocusNext, setFormFocusNext] = useState('');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Fetch private journal entries from persistent backend
  useEffect(() => {
    if (!currentUser) {
      setJournalEntries([]);
      return;
    }

    let isMounted = true;
    setLoadingEntries(true);
    apiService.psychology.getEntries()
      .then((data) => {
        if (isMounted && data) {
          setJournalEntries(data);
        }
      })
      .catch((err) => {
        console.error('Error loading psychology journal:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingEntries(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const activeGuide = INITIAL_PSYCHOLOGY.find((g) => g.id === selectedGuideId) || INITIAL_PSYCHOLOGY[0];

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMatch.trim() || !formWentWell.trim()) return;

    if (!currentUser) {
      setSaveError('Faça login com sua conta de atleta para salvar reflexões no banco de dados.');
      return;
    }

    setSaveError('');
    try {
      const created = await apiService.psychology.addEntry({
        matchOrTraining: formMatch.trim(),
        feeling: formFeeling,
        whatWentWell: formWentWell.trim(),
        whatToImprove: formToImprove.trim(),
        focusForNextTime: formFocusNext.trim()
      });

      setJournalEntries([created, ...journalEntries]);
      setFormMatch('');
      setFormWentWell('');
      setFormToImprove('');
      setFormFocusNext('');
      setIsSavedSuccess(true);
      setTimeout(() => setIsSavedSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Erro ao registrar reflexão no servidor.');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await apiService.psychology.deleteEntry(id);
      setJournalEntries(journalEntries.filter((e) => e.id !== id));
    } catch (err: any) {
      setSaveError(err?.message || 'Erro ao remover reflexão.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-violet-100 text-violet-700 rounded-xl">
              <Brain className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Psicologia de Jogo e Mentalidade Competitiva
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ferramentas educativas de concentração, rituais antes do saque, gestão da pressão e diário de autoavaliação.
          </p>
        </div>
        <DemoBadge minimal={true} text="Módulo Educativo Esportivo" />
      </div>

      {/* Prominent Clinical Disclaimer */}
      <div className="bg-violet-50/80 border border-violet-200 rounded-2xl p-4 text-xs text-violet-950 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Aviso Ético e Legal:</span> As diretrizes desta seção têm caráter estritamente educativo e desportivo para preparação técnica no tênis de mesa. Não configuram nem substituem acompanhamento ou intervenção de psicólogo clínico qualificado.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Guides and Routine Cards */}
        <div className="lg:col-span-7 space-y-5">
          {/* Guide Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {INITIAL_PSYCHOLOGY.map((guide) => (
              <button
                key={guide.id}
                onClick={() => setSelectedGuideId(guide.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedGuideId === guide.id
                    ? 'bg-violet-700 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {guide.pillar}: {guide.title.split(':')[0]}
              </button>
            ))}
          </div>

          {/* Active Guide Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-violet-100 text-violet-800 rounded-full">
                Pilar: {activeGuide.pillar}
              </span>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" /> Didática do Esporte
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {activeGuide.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {activeGuide.summary}
            </p>

            {/* Practical Routine Tips */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-violet-600" /> Práticas no Treino e na Partida:
              </h4>
              <div className="space-y-2">
                {activeGuide.practicalTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 bg-violet-50/40 p-2.5 rounded-xl border border-violet-100/60">
                    <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reflection Questions */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-500" /> Perguntas para Auto-Reflexão:
              </h4>
              <ul className="space-y-1.5">
                {activeGuide.reflectionQuestions.map((q, i) => (
                  <li key={i} className="text-xs text-slate-600 italic">
                    &ldquo;{q}&rdquo;
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Reflection Journal */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-violet-600" />
                Diário de Reflexão do Atleta
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                Privado (Local)
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Registre como você se sentiu após o treino ou torneio. A escrita reflexiva fortalece o aprendizado motor e a autoconfiança.
            </p>

            <form onSubmit={handleSaveEntry} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Atividade (Treino ou Partida):
                </label>
                <input
                  type="text"
                  required
                  value={formMatch}
                  onChange={(e) => setFormMatch(e.target.value)}
                  placeholder="Ex: Treino de saque curto ou Jogo contra pino"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Estado emocional predominante:
                </label>
                <select
                  value={formFeeling}
                  onChange={(e) => setFormFeeling(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-violet-500"
                >
                  <option value="Determinado">Determinado e focado</option>
                  <option value="Calmo">Calmo e paciente</option>
                  <option value="Ansioso">Ansioso ou apressado</option>
                  <option value="Frustrado">Frustrado com erros não forçados</option>
                  <option value="Evoluindo">Sentindo clara evolução</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  O que deu muito certo hoje?
                </label>
                <textarea
                  rows={2}
                  required
                  value={formWentWell}
                  onChange={(e) => setFormWentWell(e.target.value)}
                  placeholder="Ex: Minha postura baixa e a calma para esperar a bola descer..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Foco mental prioritário para a próxima sessão:
                </label>
                <input
                  type="text"
                  value={formFocusNext}
                  onChange={(e) => setFormFocusNext(e.target.value)}
                  placeholder="Ex: Não abaixar a cabeça quando errar o bloqueio"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-violet-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-violet-700 hover:bg-violet-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Salvar Reflexão no Meu Diário
              </button>

              {isSavedSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs text-center rounded-xl font-medium border border-emerald-200 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Reflexão salva com sucesso no seu diário individual!</span>
                </div>
              )}

              {saveError && (
                <div className="p-2.5 bg-red-50 text-red-800 text-xs text-center rounded-xl font-medium border border-red-200 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{saveError}</span>
                </div>
              )}
            </form>

            {/* Historical Entries */}
            <div className="mt-5 pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700">Reflexões Anteriores ({journalEntries.length})</h4>
                {currentUser && (
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Privado: {currentUser.name.split(' ')[0]}
                  </span>
                )}
              </div>

              {!currentUser ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  <Lock className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                  Faça login para visualizar e salvar seu diário privado isolado.
                </div>
              ) : loadingEntries ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Carregando reflexões...
                </div>
              ) : journalEntries.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Nenhuma reflexão registrada ainda. Registre seu primeiro treino ou partida acima!
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {journalEntries.map((entry) => (
                    <div key={entry.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 relative group">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-violet-800">{entry.matchOrTraining}</span>
                        <div className="flex items-center gap-2">
                          <span>{entry.date}</span>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity p-0.5 cursor-pointer"
                            title="Remover reflexão"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-700">
                        <b className="text-slate-900">Sensação:</b> {entry.feeling}
                      </p>
                      <p className="text-slate-600 line-clamp-2">
                        <b className="text-slate-900">Ponto positivo:</b> {entry.whatWentWell}
                      </p>
                      {entry.focusForNextTime && (
                        <p className="text-violet-700 text-[11px] font-medium pt-0.5">
                          <b>Foco futuro:</b> {entry.focusForNextTime}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
