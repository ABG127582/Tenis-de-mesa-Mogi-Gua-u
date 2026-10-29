import { useState } from 'react';
import {
  BookOpen,
  Filter,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  Search,
  CheckCircle2,
  X,
  HelpCircle,
  AlertTriangle,
  Scale,
  Sparkles,
  ExternalLink,
  FileText,
  Bookmark,
  Check,
  Award,
  BookMarked
} from 'lucide-react';
import { INITIAL_ARTICLES, REFEREE_FAQS } from '../data/mockData';
import { OFFICIAL_RULES_SECTIONS, OFFICIAL_EXTERNAL_RULE_LINKS } from '../data/officialRules';
import { LibraryArticle, RefereeRuleFAQ, OfficialRuleSection } from '../types';
import DemoBadge from '../components/DemoBadge';

export default function TheoryLibrary() {
  const [activeTab, setActiveTab] = useState<'regras-completas' | 'artigos' | 'regras-faq'>('regras-completas');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedLevel, setSelectedLevel] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<LibraryArticle | null>(null);

  // Full Rules Search & Section Filter
  const [ruleSearch, setRuleSearch] = useState('');
  const [selectedRuleCode, setSelectedRuleCode] = useState<string>('Todos');

  // Referee FAQ State
  const [faqCategory, setFaqCategory] = useState<string>('Todas');
  const [faqSearch, setFaqSearch] = useState('');

  const categories = ['Todas', 'Regras', 'Técnica', 'Empunhaduras', 'Efeitos', 'Glossário'];
  const levels = ['Todos', 'Iniciante', 'Intermediário', 'Avançado', 'Todos os Níveis'];
  const faqCategories = ['Todas', 'Saque', 'Toques na Mesa', 'Bolinha e Raquete', 'Pontuação e Finais'];

  const filteredArticles = INITIAL_ARTICLES.filter((article) => {
    const matchCategory = selectedCategory === 'Todas' || article.category === selectedCategory;
    const matchLevel = selectedLevel === 'Todos' || article.level === selectedLevel;
    const matchSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchLevel && matchSearch;
  });

  const filteredFaqs = REFEREE_FAQS.filter((faq) => {
    const matchCategory = faqCategory === 'Todas' || faq.situationCategory === faqCategory;
    const matchSearch =
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.detailedExplanation.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.shortAnswer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  const filteredRules = OFFICIAL_RULES_SECTIONS.filter((section) => {
    const matchCode = selectedRuleCode === 'Todos' || section.code === selectedRuleCode;
    const query = ruleSearch.toLowerCase().trim();
    if (!query) return matchCode;

    const matchTitle =
      section.title.toLowerCase().includes(query) ||
      section.englishTitle.toLowerCase().includes(query) ||
      section.code.includes(query);

    const matchSubsections = section.subsections.some(
      (sub) => sub.code.includes(query) || sub.text.toLowerCase().includes(query)
    );

    return matchCode && (matchTitle || matchSubsections);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Regras Oficiais & Biblioteca Técnica
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Texto integral do <b>Capítulo 2 das Regras Oficiais da ITTF</b>, regulamento homologado pela <b>CBTM</b> e links diretos para os manuais de arbitragem.
          </p>
        </div>
        <DemoBadge minimal={true} text="Regras Integrais ITTF/CBTM 2026" />
      </div>

      {/* Prominent Official Rulebooks Links Banner */}
      <div className="bg-gradient-to-r from-[#0c2340] via-[#102a4c] to-[#173a66] text-white p-5 rounded-3xl shadow-md border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-sm sm:text-base text-white">
              Portais e Documentos Oficiais Homologados (Texto Completo)
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
            Fontes Primárias Obrigatórias
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Para árbitros, atletas da equipe de Mogi Guaçu e treinadores que precisam consultar a íntegra dos regulamentos oficiais, manuais e listas de borrachas:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {OFFICIAL_EXTERNAL_RULE_LINKS.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl text-xs flex flex-col justify-between group transition-all"
            >
              <div>
                <p className="font-bold text-white group-hover:text-orange-300 transition-colors flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="line-clamp-2">{link.title}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {link.description}
                </p>
              </div>
              <span className="mt-3 text-[10px] font-semibold text-orange-400 flex items-center gap-1">
                Abrir site oficial &rarr;
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('regras-completas')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'regras-completas'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4 text-orange-400" /> Regulamento Oficial Completo (Capítulo 2 ITTF / CBTM)
        </button>

        <button
          onClick={() => setActiveTab('artigos')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'artigos'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Artigos Didáticos & Fundamentos ({INITIAL_ARTICLES.length})
        </button>

        <button
          onClick={() => setActiveTab('regras-faq')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'regras-faq'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4 text-orange-400" /> Tira-Dúvidas Rápido na Mesa ({REFEREE_FAQS.length})
        </button>
      </div>

      {/* TAB 1: REGULAMENTO OFICIAL COMPLETO (Capítulo 2 ITTF / CBTM) */}
      {activeTab === 'regras-completas' && (
        <div className="space-y-6">
          {/* ITTF Chapter 2 vs Chapter 3 Distinction Guide */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
              <Scale className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Entendendo a Estrutura do Regulamento Oficial (ITTF & CBTM)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                <p className="font-extrabold text-blue-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Capítulo 2: Leis Oficiais do Tênis de Mesa
                </p>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Trata da <b>física e mecânica do jogo</b>: dimensões da mesa, rede, bola, raquete (madeira 85%), definições, regras de saque (palma aberta, subida 16cm), devoluções válidas, ponto, anulação (let) e o sistema de aceleração. Aplicam-se universalmente a qualquer jogo oficial.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                <p className="font-extrabold text-orange-950 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                  Capítulo 3: Regulamentos de Competições & Conduta
                </p>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Trata da <b>administração de torneios</b>: vestimentas (cores contrastantes com a bola), conduta esportiva e punições (cartões amarelo/vermelho), intervalos de toalha (a cada 6 pontos), tempo técnico de 1 minuto por partida e atribuições do Árbitro Geral.
                </p>
              </div>
            </div>
          </div>

          {/* Rule Filter & Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ruleSearch}
                  onChange={(e) => setRuleSearch(e.target.value)}
                  placeholder="Pesquisar por artigo, termo ou código (ex: 2.6 saque, 2.10 ponto, rede, 16 cm, 40 mm)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <select
                value={selectedRuleCode}
                onChange={(e) => setSelectedRuleCode(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="Todos">Todos os Capítulos (2.1 a 2.15)</option>
                {OFFICIAL_RULES_SECTIONS.map((sec) => (
                  <option key={sec.code} value={sec.code}>
                    {sec.code} - {sec.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Section Jump Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Atalhos:</span>
              <button
                onClick={() => setSelectedRuleCode('Todos')}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap ${
                  selectedRuleCode === 'Todos' ? 'bg-[#0c2340] text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Ver Todas
              </button>
              {OFFICIAL_RULES_SECTIONS.map((sec) => (
                <button
                  key={sec.code}
                  onClick={() => setSelectedRuleCode(sec.code)}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap ${
                    selectedRuleCode === sec.code ? 'bg-[#0c2340] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sec.code} {sec.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Full Sections List */}
          <div className="space-y-5">
            {filteredRules.map((section) => (
              <div
                key={section.code}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-[#0c2340] text-white flex items-center justify-center font-black text-xs shrink-0">
                      {section.code}
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {section.title}
                      </h3>
                      <p className="text-xs text-slate-400 italic font-medium">
                        {section.englishTitle}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {section.officialReference}
                  </span>
                </div>

                {/* Subsections List (Exact Official Text) */}
                <div className="space-y-2.5">
                  {section.subsections.map((sub) => (
                    <div
                      key={sub.code}
                      className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors flex items-start gap-3"
                    >
                      <span className="font-mono font-bold text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded shrink-0 mt-0.5">
                        {sub.code}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                        {sub.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredRules.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800">Nenhum artigo encontrado</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tente buscar por termos como &quot;2.6&quot;, &quot;saque&quot;, &quot;rede&quot; ou &quot;ponto&quot;.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ARTIGOS TÉCNICOS & FUNDAMENTOS */}
      {activeTab === 'artigos' && (
        <div className="space-y-5">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por tema, golpe, regra ou termo técnico..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700"
                >
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      Nível: {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#0c2340] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setActiveArticle(article)}
                className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {article.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {article.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Pontos-chave:
                    </p>
                    <ul className="space-y-1">
                      {article.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                        <li key={idx} className="text-[11px] text-slate-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="line-clamp-1">{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Revisado: {article.reviewedAt}
                  </span>
                  <span className="font-semibold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Ler completo <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TIRA-DÚVIDAS DE ARBITRAGEM NA MESA */}
      {activeTab === 'regras-faq' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-orange-500" />
                  Consulta Rápida em Caso de Dúvida Durante o Jogo
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Base fundamentada no Código Internacional de Regras da ITTF e CBTM para resolver impasses de jogo.
                </p>
              </div>

              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
                Regras Homologadas
              </span>
            </div>

            {/* FAQ Search and Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Pesquisar situação (ex: dedo, rede, quina, toque na mesa, 5º set)..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {faqCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFaqCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      faqCategory === c
                        ? 'bg-[#0c2340] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaqs.map((faq) => {
              const isValido = faq.verdict === 'Válido';
              const isLet = faq.verdict === 'Let (Repete o Ponto)';

              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {faq.situationCategory}
                      </span>

                      <span
                        className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          isValido
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isLet
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {faq.verdict}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {faq.question}
                    </h4>

                    <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                        Decisão Regulamentar: <span className="text-orange-600">{faq.shortAnswer}</span>
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {faq.detailedExplanation}
                      </p>

                      {faq.primarySources && faq.primarySources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="font-semibold text-slate-500">Fontes Primárias:</span>
                          {faq.primarySources.map((source, sIdx) => (
                            <span key={sIdx} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">
                              {source}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{faq.officialRuleCode}</span>
                    <div className="flex items-center gap-3">
                      {faq.reviewedAt && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-500" /> Revisto em: {faq.reviewedAt}
                        </span>
                      )}
                      <span className="text-blue-600 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Estatuto ITTF
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto pr-2 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {activeArticle.category}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Nível: {activeArticle.level}
                </span>
                <span className="text-xs font-medium text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500">
                  {activeArticle.readTime} de leitura
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {activeArticle.title}
              </h2>

              <p className="text-sm font-medium text-slate-600 italic bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                {activeArticle.summary}
              </p>

              <div className="space-y-3 pt-2 text-slate-700 text-sm leading-relaxed">
                {activeArticle.content.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Principais Conclusões para o Jogo:
                </h4>
                <ul className="space-y-1.5">
                  {activeArticle.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="text-xs text-emerald-900 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-500">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Autoria: {activeArticle.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Data de revisão: {activeArticle.reviewedAt}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Fontes consultadas: </span>
                  {activeArticle.sources.join(' • ')}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
