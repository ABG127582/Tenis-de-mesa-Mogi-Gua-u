import {
  Info,
  CheckCircle2,
  ShieldCheck,
  Heart,
  Target,
  Sparkles,
  HelpCircle,
  FileCheck,
  ExternalLink,
  Users
} from 'lucide-react';
import DemoBadge from '../components/DemoBadge';
import CerescScheduleCard from '../components/CerescScheduleCard';

export default function AboutProject() {
  const coachQuestions = [
    {
      q: 'O site será 100% aberto ao público ou com área restrita para os atletas matriculados?',
      status: 'Público para conteúdos didáticos; área logada para delegação e histórico'
    },
    {
      q: 'Qual é o papel institucional da Prefeitura/Secretaria de Esportes? (Apenas cessão de espaço ou parceria formal?)',
      status: 'Parceria Oficial: Polo no CERESC pela Secretaria de Esporte e Lazer e Prefeitura de Mogi Guaçu'
    },
    {
      q: 'Quem terá autoridade técnica para homologar novos artigos e planos de treino?',
      status: 'Treinador Titular e Comissão Técnica'
    },
    {
      q: 'Como será registrado o consentimento dos pais/responsáveis para publicação de fotos de menores?',
      status: 'Termo digital seguro com validação de responsável e anonimização'
    },
    {
      q: 'Qual é a periodicidade ideal para atualização de avisos e inscrições de torneios?',
      status: 'Semanal ou a cada convocatória oficial da SEMEL'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-900 text-white rounded-xl">
              <Info className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sobre o Projeto Tênis de Mesa Mogi Guaçu
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Plataforma digital integrada para difusão didática, valorização dos atletas e fortalecimento do tênis de mesa guaçuano.
          </p>
        </div>
        <DemoBadge minimal={true} text="Polo Oficial CERESC • SEMEL Mogi Guaçu" />
      </div>

      {/* Hero Banner with Slogan */}
      <div className="bg-[#0c2340] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-white/10">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold tracking-wider uppercase text-orange-400 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30">
            Princípio Orientador
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-3 mb-2 tracking-tight">
            Aprender • Treinar • Evoluir • Compartilhar
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            A iniciativa nasce da parceria com a Secretaria de Esporte e Lazer (SEMEL) e a Prefeitura de Mogi Guaçu para democratizar o acesso à iniciação esportiva no CERESC, estruturar o aperfeiçoamento da equipe de competição e registrar as conquistas com transparência e segurança.
          </p>
        </div>
      </div>

      {/* Official Polo CERESC Showcase Card */}
      <CerescScheduleCard variant="card" />

      {/* The 4 Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">
            01
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Aprender</h3>
          <p className="text-xs text-slate-500 mt-1">
            Biblioteca completa de regras oficiais ITTF 2026, empunhaduras e física dos efeitos.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm mb-3">
            02
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Treinar</h3>
          <p className="text-xs text-slate-500 mt-1">
            Exercícios práticos no CERESC com cronômetro, metas de consistência e fichas de observação.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-sm mb-3">
            03
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Evoluir</h3>
          <p className="text-xs text-slate-500 mt-1">
            Diário psicológico esportivo, rotinas sob pressão e diário de partidas pós-jogo.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-3">
            04
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Compartilhar</h3>
          <p className="text-xs text-slate-500 mt-1">
            Avisos oficiais da SEMEL, convocação para van de torneios e espírito de equipe.
          </p>
        </div>
      </div>

      {/* Head Coach & Technical Leadership */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src="/assets/aistudio/Gemini_Generated_Image_si6kkasi6kkasi6k_c5b33fbe.jpeg"
          alt="Professor Max"
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover object-top border-4 border-orange-500 shadow-md shrink-0"
        />
        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Liderança Técnica
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Técnico Nível 2 ITTF
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              18 Anos de Experiência
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Professor Max • Coordenação Técnica Municipal
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Com mais de 18 anos de dedicação ao tênis de mesa guaçuano, o Professor Max lidera os treinamentos competitivos e as turmas de iniciação no CERESC, promovendo disciplina, excelência técnica e espírito esportivo em todas as categorias de Mogi Guaçu.
          </p>
        </div>
      </div>

      {/* Validation Questionnaire with the Coach */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-orange-500" />
            Alinhamento Institucional & Diretrizes Técnicas
          </h3>
          <span className="text-xs text-slate-500 font-medium">Comissão Técnica & SEMEL</span>
        </div>
        <div className="space-y-3">
          {coachQuestions.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <p className="font-bold text-slate-800">{item.q}</p>
              <p className="text-emerald-700 font-semibold mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
