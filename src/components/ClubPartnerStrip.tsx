import React from 'react';
import { Shield, ExternalLink, Award, Sparkles } from 'lucide-react';

export default function ClubPartnerStrip() {
  const partners = [
    {
      name: 'Prefeitura de Mogi Guaçu',
      role: 'Poder Executivo Municipal',
      badge: 'Apoio Oficial',
      url: 'https://www.mogiguacu.sp.gov.br/',
      color: 'from-blue-600 to-indigo-700'
    },
    {
      name: 'SEMEL Mogi Guaçu',
      role: 'Secr. de Esporte e Lazer',
      badge: 'Coordenação Técnica',
      url: 'https://www.mogiguacu.sp.gov.br/secretarias/esporte-e-lazer',
      color: 'from-orange-500 to-red-600'
    },
    {
      name: 'Centro Esportivo CERESC',
      role: 'Ginásio & Centro de Treinamento',
      badge: 'Sede Oficial',
      url: '#',
      color: 'from-emerald-600 to-teal-700'
    },
    {
      name: 'CBTM',
      role: 'Confederação Brasileira T.M.',
      badge: 'Filiação Nacional',
      url: 'https://www.cbtm.org.br/',
      color: 'from-yellow-500 to-amber-600'
    },
    {
      name: 'FPTM',
      role: 'Federação Paulista T.M.',
      badge: 'Ranking Estadual',
      url: 'https://www.fptm.com.br/',
      color: 'from-sky-600 to-blue-700'
    },
    {
      name: 'ITTF Foundation',
      role: 'Tênis de Mesa para Todos',
      badge: 'Referência Mundial',
      url: 'https://www.ittf.com/',
      color: 'from-purple-600 to-indigo-800'
    }
  ];

  return (
    <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Parceiros & Apoio Institucional • Estrutura Oficial
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspirado no modelo de clubes da Europa (Borussia Düsseldorf): integração entre gestão pública e esporte de rendimento.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 shrink-0">
          <Award className="w-3.5 h-3.5" /> CERESC & SEMEL Mogi Guaçu
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {partners.map((partner) => (
          <a
            key={partner.name}
            href={partner.url}
            target={partner.url.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between text-center relative overflow-hidden"
          >
            <div className="flex items-center justify-center mb-2">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${partner.color} text-white font-black text-xs flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}
              >
                {partner.name.slice(0, 2).toUpperCase()}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block mb-0.5">
                {partner.badge}
              </span>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                {partner.name}
              </h4>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                {partner.role}
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-center text-[10px] text-slate-400 group-hover:text-orange-600">
              <span className="flex items-center gap-1 font-semibold">
                Oficial <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
