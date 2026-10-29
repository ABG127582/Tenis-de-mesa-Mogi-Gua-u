import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Bus,
  FileSpreadsheet,
  Megaphone,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Sparkles,
  BookMarked,
  Car,
  RefreshCw,
  Send,
  Loader2
} from 'lucide-react';
import { AuthUser, SportEvent, EventAttendance, NoticeItem, UserReport, BlogPost } from '../types';
import { apiService } from '../services/api';
import { INITIAL_EVENTS, INITIAL_NOTICES } from '../data/mockData';

interface CoachPanelProps {
  currentUser: AuthUser | null;
  onNavigate: (tabId: string) => void;
}

export default function CoachPanel({ currentUser, onNavigate }: CoachPanelProps) {
  const [activeTab, setActiveTab] = useState<'delegacoes' | 'avisos' | 'moderacao' | 'historias' | 'ia-coach'>('delegacoes');
  
  // Data States
  const [events, setEvents] = useState<SportEvent[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendances, setAttendances] = useState<EventAttendance[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>(INITIAL_NOTICES);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [stories, setStories] = useState<BlogPost[]>([]);
  
  // UI States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [transportFilter, setTransportFilter] = useState<'all' | 'van' | 'proprio'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notice Form State
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<'Horários' | 'Torneio' | 'Manutenção' | 'Geral'>('Horários');
  const [newNoticeBody, setNewNoticeBody] = useState('');
  const [newNoticeUrgent, setNewNoticeUrgent] = useState(false);
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Role verification
  const isAuthorized = currentUser?.role === 'treinador' || currentUser?.role === 'administrador';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, attendancesData, noticesData, reportsData, storiesData] = await Promise.all([
        apiService.events.getAll().catch(() => INITIAL_EVENTS),
        apiService.attendances.getAll().catch(() => []),
        apiService.notices.getAll().catch(() => INITIAL_NOTICES),
        apiService.reports.getAll().catch(() => []),
        apiService.stories.getAll().catch(() => [])
      ]);

      setEvents(eventsData);
      if (eventsData.length > 0 && !selectedEventId) {
        setSelectedEventId(eventsData[0].id);
      }
      setAttendances(attendancesData);
      setNotices(noticesData);
      setReports(reportsData);
      setStories(storiesData);
    } catch {
      // Resilient fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter attendances for selected event
  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const eventAttendances = attendances.filter((a) => a.eventId === selectedEventId);

  const filteredAttendances = eventAttendances.filter((att) => {
    if (transportFilter === 'van') {
      return att.transportNeed === 'Van da Equipe';
    }
    if (transportFilter === 'proprio') {
      return att.transportNeed === 'Transporte Próprio';
    }
    return true;
  });

  const vanCount = eventAttendances.filter((a) => a.transportNeed === 'Van da Equipe').length;
  const proprioCount = eventAttendances.filter((a) => a.transportNeed === 'Transporte Próprio').length;

  // Export Delegation to CSV
  const handleExportCSV = () => {
    if (!currentEvent) return;
    
    const headers = ['Nome do Atleta', 'Categoria', 'Modalidade de Transporte', 'Confirmado Em', 'Status', 'Evento', 'Data Evento'];
    const rows = eventAttendances.map((att) => [
      att.athleteName,
      att.category || 'Geral',
      att.transportNeed || 'Não especificado',
      att.confirmedAt || 'Confirmado',
      att.status || 'Confirmado',
      currentEvent.title,
      currentEvent.date
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const filenameSafe = currentEvent.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    link.setAttribute('download', `delegacao_tm_mogi_guacu_${filenameSafe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setFeedbackMsg({
      type: 'success',
      text: 'Planilha de delegação exportada com sucesso em formato CSV (compatível com Excel / SEMEL).'
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Create Notice
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeBody.trim()) return;

    setIsSubmittingNotice(true);
    try {
      const created = await apiService.notices.create({
        title: newNoticeTitle.trim(),
        category: newNoticeCategory,
        body: newNoticeBody.trim(),
        isUrgent: newNoticeUrgent,
        author: currentUser?.name || 'Prof. Max',
        authorRole: currentUser?.name ? `Prof. ${currentUser.name}` : 'Comissão Técnica',
        publishedAt: new Date().toLocaleDateString('pt-BR'),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        status: 'Ativo'
      });
      setNotices([created, ...notices]);
      setNewNoticeTitle('');
      setNewNoticeBody('');
      setNewNoticeUrgent(false);
      setFeedbackMsg({ type: 'success', text: 'Aviso oficial publicado com sucesso no mural da equipe!' });
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Não foi possível publicar o aviso. Tente novamente.' });
    } finally {
      setIsSubmittingNotice(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (id: string) => {
    try {
      await apiService.notices.delete(id);
      setNotices(notices.filter((n) => n.id !== id));
      setFeedbackMsg({ type: 'success', text: 'Aviso removido do mural.' });
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Erro ao remover aviso.' });
    }
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Resolve Report
  const handleResolveReport = async (reportId: string, action: 'dismiss' | 'remove_message') => {
    try {
      const note = action === 'remove_message' ? 'Mensagem excluída e autor advertido' : 'Denúncia analisada e arquivada';
      await apiService.reports.resolve(reportId, action, note);
      const newStatus = action === 'remove_message' ? 'Mensagem Removida' : 'Arquivado';
      setReports(
        reports.map((r) =>
          r.id === reportId
            ? { ...r, status: newStatus, decisionNote: note }
            : r
        )
      );
      setFeedbackMsg({
        type: 'success',
        text: action === 'remove_message' ? 'Mensagem infratora excluída e denúncia resolvida.' : 'Denúncia arquivada.'
      });
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Não foi possível resolver a denúncia.' });
    }
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Publish Story
  const handlePublishStory = async (storyId: string) => {
    try {
      await apiService.stories.updateStatus(storyId, 'Publicado');
      setStories(stories.map((s) => (s.id === storyId ? { ...s, status: 'Publicado' } : s)));
      setFeedbackMsg({ type: 'success', text: 'História aprovada e publicada no blog comunitário!' });
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Erro ao atualizar status da história.' });
    }
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Request AI Advice
  const handleAskAiCoach = async (presetPrompt?: string) => {
    const promptToSend = presetPrompt || aiPrompt;
    if (!promptToSend.trim()) return;

    setIsAiLoading(true);
    setAiResponse('');
    try {
      const res = await apiService.ai.getCoachAdvice({
        question: promptToSend,
        topic: 'Estratégia e Treinamento'
      });
      setAiResponse(res.advice);
    } catch {
      setAiResponse('Não foi possível conectar ao assistente técnico no momento. Verifique a conexão com a internet.');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Acesso Restrito à Comissão Técnica
        </h2>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          Esta área é reservada exclusivamente para o <b>Prof. Max</b> e administradores da equipe de Tênis de Mesa de Mogi Guaçu para gestão de delegações, logística de transporte, moderação e curadoria.
        </p>
        <button
          onClick={() => onNavigate('inicio')}
          className="px-5 py-2.5 bg-[#0c2340] text-white font-bold rounded-xl text-sm shadow hover:bg-[#14325a] transition-colors"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  const pendingReportsCount = reports.filter((r) => r.status === 'Pendente').length;
  const pendingStoriesCount = stories.filter((s) => s.status !== 'Publicado').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0c2340] via-[#102d50] to-[#183e6c] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              Área Administrativa Oficial • Mogi Guaçu
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
              Painel da Comissão Técnica
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Supervisão de treinos, lista de embarque da delegação (SEMEL / Van), moderação ativa do chat e planejamento tático.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <div className="flex items-center gap-2.5 bg-white/10 px-3 py-1.5 rounded-2xl border border-white/15 backdrop-blur-xs">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_si6kkasi6kkasi6k_c5b33fbe.jpeg"
                alt="Prof. Max"
                className="w-10 h-10 rounded-full object-cover object-top border-2 border-orange-400 shadow-sm"
              />
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-white block leading-tight">Prof. Max</span>
                <span className="text-[10px] text-orange-300 font-medium block">Treinador Titular</span>
              </div>
            </div>

            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <p className="text-[11px] text-slate-300 font-medium">Eventos Programados</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{events.length}</p>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <p className="text-[11px] text-slate-300 font-medium">Inscrições Ativas</p>
            <p className="text-xl sm:text-2xl font-black text-orange-400 mt-0.5">{attendances.length}</p>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <p className="text-[11px] text-slate-300 font-medium">Denúncias no Chat</p>
            <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
              {pendingReportsCount > 0 ? `${pendingReportsCount} pendente(s)` : 'Nenhuma'}
            </p>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <p className="text-[11px] text-slate-300 font-medium">Histórias p/ Aprovar</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">
              {pendingStoriesCount}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 border transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('delegacoes')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'delegacoes'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bus className="w-4 h-4 text-orange-400" />
          Logística & Van da Delegação
        </button>

        <button
          onClick={() => setActiveTab('avisos')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'avisos'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4 text-orange-400" />
          Mural de Avisos Oficiais ({notices.length})
        </button>

        <button
          onClick={() => setActiveTab('moderacao')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'moderacao'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-orange-400" />
          Fila de Moderação {pendingReportsCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">{pendingReportsCount}</span>}
        </button>

        <button
          onClick={() => setActiveTab('historias')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'historias'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookMarked className="w-4 h-4 text-orange-400" />
          Histórias de Mesa ({stories.length})
        </button>

        <button
          onClick={() => setActiveTab('ia-coach')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'ia-coach'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-orange-400" />
          Assistente IA Prof. Max
        </button>
      </div>

      {/* TAB 1: DELEGAÇÕES & TRANSPORTE */}
      {activeTab === 'delegacoes' && (
        <div className="space-y-6">
          {/* Filter Bar & Event Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Selecione o Evento / Etapa
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.date} • {evt.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-end">
              <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setTransportFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    transportFilter === 'all' ? 'bg-[#0c2340] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos ({eventAttendances.length})
                </button>
                <button
                  onClick={() => setTransportFilter('van')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    transportFilter === 'van' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5" />
                  Van da Equipe ({vanCount})
                </button>
                <button
                  onClick={() => setTransportFilter('proprio')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    transportFilter === 'proprio' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  Próprio ({proprioCount})
                </button>
              </div>

              <button
                onClick={handleExportCSV}
                disabled={eventAttendances.length === 0}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                title="Exportar CSV com formatação brasileira para Excel / Protocolo SEMEL"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Exportar Relação (CSV)
              </button>
            </div>
          </div>

          {/* Event Quick Summary Card */}
          {currentEvent && (
            <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-800 text-sm">{currentEvent.title}</p>
                <p className="text-slate-500 mt-0.5">
                  Local: <b>{currentEvent.location}</b> • {currentEvent.city} | Horário: <b>{currentEvent.time}</b>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-800 font-bold">
                  {vanCount} solicitando Van
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold">
                  {proprioCount} transporte próprio
                </span>
              </div>
            </div>
          )}

          {/* Table of Enrolled Athletes */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Atleta</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Opção de Transporte</th>
                    <th className="py-3 px-4">Data da Inscrição</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendances.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        Nenhum atleta inscrito nesta categoria de transporte para o evento selecionado.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendances.map((att) => {
                      const isVan = att.transportNeed === 'Van da Equipe';
                      return (
                        <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#0c2340] text-white flex items-center justify-center font-bold text-[10px]">
                              {att.athleteName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span>{att.athleteName}</span>
                              {att.athleteNickname && (
                                <span className="text-slate-400 text-[11px] font-normal ml-1">
                                  ({att.athleteNickname})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <span>{att.category || 'Geral'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isVan
                                  ? 'bg-orange-100 text-orange-900 border border-orange-200'
                                  : 'bg-blue-50 text-blue-900 border border-blue-200'
                              }`}
                            >
                              {isVan ? <Bus className="w-3.5 h-3.5 text-orange-600" /> : <Car className="w-3.5 h-3.5 text-blue-600" />}
                              {att.transportNeed || 'Não especificado'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-xs">
                            {att.confirmedAt || 'Confirmado'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              {att.status || 'Confirmado'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AVISOS OFICIAIS */}
      {activeTab === 'avisos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Create Notice */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-orange-500" />
              Publicar Novo Aviso Oficial
            </h3>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título do Aviso</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Treino extra preparatório para a Liga Paulista"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                <select
                  value={newNoticeCategory}
                  onChange={(e) => setNewNoticeCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Horários">Horários & Treinos</option>
                  <option value="Torneio">Torneio & Viagens</option>
                  <option value="Manutenção">Manutenção de Mesas / Ginásio</option>
                  <option value="Geral">Geral da Associação</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conteúdo da Mensagem</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escreva as orientações para os atletas e familiares..."
                  value={newNoticeBody}
                  onChange={(e) => setNewNoticeBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentNotice"
                  checked={newNoticeUrgent}
                  onChange={(e) => setNewNoticeUrgent(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="urgentNotice" className="font-bold text-red-600 text-xs cursor-pointer">
                  Marcar como AVISO URGENTE (destaque em vermelho no mural e painel)
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmittingNotice}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {isSubmittingNotice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publicar Imediatamente
              </button>
            </form>
          </div>

          {/* Right Column: Existing Notices */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Avisos Atuais no Mural ({notices.length})</span>
            </h3>

            <div className="space-y-3">
              {notices.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative group">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {n.category}
                        </span>
                        {n.isUrgent && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase">
                            Urgente
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {n.publishedAt || 'Ativo'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{n.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.body}</p>
                      <p className="text-[11px] text-slate-400 mt-2">Publicado por: {n.authorRole}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Excluir aviso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FILA DE MODERAÇÃO */}
      {activeTab === 'moderacao' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                Fila de Denúncias da Comunidade & Chat
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mensagens reportadas por atletas ou familiares para revisão ética e garantia de ambiente respeitoso.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {reports.length} registro(s)
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-slate-700 text-sm">Fila Limpa!</p>
              <p className="text-xs mt-1">Nenhuma denúncia aberta no momento. O chat da equipe segue em conformidade.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    rep.status === 'Pendente'
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rep.status === 'Pendente' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {rep.status}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          Denunciado por: {rep.reporterName} ({rep.reporterRole})
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(rep.createdAtISO).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700">
                        <b>Motivo indicado:</b> &ldquo;{rep.reason}&rdquo;
                      </p>

                      {rep.reportedMessageId && (
                        <p className="text-[11px] text-slate-500 font-mono bg-white px-2 py-1 rounded border border-slate-200 inline-block">
                          ID da Mensagem: {rep.reportedMessageId}
                        </p>
                      )}

                      {rep.decisionNote && (
                        <p className="text-xs text-emerald-700 font-medium">
                          <b>Decisão tomada:</b> {rep.decisionNote}
                        </p>
                      )}
                    </div>

                    {rep.status === 'Pendente' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleResolveReport(rep.id, 'dismiss')}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Arquivar (Sem Infração)
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'remove_message')}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Remover Mensagem
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HISTÓRIAS DE MESA */}
      {activeTab === 'historias' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-orange-500" />
                Curadoria de Histórias e Relatos de Mesa
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Revise as memórias e relatos esportivos enviados pelos atletas antes de disponibilizá-los publicamente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.map((story) => (
              <div key={story.id} className="p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        story.status === 'Publicado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {story.status}
                    </span>
                    <span className="text-[11px] text-slate-400">{story.date}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{story.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">{story.summary || story.content}</p>
                  <p className="text-[11px] text-slate-400 mt-2">Por: {story.authorName}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">História da Equipe</span>
                  {story.status !== 'Publicado' && (
                    <button
                      onClick={() => handlePublishStory(story.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Aprovar & Publicar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: IA COACH ASSISTANT */}
      {activeTab === 'ia-coach' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/Gemini_Generated_Image_si6kkasi6kkasi6k_c5b33fbe.jpeg"
              alt="Prof. Max"
              className="w-12 h-12 rounded-2xl object-cover object-top border-2 border-orange-500 shadow-sm shrink-0"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                Copiloto Técnico com IA do Prof. Max
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gere planos táticos sob medida, sequências de exercícios e análises técnicas com a mentoria metodológica do Prof. Max.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => handleAskAiCoach('Planejar 3 exercícios de transição contra atleta com borracha de pino longo no backhand.')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-900 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
            >
              Contra Pino Longo
            </button>
            <button
              onClick={() => handleAskAiCoach('Como neutralizar saque curto com efeito lateral cortado (pendulum) de canhoto?')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-900 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
            >
              Saque Pendulum Canhoto
            </button>
            <button
              onClick={() => handleAskAiCoach('Estruturar treino de 90 minutos para a equipe focado em movimentação de pernas e velocidade de reação.')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-900 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
            >
              Treino 90m Movimentação
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite sua dúvida tática ou solicitação de treino..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAiCoach()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={() => handleAskAiCoach()}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
            >
              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Consultar
            </button>
          </div>

          {/* AI Response Display */}
          {aiResponse && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-orange-200 text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap mt-3">
              <div className="flex items-center gap-2 text-orange-600 font-bold mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Orientação Técnica Gerada:</span>
              </div>
              {aiResponse}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
