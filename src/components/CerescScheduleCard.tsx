import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Maximize2,
  X,
  ExternalLink,
  Users,
  CheckCircle2
} from 'lucide-react';

interface CerescScheduleCardProps {
  variant?: 'banner' | 'card' | 'compact';
}

export default function CerescScheduleCard({ variant = 'card' }: CerescScheduleCardProps) {
  const [showFlyerModal, setShowFlyerModal] = useState(false);

  const flyerImgUrl = '/assets/aistudio/image_9816758a.png';
  const whatsappNumber = '5519998544817';
  const whatsappDisplay = '(19) 99854-4817';
  const whatsappMessage = encodeURIComponent(
    'Olá! Gostaria de mais informações sobre as aulas e treinamentos de Tênis de Mesa no CERESC (Secretaria de Esporte e Lazer de Mogi Guaçu).'
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const scheduleSlots = [
    {
      days: 'Segunda-feira',
      type: 'Treinamento',
      typeBadgeColor: 'bg-red-500/10 text-red-700 border-red-200',
      typeDotColor: 'bg-red-500',
      description: 'Aperfeiçoamento técnico, simulações de partida e atletas da equipe',
      periods: [
        { label: 'Manhã', time: '09h00 às 12h00' },
        { label: 'Tarde', time: '14h00 às 18h00' }
      ]
    },
    {
      days: 'Terça e Quinta-feira',
      type: 'Iniciação',
      typeBadgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      typeDotColor: 'bg-emerald-500',
      description: 'Aulas abertas à comunidade, fundamentos básicos e novas turmas (inclusive noturno)',
      periods: [
        { label: 'Manhã', time: '09h00 às 12h00' },
        { label: 'Tarde', time: '14h00 às 18h00' },
        { label: 'Noite', time: '19h00 às 21h00' }
      ]
    },
    {
      days: 'Sexta-feira',
      type: 'Treinamento',
      typeBadgeColor: 'bg-red-500/10 text-red-700 border-red-200',
      typeDotColor: 'bg-red-500',
      description: 'Tática, trabalho de pernas e preparação para competições',
      periods: [
        { label: 'Manhã', time: '09h00 às 12h00' },
        { label: 'Tarde', time: '13h00 às 15h00' }
      ]
    }
  ];

  const renderFlyerModal = () => (
    showFlyerModal ? (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        onClick={() => setShowFlyerModal(false)}
      >
        <div
          className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                  CERESC
                </span>
                Cartaz Oficial de Tênis de Mesa
              </h3>
              <p className="text-[11px] text-slate-500">
                Secretaria de Esporte e Lazer • Prefeitura de Mogi Guaçu
              </p>
            </div>
            <button
              onClick={() => setShowFlyerModal(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Image Display */}
          <div className="p-3 bg-slate-900/5 flex items-center justify-center overflow-auto max-h-[68vh]">
            <img
              src={flyerImgUrl}
              alt="Cartaz Completo de Tênis de Mesa CERESC Mogi Guaçu"
              className="max-h-[64vh] w-auto object-contain rounded-xl shadow-md border border-slate-200"
            />
          </div>

          {/* Modal Footer with Actions */}
          <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left w-full sm:w-auto">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Contato Oficial
              </span>
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-emerald-600" />
                {whatsappDisplay}
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFlyerModal(false)}
                className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                Abrir no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    ) : null
  );

  if (variant === 'compact') {
    return (
      <>
        <div className="bg-gradient-to-br from-slate-900 to-[#0c2340] rounded-2xl p-4 text-white border border-slate-700/60 shadow-md">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                CERESC
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Iniciação & Treinamento
              </span>
            </div>
            <button
              onClick={() => setShowFlyerModal(true)}
              className="text-[11px] text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              Ver cartaz <Maximize2 className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            Segundas e Sextas (Treinamento) • Terças e Quintas (Iniciação manhã, tarde e noite).
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp: {whatsappDisplay}
          </a>
        </div>
        {renderFlyerModal()}
      </>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Top Header Ribbon */}
      <div className="bg-gradient-to-r from-[#0c2340] via-slate-900 to-[#1e3a5f] text-white p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-red-600 text-white text-xs font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Polo Oficial • CERESC
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 text-xs px-2.5 py-0.5 rounded-md border border-white/10">
                Secretaria de Esporte e Lazer
              </span>
              <span className="bg-white/10 backdrop-blur-xs text-slate-200 text-xs px-2.5 py-0.5 rounded-md border border-white/10 hidden sm:inline-block">
                Prefeitura de Mogi Guaçu
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 pt-1">
              Grade Semanal de Tênis de Mesa no CERESC
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              Centro Esportivo e Recreativo dos Servidores e Comunidade — Mogi Guaçu / SP
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowFlyerModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Ver Cartaz Oficial
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp: {whatsappDisplay}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Body: Grid with Flyer Thumbnail and Schedule Details */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Flyer Preview Card (Left 4 cols) */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center text-center">
          <div
            onClick={() => setShowFlyerModal(true)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white"
          >
            <img
              src={flyerImgUrl}
              alt="Cartaz Oficial de Tênis de Mesa CERESC Mogi Guaçu"
              className="w-full max-h-72 object-cover object-top transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-red-600" /> Clique para ampliar
              </span>
            </div>
          </div>

          <div className="mt-3.5 space-y-1 w-full text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Divulgação Oficial</span>
              <span className="text-[10px] text-slate-500 font-medium">SEMEL Mogi Guaçu</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Aulas gratuitas de iniciação e treinos para a equipe municipal no CERESC.
            </p>
          </div>

          {/* Quick WhatsApp Action Button */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 rounded-xl text-xs font-bold transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Mais informações pelo WhatsApp</span>
          </a>
        </div>

        {/* Schedule Breakdown (Right 8 cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quadro de Dias e Modalidades
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Horários confirmados pela Secretaria
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {scheduleSlots.map((slot, index) => (
              <div
                key={index}
                className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${slot.typeDotColor}`} />
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {slot.days}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${slot.typeBadgeColor}`}
                  >
                    {slot.type}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-3">
                  {slot.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {slot.periods.map((period, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-2xs"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        {period.label}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-500 shrink-0" />
                        {period.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Notice footer */}
          <div className="bg-blue-50/80 border border-blue-200/70 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
            <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Como participar:</span>
              <p className="text-blue-800 leading-relaxed text-[11px]">
                Compareça ao CERESC nos horários de <strong>Iniciação</strong> (terças e quintas) com vestimenta esportiva e tênis, ou envie uma mensagem diretamente para o WhatsApp oficial <strong>{whatsappDisplay}</strong> da Secretaria de Esporte e Lazer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {renderFlyerModal()}
    </div>
  );
}
