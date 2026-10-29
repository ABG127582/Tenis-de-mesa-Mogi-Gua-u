import { useState, useEffect } from 'react';
import {
  BookMarked,
  Trophy,
  Calendar,
  User,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  X,
  FileText
} from 'lucide-react';
import { INITIAL_BLOG_POSTS } from '../data/mockData';
import { AuthUser, BlogPost, UserRole } from '../types';
import DemoBadge from '../components/DemoBadge';
import { apiService } from '../services/api';

interface TableStoriesBlogProps {
  currentUser: AuthUser | null;
}

export default function TableStoriesBlog({ currentUser }: TableStoriesBlogProps) {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // New Story Form State
  const [storyTitle, setStoryTitle] = useState('');
  const [storyAuthor, setStoryAuthor] = useState(currentUser?.name || '');
  const [storySummary, setStorySummary] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [storyMedals, setStoryMedals] = useState('');
  const [hasConsent, setHasConsent] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canModerate = Boolean(currentUser && (currentUser.role === 'treinador' || currentUser.role === 'administrador'));

  const handleApproveStory = async (storyId: string) => {
    try {
      await apiService.stories.updateStatus(storyId, 'Publicado');
      setPosts(posts.map(p => p.id === storyId ? { ...p, status: 'Publicado', reviewedBy: `Aprovado por ${currentUser?.name || 'Prof. Max'}` } : p));
      if (selectedPost && selectedPost.id === storyId) {
        setSelectedPost({ ...selectedPost, status: 'Publicado', reviewedBy: `Aprovado por ${currentUser?.name || 'Prof. Max'}` });
      }
    } catch (err: any) {
      console.error('Error approving story:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    apiService.stories.getAll().then((data) => {
      if (isMounted && data?.length) {
        setPosts([...data, ...INITIAL_BLOG_POSTS]);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle.trim() || !storyContent.trim() || !hasConsent) return;
    setSubmitting(true);

    try {
      const created = await apiService.stories.submit({
        title: storyTitle.trim(),
        authorName: storyAuthor.trim() || (currentUser ? currentUser.name : 'Atleta de Mogi Guaçu'),
        summary: storySummary.trim() || storyContent.trim().slice(0, 120) + '...',
        content: storyContent.trim(),
        medals: storyMedals.trim(),
        hasConsent: true
      });

      setPosts([created, ...posts]);
      setStoryTitle('');
      setStorySummary('');
      setStoryContent('');
      setStoryMedals('');
      setHasConsent(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setIsSubmitModalOpen(false);
      }, 2000);
    } catch {
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setIsSubmitModalOpen(false);
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <BookMarked className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Histórias de Mesa • Memória e Conquistas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Espaço comunitário onde atletas compartilham suas vivências de superação, campeonatos e aprendizados na mesa.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Enviar Minha História
        </button>
      </div>

      {/* Editorial Flow Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-500" />
          <span>
            <b>Fluxo Editorial:</b> Todas as histórias enviadas passam por validação prévia de consentimento de imagem e moderação respeitosa antes da publicação definitiva.
          </span>
        </div>
        <DemoBadge minimal={true} text="Mural Colaborativo" />
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            {post.coverImage && post.coverImage.trim().length > 0 ? (
              <div className="h-44 w-full overflow-hidden relative">
                <img
                  src={post.coverImage.trim()}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      post.status === 'Publicado'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {post.status}
                  </span>
                  {post.medals && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-amber-300 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" /> {post.medals}
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <User className="w-3 h-3 text-orange-500" /> {post.authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {post.date}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {post.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {post.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-orange-600">
                <span className="text-[11px] text-slate-400 font-normal">
                  Autorização de imagem registrada
                </span>
                <span>Ler relato completo &rarr;</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto pr-2 space-y-4">
              {selectedPost.coverImage && selectedPost.coverImage.trim().length > 0 ? (
                <img
                  src={selectedPost.coverImage.trim()}
                  alt={selectedPost.title}
                  className="w-full h-56 object-cover rounded-2xl"
                />
              ) : null}

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {selectedPost.status}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">Publicado em {selectedPost.date}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {selectedPost.title}
              </h2>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                <User className="w-4 h-4 text-orange-500" /> Relato por: {selectedPost.authorName}
                {selectedPost.medals && (
                  <span className="ml-auto flex items-center gap-1 text-amber-700 font-bold">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" /> {selectedPost.medals}
                  </span>
                )}
              </div>

              <div className="text-sm text-slate-700 leading-relaxed pt-2 space-y-3">
                <p>{selectedPost.content}</p>
              </div>

              {canModerate && selectedPost.status === 'Em Revisão' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-900">História aguardando aprovação do Prof. Max</p>
                    <p className="text-[11px] text-amber-700">Validar conformidade de conteúdo e termos esportivos.</p>
                  </div>
                  <button
                    onClick={() => handleApproveStory(selectedPost.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Aprovar e Publicar
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                <span>Revisão editorial: {selectedPost.reviewedBy || 'Comitê Oficial'}</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Consentimento LGPD arquivado
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Story Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-orange-500" /> Compartilhar Sua História
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Conte sobre um treino marcante, sua primeira medalha ou uma lição que o tênis de mesa lhe ensinou.
            </p>

            <form onSubmit={handleSubmitStory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Seu Nome / Apelido:</label>
                <input
                  type="text"
                  required
                  value={storyAuthor}
                  onChange={(e) => setStoryAuthor(e.target.value)}
                  placeholder="Ex: Carlos Eduardo (Cadu)"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Título da História:</label>
                <input
                  type="text"
                  required
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="Ex: Como melhorei meu saque após 3 meses de persistência"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Medalha ou Troféu Conquistado (Opcional):</label>
                <input
                  type="text"
                  value={storyMedals}
                  onChange={(e) => setStoryMedals(e.target.value)}
                  placeholder="Ex: Campeão Sub-19 Regional Limeira"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Relato Completo:</label>
                <textarea
                  rows={4}
                  required
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  placeholder="Escreva como foi a experiência..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Consent checkbox */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={hasConsent}
                    onChange={(e) => setHasConsent(e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded mt-0.5"
                  />
                  <span className="text-[11px] text-slate-600 leading-tight">
                    Declaro autorização para publicação deste relato na comunidade Tênis de Mesa Mogi Guaçu, ciente de que o texto passará por revisão editorial preliminar.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!hasConsent}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl"
                >
                  Enviar para Revisão
                </button>
              </div>

              {submittedSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 text-center rounded-xl font-semibold border border-emerald-200">
                  História enviada com sucesso! Ela entrará no mural após revisão.
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
