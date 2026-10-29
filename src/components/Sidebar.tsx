import {
  Home,
  BookOpen,
  Activity,
  Brain,
  Crosshair,
  Shield,
  Calendar,
  Megaphone,
  BookMarked,
  Users,
  MessageSquare,
  Globe,
  Info,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  LogIn,
  X,
  Trophy,
  HeartPulse
} from 'lucide-react';
import Logo from './Logo';
import { AuthUser, UserRole } from '../types';

export interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'biblioteca', label: 'Biblioteca de teoria', icon: BookOpen },
  { id: 'treinos', label: 'Treinamentos práticos', icon: Activity, badge: '4' },
  { id: 'saude', label: 'Saúde Física & Hábitos', icon: HeartPulse, badge: 'Mapa' },
  { id: 'placar', label: 'Placar de Mesa Oficial', icon: Trophy, badge: 'Mesa' },
  { id: 'psicologia', label: 'Psicologia de jogo', icon: Brain },
  { id: 'estrategias', label: 'Estratégias contra adversários', icon: Crosshair },
  { id: 'equipamentos', label: 'Equipamentos', icon: Shield },
  { id: 'agenda', label: 'Agenda e campeonatos', icon: Calendar, badge: 'Novo' },
  { id: 'avisos', label: 'Quadro de avisos', icon: Megaphone, badge: '3' },
  { id: 'historias', label: 'Histórias de Mesa', icon: BookMarked },
  { id: 'equipe', label: 'Nossa equipe', icon: Users },
  { id: 'chat', label: 'Chat Mogi Guaçu', icon: MessageSquare, badge: 'Piloto' },
  { id: 'links', label: 'Páginas de interesse', icon: Globe },
  { id: 'sobre', label: 'Sobre o projeto', icon: Info },
  { id: 'privacidade', label: 'Privacidade LGPD', icon: ShieldCheck, badge: 'LGPD' },
];

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser: AuthUser | null;
  onOpenAuthModal: () => void;
}

export default function Sidebar({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  currentUser,
  onOpenAuthModal
}: SidebarProps) {
  const roleDisplayNames: Record<UserRole, { label: string; color: string }> = {
    visitante: { label: 'Visitante', color: 'bg-slate-700 text-slate-200' },
    atleta: { label: 'Atleta', color: 'bg-emerald-600 text-white' },
    treinador: { label: 'Treinador', color: 'bg-orange-600 text-white' },
    editor: { label: 'Editor', color: 'bg-blue-600 text-white' },
    moderador: { label: 'Moderador', color: 'bg-amber-600 text-white' },
    administrador: { label: 'Administrador', color: 'bg-purple-600 text-white' },
  };

  const isCoach = currentUser?.role === 'treinador' || currentUser?.role === 'administrador';

  const navItemsToRender = [
    NAV_ITEMS[0],
    ...(isCoach
      ? [
          {
            id: 'comissao',
            label: 'Painel da Comissão',
            icon: ShieldCheck,
            badge: 'Prof. Max'
          }
        ]
      : []),
    ...NAV_ITEMS.slice(1)
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0c2340] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none border-r border-[#1e3a5f]`}
      >
        {/* Top Header / Logo */}
        <div className="p-5 flex items-center justify-between border-b border-[#1b3452]">
          <Logo isLight={true} />
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links Scrollable Area */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
          {navItemsToRender.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all relative ${
                  isActive
                    ? 'bg-[#173356] text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-[#122b49]'
                }`}
              >
                {/* Left accent bar on active */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-orange-500 rounded-r-md" />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-orange-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badge === 'Demo'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : item.badge === 'Novo'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Profile & Authentication Bar */}
        <div className="p-3.5 border-t border-[#1b3452] bg-[#0a1e36]">
          <div className="bg-[#122842] p-2.5 rounded-xl border border-[#1b3a61]">
            {currentUser ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-inner ring-2 ring-orange-400/40">
                      {currentUser.nickname ? currentUser.nickname.slice(0, 2).toUpperCase() : currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                        {currentUser.nickname || currentUser.name}
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            roleDisplayNames[currentUser.role]?.color || 'bg-slate-700 text-white'
                          }`}
                        >
                          {roleDisplayNames[currentUser.role]?.label || currentUser.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className="px-2 py-1 rounded-lg text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 text-[11px] font-semibold flex items-center gap-1 border border-white/10 transition-colors cursor-pointer"
                    title="Gerenciar conta ou trocar usuário"
                  >
                    <span>Conta</span>
                    <ChevronDown className="w-3 h-3 text-orange-400" />
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <UserCheck className="w-3 h-3" />
                    <span>Conectado</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectTab('equipe')}
                    className="text-orange-400 hover:underline cursor-pointer"
                  >
                    Ver equipe
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200">Visitante Comunitário</p>
                  <p className="text-[10px] text-slate-400">Modo Leitura</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Entrar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
