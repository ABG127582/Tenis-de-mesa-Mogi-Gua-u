import {
  Globe,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Award,
  Video,
  CheckCircle2
} from 'lucide-react';
import { INITIAL_INTEREST_LINKS } from '../data/mockData';
import DemoBadge from '../components/DemoBadge';

export default function UsefulLinks() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Páginas de Interesse e Fontes Oficiais
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Diretório curado com links oficiais das federações internacional e nacional, manuais de arbitragem e cursos técnicos.
          </p>
        </div>
        <DemoBadge minimal={true} text="Links Verificados e Homologados" />
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {INITIAL_INTEREST_LINKS.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  {item.category}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  Idioma: {item.language}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                {item.title}
              </h3>
              <p className="text-xs font-semibold text-slate-400 mb-2">{item.organization}</p>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Verificado: {item.verifiedAt}
              </span>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0c2340] hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Acessar Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Reference Manuals Box */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-xs text-slate-700 space-y-2">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-orange-500" /> Manuais Técnicos Recomendados para Download Gratuito
        </h4>
        <p className="text-slate-600">
          • Manual Oficial de Formação de Treinadores ITTF Nível 1 (Disponível em português no portal ITTF Education).
        </p>
        <p className="text-slate-600">
          • Livro de Regras e Regulamentos Internacionais de Competição da ITTF (Capítulo 2 e 3).
        </p>
        <p className="text-slate-600">
          • Diretrizes de Iniciação e Desenvolvimento Motor para Jovens Mesa-tenistas (CBTM).
        </p>
      </div>
    </div>
  );
}
