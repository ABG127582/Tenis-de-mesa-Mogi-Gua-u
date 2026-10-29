import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Menu,
  Bell,
  User as UserIcon,
  X,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Activity,
  Calendar,
  Megaphone,
  Crosshair,
  ShieldAlert,
  Scale
} from 'lucide-react';
import DemoBadge from './DemoBadge';
import { AuthUser, UserRole, NoticeItem } from '../types';
import { apiService } from '../services/api';
import {
  INITIAL_ARTICLES,
  INITIAL_DRILLS,
  INITIAL_STRATEGIES,
  INITIAL_EVENTS,
  INITIAL_NOTICES,
  REFEREE_FAQS
} from '../data/mockData';
import { OFFICIAL_RULES_SECTIONS } from '../data/officialRules';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNavigate: (tabId: string) => void;
  currentUser: AuthUser | null;
  onOpenAuthModal: () => void;
}

export default function Header({
  onOpenMobileMenu,
  onNavigate,
  currentUser,
  onOpenAuthModal
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeNotices, setActiveNotices] = useState<NoticeItem[]>(INITIAL_NOTICES);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync live notices from API
  useEffect(() => {
    apiService.notices.getAll().then((res) => {
      if (res && res.length > 0) setActiveNotices(res);
    }).catch(() => {});
  }, []);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search & notifications dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results across articles, drills, strategies, rules, faqs, events, notices
  const query = searchQuery.toLowerCase().trim();

  const filteredRules = query
    ? OFFICIAL_RULES_SECTIONS.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.englishTitle.toLowerCase().includes(query) ||
        r.code.includes(query) ||
        r.subsections.some(s => s.code.includes(query) || s.text.toLowerCase().includes(query))
      )
    : [];

  const filteredFaqs = query
    ? REFEREE_FAQS.filter(f =>
        f.question.toLowerCase().includes(query) ||
        f.detailedExplanation.toLowerCase().includes(query) ||
        f.shortAnswer.toLowerCase().includes(query) ||
        f.officialRuleCode.toLowerCase().includes(query)
      )
    : [];

  const filteredArticles = query
    ? INITIAL_ARTICLES.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.summary.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query)
      )
    : [];

  const filteredDrills = query
    ? INITIAL_DRILLS.filter(d =>
        d.title.toLowerCase().includes(query) ||
        d.objective.toLowerCase().includes(query) ||
        d.level.toLowerCase().includes(query)
      )
    : [];

  const filteredTactics = query
    ? INITIAL_STRATEGIES.filter(s =>
        s.styleName.toLowerCase().includes(query) ||
        s.shortDescription.toLowerCase().includes(query)
      )
    : [];

  const filteredEvents = query
    ? INITIAL_EVENTS.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.city.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query)
      )
    : [];

  const filteredNotices = query
    ? INITIAL_NOTICES.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.body.toLowerCase().includes(query)
      )
    : [];

  const totalResults =
    filteredRules.length +
    filteredFaqs.length +
    filteredArticles.length +
    filteredDrills.length +
    filteredTactics.length +
    filteredEvents.length +
    filteredNotices.length;

  const hasResults = totalResults > 0;

  return (
    <header className="sticky top-0 z-30 bg-[#0c2340] border-b border-[#1b3658] text-white">
      {/* Top Banner */}
      <div className="bg-[#091a30] py-1 px-4 border-b border-white/5">
        <DemoBadge minimal={false} />
      </div>

      <div className="px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="text-xs font-medium text-slate-400 hidden sm:inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Plataforma Mogi Guaçu
          </span>
        </div>

        {/* Search Bar - Center */}
        <div ref={searchRef} className="relative flex-1 max-w-xl mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Buscar regras ITTF, exercícios, avisos, eventos e táticas..."
              className="w-full bg-[#162d4c] text-white placeholder-slate-400 text-xs sm:text-sm pl-10 pr-20 py-2 rounded-full border border-[#22446f] focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="pointer-events-auto text-slate-400 hover:text-white p-1"
                  aria-label="Limpar pesquisa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded">
                  Ctrl K
                </kbd>
              )}
            </div>
          </div>

          {/* Search Dropdown Modal */}
          {isSearchOpen && searchQuery.trim().length > 1 && (
            <div className="absolute left-0 right-0 mt-2 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[28rem] overflow-y-auto custom-scrollbar">
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Resultados para &quot;{searchQuery}&quot;</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                    {totalResults} resultado{totalResults !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-700 underline"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {!hasResults ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                  <p className="font-semibold text-slate-700">Nenhum resultado encontrado para &quot;{searchQuery}&quot;</p>
                  <p>Tente buscar por termos como &quot;saque&quot;, &quot;2.10&quot;, &quot;quina&quot;, &quot;Mogi Mirim&quot;, &quot;Ourinhos&quot; ou &quot;forehand&quot;.</p>
                </div>
              ) : (
                <div className="p-2 divide-y divide-slate-100">
                  {/* Referee FAQs */}
                  {filteredFaqs.length > 0 && (
                    <div className="py-2">
                      <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5" /> Tira-Dúvidas de Arbitragem
                      </div>
                      {filteredFaqs.map((faq) => (
                        <button
                          key={faq.id}
                          onClick={() => {
                            onNavigate('biblioteca');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-purple-700">
                              {faq.question}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{faq.shortAnswer}</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 shrink-0 ml-2">
                            {faq.officialRuleCode}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* ITTF Full Rules */}
                  {filteredRules.length > 0 && (
                    <div className="py-2">
                      <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> Regras Oficiais ITTF Cap. 2
                      </div>
                      {filteredRules.map((rule) => (
                        <button
                          key={rule.code}
                          onClick={() => {
                            onNavigate('biblioteca');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                              Regra {rule.code} - {rule.title}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{rule.englishTitle}</p>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 shrink-0 ml-2">
                            {rule.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Events */}
                  {filteredEvents.length > 0 && (
                    <div className="py-2">
                      <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Agenda e Campeonatos
                      </div>
                      {filteredEvents.map((evt) => (
                        <button
                          key={evt.id}
                          onClick={() => {
                            onNavigate('agenda');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-emerald-700">
                              {evt.title}
                            </p>
                            <p className="text-[11px] text-slate-500">{evt.city} • {evt.date}</p>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 shrink-0 ml-2">
                            {evt.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Notices */}
                  {filteredNotices.length > 0 && (
                    <div className="py-2">
                      <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                        <Megaphone className="w-3.5 h-3.5" /> Quadro de Avisos
                      </div>
                      {filteredNotices.map((not) => (
                        <button
                          key={not.id}
                          onClick={() => {
                            onNavigate('avisos');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-amber-700">
                              {not.title}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{not.body}</p>
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 shrink-0 ml-2">
                            {not.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Drills Section */}
                  {filteredDrills.length > 0 && (
                    <div className="py-2">
                      <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> Treinamentos Práticos
                      </div>
                      {filteredDrills.map((drill) => (
                        <button
                          key={drill.id}
                          onClick={() => {
                            onNavigate('treinos');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-orange-600">
                              {drill.title}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{drill.objective}</p>
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0 ml-2">
                            {drill.level}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Articles Section */}
                  {filteredArticles.length > 0 && (
                    <div className="py-2">
                      <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> Biblioteca Teórica
                      </div>
                      {filteredArticles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => {
                            onNavigate('biblioteca');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-600">
                              {article.title}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{article.summary}</p>
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0 ml-2">
                            {article.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tactics Section */}
                  {filteredTactics.length > 0 && (
                    <div className="py-2">
                      <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5" /> Estratégias
                      </div>
                      {filteredTactics.map((tac) => (
                        <button
                          key={tac.id}
                          onClick={() => {
                            onNavigate('estrategias');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-emerald-600">
                              {tac.styleName}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{tac.shortDescription}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell with Real Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={`Avisos da equipe (${activeNotices.length})`}
            >
              <Bell className="w-5 h-5" />
              {activeNotices.length > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-[#0c2340]">
                  {activeNotices.length}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 bg-gradient-to-r from-[#0c2340] to-[#163864] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-orange-400" />
                    <span className="font-bold text-xs">Avisos & Notificações</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {activeNotices.length} avisos
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {activeNotices.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Nenhum aviso publicado no momento.
                    </div>
                  ) : (
                    activeNotices.slice(0, 4).map((notice) => (
                      <div
                        key={notice.id}
                        onClick={() => {
                          onNavigate('avisos');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-3 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {notice.category}
                          </span>
                          {notice.isUrgent && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-red-100 text-red-700 uppercase">
                              Urgente
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 ml-auto">
                            {notice.publishedAt || 'Hoje'}
                          </span>
                        </div>
                        <p className="font-bold text-xs text-slate-800 mt-1 line-clamp-1">{notice.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{notice.body}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      onNavigate('avisos');
                      setIsNotificationsOpen(false);
                    }}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                  >
                    Ver todos os avisos no mural &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account Button with server auth trigger */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/40 transition-all text-xs font-medium cursor-pointer"
            title={currentUser ? 'Conta conectada - Clique para gerenciar ou sair' : 'Clique para entrar na sua conta'}
          >
            {currentUser ? (
              <>
                {currentUser.avatar && currentUser.avatar.trim() ? (
                  <img
                    src={currentUser.avatar.trim()}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover object-top border border-orange-300 shadow-xs"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                    {currentUser.nickname ? currentUser.nickname.slice(0, 2).toUpperCase() : (currentUser.name || 'U').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="hidden md:inline font-bold text-orange-200">
                  {currentUser.nickname || (currentUser.name ? currentUser.name.split(' ')[0] : 'Usuário')}
                </span>
              </>
            ) : (
              <>
                <UserIcon className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-orange-200">Entrar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
