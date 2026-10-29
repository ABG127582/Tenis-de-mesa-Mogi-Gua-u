import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Flag,
  CheckCircle,
  Hash,
  BellRing,
  Info,
  X,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  LogIn,
  Trash2
} from 'lucide-react';
import { INITIAL_CHAT_MESSAGES } from '../data/mockData';
import { ChatMessage, AuthUser } from '../types';
import { apiService } from '../services/api';
import DemoBadge from '../components/DemoBadge';
import AthleteAvatar from '../components/AthleteAvatar';

interface MoziguassuChatProps {
  currentUser: AuthUser | null;
  onOpenAuthModal?: () => void;
}

export default function MoziguassuChat({ currentUser, onOpenAuthModal }: MoziguassuChatProps) {
  const [activeChannel, setActiveChannel] = useState<'geral' | 'avisos-treinador' | 'combinar-treinos'>('geral');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportedMsg, setReportedMsg] = useState<ChatMessage | null>(null);
  const [reportSuccess, setReportSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'geral', name: 'geral-comunidade', icon: Hash, desc: 'Bate-papo respeitoso sobre tênis de mesa e dúvidas técnicas' },
    { id: 'avisos-treinador', name: 'avisos-do-treinador', icon: BellRing, desc: 'Canal oficial restrito para recados do Prof. Max' },
    { id: 'combinar-treinos', name: 'combinar-treinos', icon: Hash, desc: 'Atletas combinando partidas antes do horário regular' },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchChat = () => {
      apiService.chat.getMessages().then((data) => {
        if (isMounted && data) {
          setMessages(data);
        }
      }).catch(() => {});
    };

    fetchChat();
    // Poll every 4 seconds for new incoming messages from other athletes/coach
    const interval = setInterval(fetchChat, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const currentChannelObj = channels.find((c) => c.id === activeChannel)!;
  const filteredMessages = messages.filter((m) => m.channelId === activeChannel);

  const isGuest = !currentUser || currentUser.role === 'visitante';
  const canPostInCurrentChannel =
    !isGuest &&
    (activeChannel !== 'avisos-treinador' ||
     currentUser.role === 'treinador' ||
     currentUser.role === 'administrador');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (isGuest) {
      setErrorMsg('Visitantes em modo somente leitura não podem postar mensagens no chat da equipe.');
      return;
    }

    if (!canPostInCurrentChannel) {
      setErrorMsg('Somente o treinador titular (Prof. Max) e a coordenação podem emitir comunicados neste canal oficial.');
      return;
    }

    setErrorMsg('');
    setSending(true);

    try {
      const created = await apiService.chat.sendMessage(activeChannel, inputText.trim());
      setMessages([...messages, created]);
      setInputText('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao enviar mensagem ao servidor.');
    } finally {
      setSending(false);
    }
  };

  const handleOpenReportModal = (msg?: ChatMessage) => {
    setReportedMsg(msg || null);
    setReportReason('');
    setReportSuccess('');
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setErrorMsg('');
    setReportSuccess('');

    try {
      await apiService.reports.submit(activeChannel, reportReason.trim(), reportedMsg?.id);
      setReportSuccess('Denúncia recebida e registrada no servidor para análise pelo Prof. Max.');
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess('');
      }, 1600);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao registrar denúncia no servidor. Tente novamente.');
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await apiService.chat.deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao remover mensagem.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Chat Mogi Guaçu • Comunidade & Convivência
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Espaço de integração esportiva entre atletas da equipe e recados da comissão técnica com moderação persistente.
          </p>
        </div>

        <DemoBadge minimal={true} text="Chat Persistente com Moderação" />
      </div>

      {/* Safety & Minor Athlete Protection Disclaimer */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            Diretrizes de Moderação & Proteção a Menores de Idade:
          </div>
          <button
            onClick={() => handleOpenReportModal()}
            className="text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Flag className="w-3 h-3" /> Denunciar Abuso / Violação
          </button>
        </div>
        <p className="text-blue-900 leading-relaxed">
          Este ambiente esportivo é monitorado pela comissão técnica de Mogi Guaçu. É estritamente proibido qualquer tipo de ofensa, assédio, linguagem inadequada ou discriminação. Mensagens inadequadas são removidas e podem acarretar suspensão das atividades na mesa.
        </p>
      </div>

      {/* Chat Layout Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
        {/* Left Channels List */}
        <div className="md:col-span-4 bg-slate-50/80 border-r border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Salas de Conversa
              </span>
              <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-700 font-semibold">
                3 salas
              </span>
            </div>

            <div className="space-y-1.5">
              {channels.map((chan) => {
                const Icon = chan.icon;
                const isActive = activeChannel === chan.id;
                return (
                  <button
                    key={chan.id}
                    onClick={() => {
                      setActiveChannel(chan.id as any);
                      setErrorMsg('');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 ${
                      isActive
                        ? 'bg-[#0c2340] text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{chan.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="flex items-center gap-1 text-slate-700 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-orange-500" />
              Conectado: <b>{currentUser ? currentUser.name : 'Visitante'}</b>
            </p>
            <p className="text-[10px]">
              Papel:{' '}
              <span className="font-bold text-orange-600 uppercase">
                {currentUser ? currentUser.role : 'Visitante (Leitura)'}
              </span>
            </p>
          </div>
        </div>

        {/* Right Messages Area */}
        <div className="md:col-span-8 flex flex-col justify-between bg-white">
          {/* Channel Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <currentChannelObj.icon className="w-4 h-4 text-orange-500" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  #{currentChannelObj.name}
                </h3>
                <p className="text-[11px] text-slate-400">{currentChannelObj.desc}</p>
              </div>
            </div>

            {activeChannel === 'avisos-treinador' && (
              <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Somente Treinador
              </span>
            )}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[380px] custom-scrollbar bg-slate-50/30">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhuma mensagem neste canal ainda. Seja o primeiro a interagir!
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = Boolean(currentUser && msg.senderName === currentUser.name);
                const isCoach = msg.senderRole === 'treinador';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <AthleteAvatar
                      name={msg.senderName}
                      avatarUrl={msg.senderAvatar}
                      role={msg.senderRole}
                      size="sm"
                    />

                    <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end text-right' : ''}`}>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className={`font-bold ${isCoach ? 'text-orange-600' : 'text-slate-800'}`}>
                          {msg.senderName}
                        </span>
                        {isCoach && (
                          <span className="bg-orange-100 text-orange-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                            TREINADOR
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed relative ${
                          isCoach && msg.isOfficialAnnouncement
                            ? 'bg-orange-50 border border-orange-200 text-orange-950 font-medium'
                            : isMe
                            ? 'bg-[#0c2340] text-white'
                            : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs'
                        }`}
                      >
                        {msg.text}
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        {!isMe && (
                          <button
                            onClick={() => handleOpenReportModal(msg)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-red-600 transition-opacity flex items-center gap-1 cursor-pointer"
                          >
                            <Flag className="w-3 h-3" /> Reportar
                          </button>
                        )}

                        {(currentUser?.role === 'treinador' || currentUser?.role === 'administrador') && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] text-red-500 hover:text-red-700 transition-opacity flex items-center gap-1 cursor-pointer font-semibold"
                            title="Remover mensagem como moderador"
                          >
                            <Trash2 className="w-3 h-3" /> Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3.5 border-t border-slate-200 bg-white space-y-2">
            {errorMsg && (
              <div className="p-2 bg-red-50 text-red-800 text-xs rounded-xl flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isGuest ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Você está no modo visitante (somente leitura). Faça login como atleta ou treinador para participar.</span>
                </div>
                {onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Entrar no Chat
                  </button>
                )}
              </div>
            ) : canPostInCurrentChannel ? (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Mensagem em #${currentChannelObj.name}...`}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-orange-500"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Enviar
                </button>
              </form>
            ) : (
              <div className="p-3 bg-slate-100 text-slate-500 text-center rounded-xl text-xs flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Apenas o Prof. Max (Treinador Titular) pode publicar neste canal oficial. Selecione #geral para participar.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Abuse Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                <Flag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Canal de Denúncia e Convivência
              </h3>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Seu relato é confidencial e será analisado diretamente pela comissão técnica para zelar pela segurança dos atletas e jovens de Mogi Guaçu.
            </p>

            {reportedMsg && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 mb-3">
                <b className="text-slate-800">Mensagem reportada:</b> &quot;{reportedMsg.text}&quot; (por {reportedMsg.senderName})
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Descreva o motivo da denúncia:
                </label>
                <textarea
                  rows={3}
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Ex: Linguagem ofensiva, desrespeito ou conduta antiesportiva..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {reportSuccess && (
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-200 text-center font-semibold">
                  {reportSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 text-slate-500 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Enviar Denúncia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
