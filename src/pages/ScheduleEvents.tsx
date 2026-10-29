import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
  Users,
  CheckCircle2,
  Bus,
  Car,
  X,
  AlertCircle,
  FileCheck,
  Check,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { INITIAL_EVENTS, INITIAL_EVENT_ATTENDANCE } from '../data/mockData';
import { SportEvent, EventAttendance, AuthUser } from '../types';
import { apiService } from '../services/api';
import DemoBadge from '../components/DemoBadge';
import CerescScheduleCard from '../components/CerescScheduleCard';

interface ScheduleEventsProps {
  currentUser: AuthUser | null;
}

export default function ScheduleEvents({ currentUser }: ScheduleEventsProps) {
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [events, setEvents] = useState<SportEvent[]>(INITIAL_EVENTS);
  const [attendances, setAttendances] = useState<EventAttendance[]>(INITIAL_EVENT_ATTENDANCE);
  const [activeModalEvent, setActiveModalEvent] = useState<SportEvent | null>(null);
  const [myTransport, setMyTransport] = useState<'Van da Equipe' | 'Transporte Próprio' | 'A Definir'>('Van da Equipe');
  const [myCategory, setMyCategory] = useState<string>('Adulto • Equipe Mogi Guaçu');
  const [justConfirmed, setJustConfirmed] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // Sync events and attendances from persistent backend
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      apiService.events.getAll().catch(() => INITIAL_EVENTS),
      apiService.attendances.getAll().catch(() => INITIAL_EVENT_ATTENDANCE)
    ]).then(([evts, atts]) => {
      if (isMounted) {
        if (evts?.length) setEvents(evts);
        if (atts?.length) setAttendances(atts);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const types = ['Todos', 'Treinamento', 'Campeonato Regional', 'Circuito Estadual'];

  const filteredEvents = events.filter(
    (e) => selectedType === 'Todos' || e.type === selectedType
  );

  const getEventConfirmedCount = (eventId: string) => {
    return attendances.filter((a) => a.eventId === eventId).length;
  };

  const isUserConfirmedForEvent = (eventId: string) => {
    if (!currentUser) return false;
    return attendances.some(
      (a) => a.eventId === eventId && (a.isCurrentUser || a.athleteName === currentUser.name || (currentUser.nickname && a.athleteNickname === currentUser.nickname))
    );
  };

  // Helper to determine status dynamically based on current date
  const getEventComputedStatus = (event: SportEvent) => {
    const now = new Date();
    if (event.dateISO) {
      const evtDate = new Date(event.dateISO);
      if (evtDate.getTime() < now.getTime() - 24 * 3600 * 1000) {
        return { label: 'Encerrado', color: 'bg-slate-100 text-slate-600 border border-slate-200' };
      }
    }
    if (event.registrationDeadlineISO) {
      const deadline = new Date(event.registrationDeadlineISO);
      if (deadline.getTime() < now.getTime()) {
        return { label: 'Inscrições Encerradas', color: 'bg-amber-100 text-amber-800' };
      }
    }
    if (event.status === 'Inscrições Abertas') {
      return { label: 'Inscrições Abertas', color: 'bg-orange-100 text-orange-800' };
    }
    if (event.status === 'Confirmado') {
      return { label: 'Confirmado', color: 'bg-emerald-100 text-emerald-800' };
    }
    return { label: event.status, color: 'bg-slate-100 text-slate-700' };
  };

  const handleToggleUserAttendance = async (eventId: string) => {
    setAttendanceError(null);
    if (!currentUser || currentUser.role === 'visitante') {
      setAttendanceError('Acesso restrito: faça login como atleta ou treinador para confirmar sua vaga na delegação.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await apiService.attendances.toggle(eventId, myTransport, myCategory);
      setAttendances(res.attendances);
      if (res.confirmed) {
        setJustConfirmed(true);
        setTimeout(() => setJustConfirmed(false), 3000);
      }
    } catch (e: any) {
      setAttendanceError(e?.message || 'Falha ao atualizar convocação.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Agenda e Calendário de Campeonatos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Horários de treino com o Prof. Max, torneios e confirmação de presença na delegação de Mogi Guaçu.
          </p>
        </div>
        <DemoBadge minimal={true} text="Sincronização Ativa de Delegação" />
      </div>

      {/* Official CERESC Polo Showcase with Flyer & Weekly Schedule */}
      <CerescScheduleCard variant="card" />

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === type
                ? 'bg-[#0c2340] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((event) => {
          const isChampionship = event.type !== 'Treinamento';
          const confirmedCount = getEventConfirmedCount(event.id);
          const isUserConfirmed = isUserConfirmedForEvent(event.id);
          const computedStatus = getEventComputedStatus(event);

          return (
            <div
              key={event.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                isUserConfirmed
                  ? 'border-orange-400 ring-2 ring-orange-400/20 bg-gradient-to-r from-orange-50/15 via-white to-white'
                  : 'border-slate-200/90'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      event.type === 'Treinamento'
                        ? 'bg-blue-100 text-blue-800'
                        : event.type === 'Campeonato Regional'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {event.type}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${computedStatus.color}`}>
                    {computedStatus.label}
                  </span>

                  {isUserConfirmed && (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3" /> Você está Confirmado
                    </span>
                  )}

                  <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Verificado em: {event.lastVerifiedAt}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {event.title}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="font-semibold text-slate-800">{event.date}</span>
                    {event.time && <span>• {event.time}</span>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>{event.location} • <b className="text-slate-800">{event.city}</b></span>
                  </div>
                </div>

                {/* Categories */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-semibold text-slate-500">Categorias:</span>
                  {event.categories.map((cat, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {cat}
                    </span>
                  ))}
                  {event.officialLink && (
                    <a
                      href={event.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:underline"
                    >
                      Regulamento oficial <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Action */}
              <div className="shrink-0 flex flex-col sm:items-end justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 gap-2">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Organizador:</span>
                  <span className="text-xs font-bold text-slate-800">{event.organizer}</span>
                </div>

                {isChampionship ? (
                  <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
                    <button
                      onClick={() => setActiveModalEvent(event)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors w-full sm:w-auto"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Delegação Mogi Guaçu ({confirmedCount})
                    </button>

                    <button
                      onClick={() => handleToggleUserAttendance(event.id)}
                      disabled={actionLoading}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all text-center w-full sm:w-auto ${
                        isUserConfirmed
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {actionLoading ? 'Gravando...' : isUserConfirmed ? 'Cancelar Presença' : 'Confirmar Presença'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleToggleUserAttendance(event.id)}
                    disabled={actionLoading}
                    className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all text-center w-full sm:w-auto ${
                      isUserConfirmed
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isUserConfirmed ? '✓ Presença no Treino Confirmada' : 'Confirmar Presença no Treino'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delegation Modal */}
      {activeModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setActiveModalEvent(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto pr-1 space-y-5">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  Delegação de Mogi Guaçu • Prof. Max
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {activeModalEvent.title}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-orange-500" /> {activeModalEvent.date} às {activeModalEvent.time} • {activeModalEvent.location} ({activeModalEvent.city})
                </p>
              </div>

              {/* Travel Logistics Plan */}
              <div className="bg-[#0c2340] text-white p-4 sm:p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <Bus className="w-4 h-4" /> Plano de Viagem & Logística da Equipe
                  </h3>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                    Coordenação: Prof. Max
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <b className="text-orange-200 block mb-1">Ponto de Encontro:</b>
                    <span>Ginásio Municipal de Esportes de Mogi Guaçu</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <b className="text-orange-200 block mb-1">Horário de Saída da Van:</b>
                    <span>
                      {activeModalEvent.city.includes('Mogi Mirim')
                        ? '07:30 da manhã (pontual - 15 min de trajeto)'
                        : '05:30 da manhã (deslocamento para Ourinhos - SP)'}
                    </span>
                  </div>
                </div>

                {/* Mandatory Checklist */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs">
                  <b className="text-orange-200 block mb-1.5 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-orange-400" /> Checklist Obrigatório do Atleta:
                  </b>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    • Documento original com foto (RG ou CNH).
                    <br />• Raquete com borrachas homologadas na lista LARC da ITTF.
                    <br />• Uniforme oficial da equipe de Mogi Guaçu + tênis de mesa limpo com aderência.
                    <br />• Garrafa de hidratação e toalha.
                  </p>
                </div>
              </div>

              {/* Attendance Form */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Sua Confirmação de Presença:</span>
                  {isUserConfirmedForEvent(activeModalEvent.id) ? (
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                      Você está Confirmado
                    </span>
                  ) : (
                    <span className="text-slate-500 bg-slate-200 px-2 py-0.5 rounded text-[10px]">
                      Ainda não confirmado
                    </span>
                  )}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Sua Categoria de Disputa:</label>
                    <select
                      value={myCategory}
                      onChange={(e) => setMyCategory(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                    >
                      <option value="Adulto • Equipe Mogi Guaçu">Adulto • Equipe Mogi Guaçu</option>
                      <option value="Veteranos V40">Veteranos V40</option>
                      <option value="Sub-19 Masculino">Sub-19 Masculino</option>
                      <option value="Absoluto A/B">Absoluto A/B</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Meio de Transporte:</label>
                    <select
                      value={myTransport}
                      onChange={(e) => setMyTransport(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                    >
                      <option value="Van da Equipe">Van da Equipe (Mogi Guaçu)</option>
                      <option value="Transporte Próprio">Transporte Próprio</option>
                      <option value="A Definir">A Definir com o Prof. Max</option>
                    </select>
                  </div>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-600">
                    Atleta Conectado: <b>{currentUser ? currentUser.name : 'Visitante (Somente Leitura)'}</b>
                  </span>

                  <button
                    onClick={() => handleToggleUserAttendance(activeModalEvent.id)}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      isUserConfirmedForEvent(activeModalEvent.id)
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isUserConfirmedForEvent(activeModalEvent.id)
                      ? 'Desistir da Inscrição'
                      : 'Confirmar Minha Vaga na Delegação'}
                  </button>
                </div>

                {attendanceError && (
                  <div className="p-2.5 bg-red-50 text-red-800 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{attendanceError}</span>
                  </div>
                )}

                {justConfirmed && (
                  <div className="p-2 bg-emerald-50 text-emerald-800 text-center rounded-xl text-xs font-semibold border border-emerald-200">
                    Sua presença foi confirmada e salva no sistema para o Prof. Max!
                  </div>
                )}
              </div>

              {/* Roster of Confirmed Athletes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Atletas Confirmados da Delegação ({getEventConfirmedCount(activeModalEvent.id)}):
                </h4>

                <div className="space-y-2">
                  {attendances
                    .filter((a) => a.eventId === activeModalEvent.id)
                    .map((ath) => (
                      <div
                        key={ath.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          ath.isCurrentUser || (currentUser && ath.athleteName === currentUser.name)
                            ? 'bg-orange-50/60 border-orange-200 font-semibold text-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold">{ath.athleteName}</span>
                            {ath.athleteNickname && <span className="text-slate-500"> ({ath.athleteNickname})</span>}
                            {(ath.isCurrentUser || (currentUser && ath.athleteName === currentUser.name)) && (
                              <span className="ml-1 text-[10px] bg-orange-500 text-white px-1.5 py-0.2 rounded font-black">
                                VOCÊ
                              </span>
                            )}
                            <p className="text-[11px] text-slate-500">{ath.category}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {ath.transportNeed === 'Van da Equipe' ? (
                              <Bus className="w-3 h-3 text-orange-500" />
                            ) : (
                              <Car className="w-3 h-3 text-blue-500" />
                            )}
                            {ath.transportNeed}
                          </span>
                          <span className="block text-[10px] text-emerald-700 mt-0.5">
                            {ath.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveModalEvent(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Concluir Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
