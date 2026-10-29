import { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Cake,
  Shield,
  Clock,
  Sparkles,
  CheckCircle2,
  Lock,
  Search,
  Edit3,
  UserCheck,
  Save,
  X
} from 'lucide-react';
import { INITIAL_ATHLETES } from '../data/mockData';
import { AthleteProfile, SkillLevel, AuthUser } from '../types';
import DemoBadge from '../components/DemoBadge';
import AthleteAvatar from '../components/AthleteAvatar';
import { apiService } from '../services/api';

interface TeamProfilesProps {
  currentUser?: AuthUser | null;
}

export default function TeamProfiles({ currentUser }: TeamProfilesProps) {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('Todos');

  // Load athletes from backend with fallback
  const [athletes, setAthletes] = useState<AthleteProfile[]>(INITIAL_ATHLETES);

  useEffect(() => {
    let isMounted = true;
    apiService.athletes.getAll()
      .then((data) => {
        if (isMounted && data?.length) {
          // Merge using Map by ID to guarantee strictly unique keys
          const athleteMap = new Map<string, AthleteProfile>();
          data.forEach((ath) => athleteMap.set(ath.id, ath));
          INITIAL_ATHLETES.forEach((initAth) => {
            if (!athleteMap.has(initAth.id)) {
              athleteMap.set(initAth.id, initAth);
            }
          });
          setAthletes(Array.from(athleteMap.values()));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const [isEditingUser, setIsEditingUser] = useState(false);
  const userAthlete = athletes.find(a => currentUser ? a.displayName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]) : a.isCurrentUser) || athletes[0];

  // User Profile Edit Form State
  const [editName, setEditName] = useState(userAthlete.displayName);
  const [editNickname, setEditNickname] = useState(userAthlete.approvedNickname || '');
  const [editCategory, setEditCategory] = useState(userAthlete.category);
  const [editLevel, setEditLevel] = useState<SkillLevel>(userAthlete.level);
  const [editFavoriteShot, setEditFavoriteShot] = useState(userAthlete.favoriteShot);
  const [editGrip, setEditGrip] = useState(userAthlete.gripType);
  const [editYears, setEditYears] = useState(userAthlete.yearsPlaying);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (userAthlete) {
      setEditName(userAthlete.displayName);
      setEditNickname(userAthlete.approvedNickname || '');
      setEditCategory(userAthlete.category);
      setEditLevel(userAthlete.level);
      setEditFavoriteShot(userAthlete.favoriteShot);
      setEditGrip(userAthlete.gripType);
      setEditYears(userAthlete.yearsPlaying);
    }
  }, [userAthlete]);

  const handleSaveUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');

    try {
      if (currentUser) {
        await apiService.athletes.updateMe({
          displayName: editName,
          approvedNickname: editNickname,
          category: editCategory,
          level: editLevel,
          favoriteShot: editFavoriteShot,
          gripType: editGrip as any,
          yearsPlaying: editYears
        });
      }

      const updated = athletes.map(a => {
        if (a.id === userAthlete.id || (currentUser && a.displayName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]))) {
          return {
            ...a,
            displayName: editName,
            approvedNickname: editNickname,
            category: editCategory,
            level: editLevel,
            favoriteShot: editFavoriteShot,
            gripType: editGrip as any,
            yearsPlaying: editYears,
          };
        }
        return a;
      });

      setAthletes(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditingUser(false);
      }, 1200);
    } catch (err: any) {
      setSaveError(err?.message || 'Erro ao persistir alterações no servidor.');
    }
  };

  const filteredAthletes = athletes.filter((ath) => {
    const matchSearch =
      ath.displayName.toLowerCase().includes(search.toLowerCase()) ||
      (ath.approvedNickname && ath.approvedNickname.toLowerCase().includes(search.toLowerCase())) ||
      ath.category.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'Todos' || ath.level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Nossa Equipe • Atletas de Mogi Guaçu
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conheça os integrantes das turmas de formação e do time competitivo municipal.
          </p>
        </div>
        <DemoBadge minimal={true} text="Perfis com Consentimento LGPD" />
      </div>

      {/* Privacy Notice Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
        <Lock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900">Política de Privacidade e Proteção a Menores:</span>{' '}
          Para resguardar a integridade de atletas e jovens, este portal não exibe contatos pessoais, escolas, endereços ou ano completo de nascimento. Todas as fotos e apelidos exibidos possuem autorização registrada.
        </div>
      </div>

      {/* Featured User Profile Banner ("Você como Atleta Exemplo") */}
      <div className="bg-gradient-to-r from-[#0c2340] via-[#133054] to-[#1a3f6d] rounded-3xl p-6 text-white shadow-lg border border-orange-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <AthleteAvatar
                name={userAthlete.displayName}
                avatarUrl={userAthlete.avatarUrl}
                role={userAthlete.category}
                size="xl"
                className="border-4 border-orange-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full text-[10px]" title="Atleta Ativo">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-orange-500 text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  Seu Perfil (Atleta Exemplo)
                </span>
                <span className="bg-white/10 text-slate-200 text-xs px-2.5 py-0.5 rounded-full border border-white/20">
                  {userAthlete.level}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {userAthlete.displayName}
                {userAthlete.approvedNickname && (
                  <span className="text-orange-400 font-semibold text-lg ml-2">
                    &ldquo;{userAthlete.approvedNickname}&rdquo;
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {userAthlete.category} • {userAthlete.yearsPlaying} • Empunhadura: <b className="text-white">{userAthlete.gripType.split(' ')[0]}</b>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={() => setIsEditingUser(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" /> Editar Meus Dados de Atleta
            </button>
          </div>
        </div>

        {/* User Stats Pill Row */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-slate-400 block text-[10px] uppercase">Golpe de Confiança:</span>
            <span className="font-semibold text-orange-200">{userAthlete.favoriteShot}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-slate-400 block text-[10px] uppercase">Aniversário do Mês:</span>
            <span className="font-semibold text-white">{userAthlete.birthDay} de {userAthlete.birthMonth}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="text-slate-400 block text-[10px] uppercase">Status de Registro:</span>
            <span className="font-semibold text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ficha Ativa em Mogi Guaçu
            </span>
          </div>
        </div>

        {/* Skill Radar & Weekly Training Tracker */}
        <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Skill Radar / Attributes (7 cols) */}
          <div className="lg:col-span-7 bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-400" /> Radar de Habilidades do Adilson
              </span>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-orange-500 text-white">
                Média: 79.2 pts
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">Forehand (Topspin & Regularidade):</span>
                  <span className="font-bold text-orange-300">85%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">Backhand (Bloqueio & Transição):</span>
                  <span className="font-bold text-blue-300">75%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">Saque & Variação de Efeito:</span>
                  <span className="font-bold text-amber-300">80%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">Deslocamento & Jogo de Pernas:</span>
                  <span className="font-bold text-emerald-300">70%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">Foco Mental & Gestão de Pressão:</span>
                  <span className="font-bold text-violet-300">85%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-violet-400 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Training Tracker (5 cols) */}
          <div className="lg:col-span-5 bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-400" /> Treinos da Semana
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  92% Frequência
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/15">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Segunda-feira • Regularidade</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/15">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Quarta-feira • Multibolas</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/15">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Quinta-feira • Situação de Jogo</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/15">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Sábado • Preparação Torneio</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400">
              Orientação do Prof. Max: <i>&quot;Manter a constância no aquecimento de saque curto.&quot;</i>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditingUser(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-orange-500" /> Editar Perfil de Atleta
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Personalize como seu nome, apelido e estilo de jogo são exibidos para a equipe.
            </p>

            <form onSubmit={handleSaveUserProfile} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nome de Exibição:</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Apelido Aprovado:</label>
                  <input
                    type="text"
                    required
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nível Técnico:</label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value as SkillLevel)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Empunhadura:</label>
                  <select
                    value={editGrip}
                    onChange={(e) => setEditGrip(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden"
                  >
                    <option value="Clássica (Shakehand)">Clássica (Shakehand)</option>
                    <option value="Caneta Japonesa (Penhold)">Caneta Japonesa (Penhold)</option>
                    <option value="Classineta (CPen)">Classineta (CPen)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Categoria Competitiva:</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="Ex: Adulto • Circuito Regional"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Golpe Favorito / Especialidade:</label>
                <input
                  type="text"
                  value={editFavoriteShot}
                  onChange={(e) => setEditFavoriteShot(e.target.value)}
                  placeholder="Ex: Topspin de Forehand no Canto Aberto"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tempo de Prática:</label>
                <input
                  type="text"
                  value={editYears}
                  onChange={(e) => setEditYears(e.target.value)}
                  placeholder="Ex: 2 anos de treino"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingUser(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar Alterações
                </button>
              </div>

              {saveSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 text-center rounded-xl font-semibold border border-emerald-200">
                  Perfil de atleta atualizado com sucesso!
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Aniversariantes do Mês Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Cake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Aniversariantes do Mês na Equipe</h3>
            <p className="text-xs text-orange-100">
              Parabéns aos nossos atletas que comemoram neste período! (Dia e mês celebrados sem expor idade)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {INITIAL_ATHLETES.filter(a => a.birthMonth === 'Outubro' || a.birthMonth === 'Novembro').map((ath) => (
            <div
              key={ath.id}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-semibold"
            >
              <AthleteAvatar name={ath.displayName} avatarUrl={ath.avatarUrl} size="xs" />
              <span>{ath.approvedNickname || ath.displayName}</span>
              <span className="text-[10px] bg-white/30 px-1.5 py-0.2 rounded-full">
                {ath.birthDay} de {ath.birthMonth}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, apelido ou categoria..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-orange-500"
          />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 w-full sm:w-auto"
        >
          <option value="Todos">Todos os Níveis</option>
          <option value="Iniciante">Iniciante</option>
          <option value="Intermediário">Intermediário</option>
          <option value="Avançado">Avançado</option>
        </select>
      </div>

      {/* Coach Spotlight Section */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0c2340] to-slate-900 rounded-3xl p-6 sm:p-7 text-white border border-slate-700/80 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative shrink-0">
            <img
              src="/assets/aistudio/Gemini_Generated_Image_si6kkasi6kkasi6k_c5b33fbe.jpeg"
              alt="Professor Max - Treinador Titular"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover object-top border-4 border-orange-500/80 shadow-xl"
            />
            <span className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow">
              Coordenação
            </span>
          </div>

          <div className="space-y-3 flex-1 text-center md:text-left">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold px-3 py-0.5 rounded-full">
                  Treinador Titular Oficial
                </span>
                <span className="bg-white/10 text-slate-200 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/10">
                  Técnico Nível 2 ITTF
                </span>
                <span className="bg-white/10 text-slate-200 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/10">
                  18 Anos de Experiência
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Professor Max
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Coordenador técnico da equipe de Tênis de Mesa de Mogi Guaçu e responsável pela formação de atletas, preparação tática competitiva e supervisão dos treinamentos no polo oficial do CERESC.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs text-slate-300">
              <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
                Golpe de Especialidade: <strong className="text-white">Terceira Bola e Bloqueio Ativo</strong>
              </span>
              <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl">
                Empunhadura: <strong className="text-white">Clássica (Shakehand)</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Athletes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredAthletes.map((athlete) => (
          <div
            key={athlete.id}
            className={`bg-white rounded-3xl p-5 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
              athlete.isCurrentUser
                ? 'border-orange-400 ring-2 ring-orange-400/30 bg-gradient-to-b from-orange-50/20 to-white'
                : 'border-slate-200/90'
            }`}
          >
            <div>
              {athlete.isCurrentUser && (
                <div className="mb-2 text-center">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-500 text-white shadow-xs">
                    ★ Você (Atleta Exemplo)
                  </span>
                </div>
              )}
              <div className="relative mb-4 flex justify-center">
                <AthleteAvatar
                  name={athlete.displayName}
                  avatarUrl={athlete.avatarUrl}
                  role={athlete.category}
                  size="xl"
                  className={`border-4 shadow-sm ${
                    athlete.isCurrentUser ? 'border-orange-400' : 'border-slate-100'
                  }`}
                />
                <span className="absolute bottom-0 right-1/2 translate-x-8 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  {athlete.level}
                </span>
              </div>

              <div className="text-center">
                <h3 className="font-bold text-base text-slate-900">
                  {athlete.displayName}
                </h3>
                {athlete.approvedNickname && (
                  <p className="text-xs text-orange-600 font-semibold">
                    &ldquo;{athlete.approvedNickname}&rdquo;
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">{athlete.category}</p>
              </div>

              {/* Attributes */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Tempo de treino:</span>
                  <span className="font-semibold text-slate-800">{athlete.yearsPlaying}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Empunhadura:</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{athlete.gripType.split(' ')[0]}</span>
                </div>

                <div className="text-slate-600">
                  <span className="text-slate-400 block mb-0.5">Golpe favorito:</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{athlete.favoriteShot}</span>
                </div>

                {athlete.achievements.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                      <Award className="w-3 h-3 text-amber-500" /> Destaques:
                    </span>
                    <ul className="space-y-1">
                      {athlete.achievements.map((ach, i) => (
                        <li key={i} className="text-[11px] text-slate-700 flex items-start gap-1">
                          <span className="w-1 h-1 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-emerald-700 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Termo Assinado
              </span>
              <span className="text-slate-400">Mogi Guaçu</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
