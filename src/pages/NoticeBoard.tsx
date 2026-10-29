import { useState, useEffect } from 'react';
import {
  Megaphone,
  AlertTriangle,
  Clock,
  User,
  Plus,
  ShieldCheck,
  CheckCircle,
  X,
  Calendar,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { INITIAL_NOTICES } from '../data/mockData';
import { NoticeItem, AuthUser } from '../types';
import { apiService } from '../services/api';
import DemoBadge from '../components/DemoBadge';

interface NoticeBoardProps {
  currentUser: AuthUser | null;
}

export default function NoticeBoard({ currentUser }: NoticeBoardProps) {
  const [notices, setNotices] = useState<NoticeItem[]>(INITIAL_NOTICES);
  const [filterCategory, setFilterCategory] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // New Notice Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState<'Horários' | 'Torneio' | 'Manutenção' | 'Geral'>('Geral');
  const [isUrgent, setIsUrgent] = useState(false);

  const canPostNotice = Boolean(currentUser && (currentUser.role === 'treinador' || currentUser.role === 'administrador'));

  const handleDeleteNotice = async (id: string) => {
    try {
      await apiService.notices.delete(id);
      setNotices(notices.filter((n) => n.id !== id));
    } catch (e: any) {
      setErrorMsg(e?.message || 'Erro ao excluir aviso.');
    }
  };

  useEffect(() => {
    let isMounted = true;
    apiService.notices.getAll().then((data) => {
      if (isMounted && data?.length) {
        setNotices(data);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = ['Todos', 'Horários', 'Torneio', 'Manutenção', 'Geral'];

  const filteredNotices = notices.filter(
    (n) => filterCategory === 'Todos' || n.category === filterCategory
  );

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;
    setErrorMsg('');
    setLoading(true);

    try {
      const created = await apiService.notices.create({
        title: newTitle.trim(),
        body: newBody.trim(),
        category: newCategory,
        isUrgent
      });

      setNotices([created, ...notices]);
      setNewTitle('');
      setNewBody('');
      setIsUrgent(false);
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao salvar aviso oficial no servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Megaphone className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quadro Oficial de Avisos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Comunicações oficiais do treinador (Prof. Max) e coordenação de Mogi Guaçu sobre horários, manutenção e viagens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canPostNotice ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Novo Aviso Oficial
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl font-medium">
              Modo Leitura ({currentUser ? `${currentUser.name} • ${currentUser.role}` : 'Visitante'})
            </span>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterCategory === cat
                ? 'bg-[#0c2340] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            className={`bg-white rounded-3xl p-6 border shadow-xs transition-all relative flex flex-col justify-between ${
              notice.isUrgent
                ? 'border-red-300 ring-1 ring-red-200 bg-gradient-to-br from-white to-red-50/20'
                : 'border-slate-200/90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {notice.category}
                  </span>
                  {notice.isUrgent && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Urgente
                    </span>
                  )}
                  {notice.status === 'Arquivado' && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                      Arquivado
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Válido até {notice.expiresAt}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">
                {notice.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {notice.body}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <User className="w-3.5 h-3.5 text-orange-500" />
                {notice.author}
                <span className="text-slate-400 font-normal">({notice.authorRole})</span>
              </span>
              <div className="flex items-center gap-2">
                <span>{notice.publishedAt}</span>
                {canPostNotice && (
                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Excluir comunicado oficial"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Notice Modal for Coach / Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-orange-500" /> Publicar Novo Aviso Oficial
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título do Comunicado:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Treino extra de saque neste sábado em Mogi Guaçu"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoria:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden"
                  >
                    <option value="Horários">Horários</option>
                    <option value="Torneio">Torneio</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span className="font-bold text-red-700">Marcar como urgente</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mensagem / Conteúdo:</label>
                <textarea
                  rows={4}
                  required
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Escreva as instruções completas para os atletas da equipe..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl"
                >
                  {loading ? 'Salvando...' : 'Publicar no Mural'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
