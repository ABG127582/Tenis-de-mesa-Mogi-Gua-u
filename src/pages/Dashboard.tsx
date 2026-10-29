import { useState, useEffect } from 'react';
import {
  BookOpen,
  Activity,
  Brain,
  Crosshair,
  Calendar,
  Megaphone,
  Users,
  ChevronRight,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Trophy,
  MessageSquare,
  BookMarked,
  ShieldCheck,
  HeartPulse
} from 'lucide-react';
import {
  INITIAL_DRILLS,
  INITIAL_EVENTS,
  INITIAL_NOTICES,
  INITIAL_ATHLETES,
  INITIAL_BLOG_POSTS
} from '../data/mockData';
import DemoBadge from '../components/DemoBadge';
import AthleteAvatar from '../components/AthleteAvatar';
import CerescScheduleCard from '../components/CerescScheduleCard';
import MatchcenterStrip from '../components/MatchcenterStrip';
import ClubPartnerStrip from '../components/ClubPartnerStrip';
import { AuthUser, SportEvent, NoticeItem, AthleteProfile } from '../types';
import { apiService } from '../services/api';

interface DashboardProps {
  onNavigate: (tabId: string) => void;
  currentUser?: AuthUser | null;
}

export default function Dashboard({ onNavigate, currentUser }: DashboardProps) {
  const [agendaTab, setAgendaTab] = useState<'treinos' | 'campeonatos'>('treinos');
  const [events, setEvents] = useState<SportEvent[]>(INITIAL_EVENTS);
  const [notices, setNotices] = useState<NoticeItem[]>(INITIAL_NOTICES);
  const [athletes, setAthletes] = useState<AthleteProfile[]>(INITIAL_ATHLETES);

  // Sync with live backend data
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      apiService.events.getAll().catch(() => INITIAL_EVENTS),
      apiService.notices.getAll().catch(() => INITIAL_NOTICES),
      apiService.athletes.getAll().catch(() => INITIAL_ATHLETES)
    ]).then(([liveEvents, liveNotices, liveAthletes]) => {
      if (isMounted) {
        if (liveEvents && liveEvents.length > 0) {
          const map = new Map<string, SportEvent>();
          liveEvents.forEach((e) => map.set(e.id, e));
          setEvents(Array.from(map.values()));
        }
        if (liveNotices && liveNotices.length > 0) {
          const map = new Map<string, NoticeItem>();
          liveNotices.forEach((n) => map.set(n.id, n));
          setNotices(Array.from(map.values()));
        }
        if (liveAthletes && liveAthletes.length > 0) {
          const map = new Map<string, AthleteProfile>();
          liveAthletes.forEach((a) => map.set(a.id, a));
          setAthletes(Array.from(map.values()));
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const trainingEvents = events.filter((e) => e.type === 'Treinamento');
  const tournamentEvents = events.filter((e) => e.type !== 'Treinamento');

  // Birthdays of current/upcoming month
  const birthdayAthletes = athletes.filter(
    (a) => a.birthMonth === 'Outubro' || a.birthMonth === 'Novembro'
  );

  const isCoach = currentUser?.role === 'treinador' || currentUser?.role === 'administrador';
  const displayName = currentUser
    ? currentUser.nickname || currentUser.name.split(' ')[0]
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner with Professor Max Spotlight */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c2340] via-[#102e52] to-[#163864] text-white p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Column: Greeting and Quick Actions */}
          <div className="max-w-2xl flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Mesa Ativa • Tênis de Mesa Mogi Guaçu
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2 leading-tight">
              {isCoach
                ? `Olá, ${displayName || 'Professor'}! Pronto para orientar a equipe?`
                : displayName
                ? `Olá, ${displayName}! Vamos evoluir hoje?`
                : 'Bem-vindo ao Tênis de Mesa Mogi Guaçu!'}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed mb-6">
              {isCoach
                ? 'Acesse a gestão de treinos, moderação da comunidade e lista de transporte e delegações para as próximas etapas no Painel da Comissão Técnica.'
                : 'Seu centro de tênis de mesa em Mogi Guaçu com a coordenação técnica do Prof. Max. Pratique os exercícios estruturados, consulte o mapa de saúde física e acompanhe a equipe.'}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {isCoach && (
                <button
                  onClick={() => onNavigate('comissao')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Painel da Comissão Técnica
                </button>
              )}

              <button
                onClick={() => onNavigate('treinos')}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isCoach
                    ? 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25'
                }`}
              >
                <Activity className="w-4 h-4" />
                Treinos de Hoje
              </button>

              <button
                onClick={() => onNavigate('saude')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs sm:text-sm border border-emerald-500/30 transition-all"
              >
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                Mapa de Saúde Física
              </button>

              <button
                onClick={() => onNavigate('biblioteca')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm border border-white/15 transition-all"
              >
                <BookOpen className="w-4 h-4 text-orange-400" />
                Biblioteca Técnica
              </button>
            </div>
          </div>

          {/* Right Column: Professor Max Official Portrait in Welcome Banner */}
          <div className="shrink-0 w-full sm:w-auto flex justify-center">
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-3xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 shadow-2xl max-w-sm sm:max-w-md hover:border-orange-500/40 transition-all">
              <div className="relative shrink-0">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_si6kkasi6kkasi6k_c5b33fbe.jpeg"
                  alt="Professor Max - Treinador Titular de Tênis de Mesa"
                  className="w-24 h-28 sm:w-28 sm:h-32 object-cover object-top rounded-2xl border-2 border-orange-500 shadow-lg"
                />
                <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-slate-900 shadow-xs" title="Treinador Ativo no CERESC">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md border border-orange-500/30">
                    Treinador Titular
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">SEMEL</span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  Professor Max
                </h3>

                <p className="text-[11px] text-slate-300 leading-snug">
                  Coordenação Técnica do Tênis de Mesa Guaçuano • ITTF Level 2 • CERESC.
                </p>

                <div className="pt-1 flex items-center gap-2">
                  <a
                    href="https://wa.me/5519998544817"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors"
                  >
                    WhatsApp do Prof. Max
                  </a>
                  <button
                    onClick={() => onNavigate('equipe')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    Perfil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matchcenter Strip (Inspired by Borussia Düsseldorf) */}
      <MatchcenterStrip onNavigate={onNavigate} />

      {/* Main Grid: Left 2 Cols (Modules & Drills), Right 1 Col (Agenda, Notices, Team) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* 4 Main Core Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Biblioteca de Teoria */}
            <div
              onClick={() => onNavigate('biblioteca')}
              className="group cursor-pointer p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6 stroke-[2.2]" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-slate-900 group-hover:text-blue-900 text-base">
                  Biblioteca & Arbitragem
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Regras oficiais ITTF/CBTM, tira-dúvidas de mesa (dedo, rede, quina) e glossário.
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-blue-600 group-hover:text-blue-700">
                Acessar regras & tira-dúvidas <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>

            {/* 2. Treinos Práticos */}
            <div
              onClick={() => onNavigate('treinos')}
              className="group cursor-pointer p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6 stroke-[2.2]" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-slate-900 group-hover:text-orange-950 text-base">
                  Treinos Práticos & Montador
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Exercícios didáticos com cronômetro grande para a mesa e gerador de sessão.
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-orange-600 group-hover:text-orange-700">
                Montar treino do dia <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>

            {/* 3. Psicologia de Jogo */}
            <div
              onClick={() => onNavigate('psicologia')}
              className="group cursor-pointer p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Brain className="w-6 h-6 stroke-[2.2]" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-slate-900 group-hover:text-violet-950 text-base">
                  Psicologia de jogo
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Foco, rotinas pré-saque, confiança e controle emocional sob pressão competitiva.
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-violet-600 group-hover:text-violet-700">
                Guia mental esportivo <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>

            {/* 4. Inteligência Tática */}
            <div
              onClick={() => onNavigate('estrategias')}
              className="group cursor-pointer p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Crosshair className="w-6 h-6 stroke-[2.2]" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-950 text-base">
                  Inteligência tática
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Aprenda a mapear e neutralizar diferentes estilos: atacantes, choppers e bloqueadores.
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-emerald-600 group-hover:text-emerald-700">
                Ver táticas de confronto <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          </div>

          {/* 5. Destaque Saúde Física: Mapa Mental & Pequenos Passos */}
          <div
            onClick={() => onNavigate('saude')}
            className="cursor-pointer bg-gradient-to-r from-teal-900 via-slate-900 to-[#0c2340] rounded-2xl p-5 text-white shadow-sm border border-emerald-500/30 hover:border-emerald-400 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                    Novo • Mapa Mental
                  </span>
                  <span className="text-xs text-emerald-300 font-semibold">
                    Saúde Física do Atleta
                  </span>
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                  Descanso, Sono, Nutrição, Treino de Força e Medicina Preventiva
                </h3>
                <p className="text-xs text-slate-300 line-clamp-1">
                  Inclui calculadora de hidratação, protocolo das 4 séries de carga e conexão com pequenos-passos.ai.studio.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-emerald-300 group-hover:text-white bg-white/10 px-3.5 py-2 rounded-xl border border-white/15">
              Explorar Mapa <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Treinamentos em Destaque */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-500" />
                  Treinamentos em Destaque
                </h2>
                <p className="text-xs text-slate-500">
                  Planos de exercício para praticar na sessão de hoje no ginásio
                </p>
              </div>
              <button
                onClick={() => onNavigate('treinos')}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                Ver todos (4) <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {INITIAL_DRILLS.slice(0, 3).map((drill) => {
                const percent = drill.progressPercent || 0;
                return (
                  <div
                    key={drill.id}
                    onClick={() => onNavigate('treinos')}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
                        {drill.title} ({drill.level})
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        {percent > 0 ? `${percent}%` : 'Não iniciado'}
                      </span>
                    </div>

                    {/* Progress Bar matching the mockup */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {drill.durationMinutes} minutos
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                        {drill.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Histórias de Mesa Recentes (Blog Preview) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-orange-500" />
                <h2 className="text-base font-bold text-slate-900">
                  Histórias de Mesa • Comunidade
                </h2>
              </div>
              <button
                onClick={() => onNavigate('historias')}
                className="text-xs font-semibold text-orange-600 hover:underline"
              >
                Ver blog completo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INITIAL_BLOG_POSTS.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  onClick={() => onNavigate('historias')}
                  className="rounded-xl border border-slate-100 p-3 hover:border-slate-200 transition-all cursor-pointer group bg-slate-50/40"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-orange-600 line-clamp-2">
                    {post.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {post.summary}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Por {post.authorName}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols on desktop): Agenda, Avisos, Equipe */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Card 0: Polo Oficial CERESC Banner */}
          <CerescScheduleCard variant="compact" />

          {/* Card 1: Agenda Esportiva with Toggle Tabs */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                Agenda Esportiva
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                Mogi Guaçu & Região
              </span>
            </div>

            {/* Toggle Tabs matching Mockup: [Treinamentos] [Campeonatos] */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-3 text-xs font-medium">
              <button
                onClick={() => setAgendaTab('treinos')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  agendaTab === 'treinos'
                    ? 'bg-[#0c2340] text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Treinamentos
              </button>
              <button
                onClick={() => setAgendaTab('campeonatos')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  agendaTab === 'campeonatos'
                    ? 'bg-[#0c2340] text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Campeonatos
              </button>
            </div>

            {/* Events List */}
            <div className="space-y-2">
              {agendaTab === 'treinos' ? (
                trainingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {evt.title.split(' - ')[1] || evt.title}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-orange-500" /> {evt.date} • {evt.time}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {evt.status}
                    </span>
                  </div>
                ))
              ) : (
                tournamentEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">
                        {evt.title}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-orange-500" /> {evt.city} ({evt.date})
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        evt.status === 'Inscrições Abertas'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 text-right">
              <button
                onClick={() => onNavigate('agenda')}
                className="text-[11px] font-semibold text-orange-600 hover:underline"
              >
                Ver calendário completo &rarr;
              </button>
            </div>
          </div>

          {/* Card 2: Quadro de Avisos */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-500" />
                Quadro de Avisos
              </h3>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                {notices.length} avisos
              </span>
            </div>

            <div className="space-y-2.5">
              {notices.slice(0, 4).map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => onNavigate('avisos')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">
                      {notice.title}
                    </p>
                    {notice.isUrgent && (
                      <span className="shrink-0 text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-red-100 text-red-700 rounded">
                        Urgente
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {notice.body}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Publicado por: {notice.authorRole}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 text-right">
              <button
                onClick={() => onNavigate('avisos')}
                className="text-[11px] font-semibold text-orange-600 hover:underline"
              >
                Ir para o mural &rarr;
              </button>
            </div>
          </div>

          {/* Card 3: Nossa Equipe (Styled in Vibrant Orange matching Mockup) */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-orange-600 to-orange-500 text-white shadow-md relative overflow-hidden">
            {/* Top ping pong ball subtle pattern */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-200" />
                Nossa Equipe
              </h3>
              <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full text-white">
                Mogi Guaçu
              </span>
            </div>

            {/* Treinador Titular Spotlight */}
            <div
              onClick={() => onNavigate('equipe')}
              className="mb-3.5 p-2.5 rounded-xl bg-black/15 hover:bg-black/25 transition-all flex items-center gap-3 cursor-pointer relative z-10 border border-white/10"
            >
              <img
                src="/assets/aistudio/Gemini_Generated_Image_si6kkasi6kkasi6k_c5b33fbe.jpeg"
                alt="Prof. Max"
                className="w-10 h-10 rounded-full object-cover object-top border-2 border-white shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-orange-200 block">Treinador Titular</span>
                <span className="text-xs font-black text-white truncate block">Prof. Max</span>
              </div>
              <span className="text-[10px] bg-white/20 text-white font-semibold px-2 py-0.5 rounded-md">
                Ver perfil &rarr;
              </span>
            </div>

            {/* Novos Integrantes Section */}
            <div className="mb-4 relative z-10">
              <p className="text-[11px] font-medium text-orange-100 mb-2">
                Novos Integrantes
              </p>
              <div className="flex items-center gap-2">
                {athletes.slice(0, 3).map((ath) => (
                  <div key={ath.id} className="relative group" title={`${ath.displayName} (${ath.approvedNickname})`}>
                    <AthleteAvatar
                      name={ath.displayName}
                      avatarUrl={ath.avatarUrl}
                      size="sm"
                      className="border-2 border-white shadow-xs group-hover:scale-110 transition-transform"
                    />
                  </div>
                ))}
                <button
                  onClick={() => onNavigate('equipe')}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/50 text-white flex items-center justify-center text-xs font-bold transition-all"
                  title="Ver todos"
                >
                  +{Math.max(0, athletes.length - 3)}
                </button>
              </div>
            </div>

            {/* Aniversariantes do Mês (Preserving Privacy: only month/day, no year!) */}
            <div className="pt-3 border-t border-white/20 relative z-10">
              <p className="text-[11px] font-medium text-orange-100 mb-2">
                Aniversariantes do Mês
              </p>
              <div className="space-y-1.5">
                {birthdayAthletes.map((ath) => (
                  <div
                    key={ath.id}
                    className="flex items-center justify-between text-xs bg-black/10 px-2.5 py-1.5 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <AthleteAvatar
                        name={ath.displayName}
                        avatarUrl={ath.avatarUrl}
                        size="xs"
                      />
                      <span className="font-semibold text-white">
                        {ath.approvedNickname || ath.displayName.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-[10px] text-orange-100 font-medium">
                      {ath.birthDay} de {ath.birthMonth}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-white/20 text-center">
              <button
                onClick={() => onNavigate('equipe')}
                className="w-full py-1.5 rounded-xl bg-white text-orange-600 font-bold text-xs hover:bg-orange-50 transition-colors shadow-xs"
              >
                Conhecer Atletas da Equipe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Partner & Supporters Strip (Inspired by Borussia Düsseldorf) */}
      <ClubPartnerStrip />
    </div>
  );
}
