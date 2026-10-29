import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import Dashboard from './pages/Dashboard';
import TheoryLibrary from './pages/TheoryLibrary';
import PracticalDrills from './pages/PracticalDrills';
import SportsPsychology from './pages/SportsPsychology';
import TacticalStrategies from './pages/TacticalStrategies';
import EquipmentGuide from './pages/EquipmentGuide';
import ScheduleEvents from './pages/ScheduleEvents';
import NoticeBoard from './pages/NoticeBoard';
import TableStoriesBlog from './pages/TableStoriesBlog';
import TeamProfiles from './pages/TeamProfiles';
import MoziguassuChat from './pages/MoziguassuChat';
import UsefulLinks from './pages/UsefulLinks';
import AboutProject from './pages/AboutProject';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CoachPanel from './pages/CoachPanel';
import MatchScoreboard from './pages/MatchScoreboard';
import PhysicalHealthMindmap from './pages/PhysicalHealthMindmap';
import Logo from './components/Logo';
import { AuthUser } from './types';
import { apiService } from './services/api';
import { ShieldCheck } from 'lucide-react';

const VALID_TABS = [
  'inicio',
  'comissao',
  'placar',
  'biblioteca',
  'treinos',
  'saude',
  'psicologia',
  'estrategias',
  'equipamentos',
  'agenda',
  'avisos',
  'historias',
  'equipe',
  'chat',
  'links',
  'sobre',
  'privacidade'
];

function getTabFromHash(): string {
  try {
    const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
    if (VALID_TABS.includes(hash)) {
      return hash;
    }
  } catch {}
  return 'inicio';
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>(getTabFromHash);
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => apiService.auth.getUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync tab with URL Hash and browser history
  useEffect(() => {
    const handleHashChange = () => {
      const tab = getTabFromHash();
      setCurrentTab(tab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (tabId: string) => {
    setCurrentTab(tabId);
    if (window.location.hash !== `#${tabId}`) {
      window.location.hash = `#${tabId}`;
    }
  };

  // Verify and sync session with server on initial mount
  useEffect(() => {
    let isMounted = true;
    apiService.auth.checkSession().then((verifiedUser) => {
      if (isMounted) {
        setCurrentUser(verifiedUser);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const renderContent = () => {
    switch (currentTab) {
      case 'inicio':
        return <Dashboard onNavigate={handleNavigate} currentUser={currentUser} />;
      case 'comissao':
        return <CoachPanel currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'placar':
        return <MatchScoreboard currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'biblioteca':
        return <TheoryLibrary />;
      case 'treinos':
        return <PracticalDrills currentUser={currentUser} />;
      case 'saude':
        return <PhysicalHealthMindmap />;
      case 'psicologia':
        return <SportsPsychology />;
      case 'estrategias':
        return <TacticalStrategies currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'equipamentos':
        return <EquipmentGuide currentUser={currentUser} onOpenAuthModal={() => setIsAuthModalOpen(true)} />;
      case 'agenda':
        return <ScheduleEvents currentUser={currentUser} />;
      case 'avisos':
        return <NoticeBoard currentUser={currentUser} />;
      case 'historias':
        return <TableStoriesBlog currentUser={currentUser} />;
      case 'equipe':
        return <TeamProfiles />;
      case 'chat':
        return <MoziguassuChat currentUser={currentUser} onOpenAuthModal={() => setIsAuthModalOpen(true)} />;
      case 'links':
        return <UsefulLinks />;
      case 'sobre':
        return <AboutProject />;
      case 'privacidade':
        return <PrivacyPolicy currentUser={currentUser} />;
      default:
        return <Dashboard onNavigate={handleNavigate} currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] text-slate-800 flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        {/* Sticky Header with Search and Role Indicator */}
        <Header
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>

        {/* Institutional Footer */}
        <footer className="bg-white border-t border-slate-200 mt-auto py-8 px-4 sm:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Logo size="sm" />
              <p className="text-slate-400 text-center md:text-left text-[11px] mt-1 max-w-md">
                Plataforma comunitária e educativa de tênis de mesa em Mogi Guaçu • SP.
                <br />
                Aprender • Treinar • Evoluir • Compartilhar.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold text-slate-600">
              <button
                onClick={() => handleNavigate('sobre')}
                className="hover:text-orange-600 transition-colors cursor-pointer"
              >
                Sobre o Projeto
              </button>
              <button
                onClick={() => handleNavigate('biblioteca')}
                className="hover:text-orange-600 transition-colors cursor-pointer"
              >
                Regras e Teoria
              </button>
              <button
                onClick={() => handleNavigate('equipe')}
                className="hover:text-orange-600 transition-colors cursor-pointer"
              >
                Equipe
              </button>
              <button
                onClick={() => handleNavigate('links')}
                className="hover:text-orange-600 transition-colors cursor-pointer"
              >
                Links Oficiais
              </button>
              <button
                onClick={() => handleNavigate('privacidade')}
                className="hover:text-orange-600 transition-colors cursor-pointer text-emerald-700 font-bold"
              >
                Termos & Privacidade LGPD
              </button>
            </div>

            <button
              onClick={() => handleNavigate('privacidade')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-[11px] text-slate-600 hover:text-emerald-800 transition-all cursor-pointer"
              title="Consultar diretrizes de proteção de dados e registro de consentimento"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Governança LGPD • Termos de Uso</span>
            </button>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={(user) => {
          setCurrentUser(user);
        }}
      />
    </div>
  );
}
