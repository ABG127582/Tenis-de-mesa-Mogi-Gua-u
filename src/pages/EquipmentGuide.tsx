import { useState, useEffect } from 'react';
import {
  Shield,
  Gauge,
  Sparkles,
  Layers,
  Wrench,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Save,
  Clock,
  AlertTriangle,
  Flame,
  Info,
  Check,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { INITIAL_EQUIPMENT } from '../data/mockData';
import DemoBadge from '../components/DemoBadge';
import { AuthUser, AthleteEquipmentSetup } from '../types';
import { apiService } from '../services/api';

interface EquipmentGuideProps {
  currentUser?: AuthUser | null;
  onOpenAuthModal?: () => void;
}

export default function EquipmentGuide({ currentUser, onOpenAuthModal }: EquipmentGuideProps) {
  const [activeTab, setActiveTab] = useState<'catalogo' | 'minha-raquete'>('catalogo');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Athlete Equipment Setup State
  const [equipmentSetup, setEquipmentSetup] = useState<AthleteEquipmentSetup>({
    bladeName: 'Butterfly Primorac Classic (5 Folhas)',
    bladeType: 'Madeira Pura 5F (Allround+)',
    bladeWeightGrams: 86,
    gripType: 'Clássica (Shakehand)',
    fhRubberName: 'Yasaka Rakza 7 (2.0mm)',
    fhRubberType: 'Borracha Lisa / Tensionada',
    fhSpongeThickness: '2.0mm',
    fhAssemblyDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    bhRubberName: 'Xiom Vega Europe (2.0mm)',
    bhRubberType: 'Borracha Lisa / Macia',
    bhSpongeThickness: '2.0mm',
    bhAssemblyDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    glueType: 'Cola à Base d\'Água (WBC Free Chack)',
    totalWeightGrams: 182,
    notes: 'Conjunto balanceado para jogo allround com foco em controle de contra-ataque e regularidade no forehand.'
  });

  const [isLoadingSetup, setIsLoadingSetup] = useState(false);
  const [isSavingSetup, setIsSavingSetup] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load user equipment setup from server
  useEffect(() => {
    if (!currentUser) return;
    setIsLoadingSetup(true);
    apiService.equipment.getMyEquipment()
      .then((data) => {
        if (data) {
          setEquipmentSetup(data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingSetup(false));
  }, [currentUser]);

  const categories = [
    'Todas',
    'Madeira',
    'Borracha Lisa',
    'Pino Longo',
    'Bolas e Acessórios'
  ];

  const filteredEquipment = INITIAL_EQUIPMENT.filter(
    (item) => selectedCategory === 'Todas' || item.type === selectedCategory
  );

  // Calculate days since assembly for wear assessment
  const calculateDaysSince = (dateStr?: string) => {
    if (!dateStr) return 0;
    const diffTime = Math.abs(Date.now() - new Date(dateStr).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const fhDays = calculateDaysSince(equipmentSetup.fhAssemblyDate);
  const bhDays = calculateDaysSince(equipmentSetup.bhAssemblyDate);

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuthModal?.();
      return;
    }

    setIsSavingSetup(true);
    setSaveFeedback(null);
    try {
      await apiService.equipment.updateMyEquipment(equipmentSetup);
      setSaveFeedback({ type: 'success', text: 'Ficha de equipamento salva com sucesso no banco de dados!' });
    } catch {
      setSaveFeedback({ type: 'error', text: 'Não foi possível salvar o equipamento. Tente novamente.' });
    } finally {
      setIsSavingSetup(false);
      setTimeout(() => setSaveFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-900 text-white rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Equipamentos, Materiais & Ficha Técnica
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Análise técnica de materiais, regulamentos ITTF/CBTM e ficha individual de lâmina e borrachas do atleta.
          </p>
        </div>
        <DemoBadge minimal={true} text="Regulamentação Oficial ITTF 2026" />
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('catalogo')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'catalogo'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 text-orange-400" />
          Guia Técnico & Regulamentação
        </button>

        <button
          onClick={() => setActiveTab('minha-raquete')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'minha-raquete'
              ? 'bg-[#0c2340] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4 text-orange-400" />
          Minha Ficha de Material (Minha Raquete)
        </button>
      </div>

      {/* TAB 1: CATALOGO E GUIA TÉCNICO */}
      {activeTab === 'catalogo' && (
        <div className="space-y-6">
          {/* Categories Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Equipment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEquipment.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                      {item.type}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Atualizado: {item.updatedAt}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">{item.name}</h3>

                  <p className="text-xs font-medium text-orange-600 mb-3">
                    Indicado para: {item.idealFor}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Technical Ratings (Speed, Spin, Control) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Velocidade:</span>
                      <div className="flex items-center gap-1.5 w-1/2">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-red-500 h-full rounded-full"
                            style={{ width: `${item.characteristics.speed * 10}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 w-6 text-right">
                          {item.characteristics.speed}/10
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Efeito (Spin):</span>
                      <div className="flex items-center gap-1.5 w-1/2">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-orange-500 h-full rounded-full"
                            style={{ width: `${item.characteristics.spin * 10}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 w-6 text-right">
                          {item.characteristics.spin}/10
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Controle:</span>
                      <div className="flex items-center gap-1.5 w-1/2">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${item.characteristics.control * 10}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 w-6 text-right">
                          {item.characteristics.control}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Maintenance tip */}
                <div className="mt-4 pt-3 border-t border-slate-100 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/60 text-xs text-amber-950 flex items-start gap-2">
                  <Wrench className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Dica de Conservação: </span>
                    {item.maintenanceTip}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Guide to sponge thickness and racket rules */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              Regra de Espessura e Cores de Borracha (ITTF 2.4)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              • A espessura total combinada da borracha e esponja não pode ultrapassar <b>4,0 mm</b>.
              <br />• Um lado da raquete deve ser obrigatoriamente <b>preto</b>. O outro lado pode ser vermelho ou uma das cores autorizadas pela ITTF (azul, rosa, violeta ou verde), garantindo contraste claro para o adversário.
              <br />• A lâmina deve ser composta por pelo menos <b>85% de madeira natural</b> em sua espessura total.
              <br />• Apenas colas à base d&apos;água (Water-based Free Chack) são permitidas; solventes orgânicos voláteis (VOCs) são terminantemente proibidos nas competições da CBTM e da Liga.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: MINHA FICHA DE MATERIAL */}
      {activeTab === 'minha-raquete' && (
        <div className="space-y-6">
          {/* Guest Warning */}
          {!currentUser && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Você está visualizando uma ficha modelo. <b>Entre na sua conta de atleta</b> para registrar seu equipamento oficial e receber alertas de troca de borracha.
                </span>
              </div>
              <button
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                Entrar Agora
              </button>
            </div>
          )}

          {/* Feedback Toast */}
          {saveFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
                saveFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-red-50 text-red-900 border-red-200'
              }`}
            >
              {saveFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{saveFeedback.text}</span>
            </div>
          )}

          {/* Racket Visual Summary & Maintenance Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Lâmina / Madeira */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Lâmina Principal
                </span>
                <h4 className="font-extrabold text-slate-900 text-base mt-2">{equipmentSetup.bladeName}</h4>
                <p className="text-xs text-slate-600 mt-1">{equipmentSetup.bladeType}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Peso: <b>{equipmentSetup.bladeWeightGrams}g</b></span>
                <span>Cabo: <b>{equipmentSetup.gripType.split(' ')[0]}</b></span>
              </div>
            </div>

            {/* 2. Borracha Forehand */}
            <div className="bg-white p-5 rounded-3xl border border-red-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                    Forehand (Ataque)
                  </span>
                  <span className="text-[11px] font-bold text-slate-600">{fhDays} dias de uso</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base mt-2">{equipmentSetup.fhRubberName}</h4>
                <p className="text-xs text-slate-600 mt-1">{equipmentSetup.fhRubberType} • {equipmentSetup.fhSpongeThickness}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                {fhDays > 90 ? (
                  <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Avaliar troca para torneios
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Aderência e tensão ideais
                  </span>
                )}
              </div>
            </div>

            {/* 3. Borracha Backhand */}
            <div className="bg-white p-5 rounded-3xl border border-slate-300 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-slate-900/10 rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 bg-slate-200 px-2 py-0.5 rounded-full">
                    Backhand (Controle/Bloqueio)
                  </span>
                  <span className="text-[11px] font-bold text-slate-600">{bhDays} dias de uso</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base mt-2">{equipmentSetup.bhRubberName}</h4>
                <p className="text-xs text-slate-600 mt-1">{equipmentSetup.bhRubberType} • {equipmentSetup.bhSpongeThickness}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                {bhDays > 90 ? (
                  <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Avaliar troca para torneios
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Aderência e controle ideais
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form to Edit & Register Equipment */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              Atualizar Dados da Minha Raquete
            </h3>

            <form onSubmit={handleSaveEquipment} className="space-y-6 text-xs sm:text-sm">
              {/* Blade Section */}
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  1. Madeira / Lâmina
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Modelo da Madeira</label>
                    <input
                      type="text"
                      required
                      value={equipmentSetup.bladeName}
                      onChange={(e) => setEquipmentSetup({ ...equipmentSetup, bladeName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Composição da Madeira</label>
                    <select
                      value={equipmentSetup.bladeType}
                      onChange={(e) => setEquipmentSetup({ ...equipmentSetup, bladeType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    >
                      <option value="Madeira Pura 5F (Allround)">Madeira Pura 5 Folhas (Allround)</option>
                      <option value="Madeira Pura 7F (Ofensiva)">Madeira Pura 7 Folhas (Ofensiva)</option>
                      <option value="Carbono ALC (Arylate Carbon)">Carbono ALC (Arylate Carbon)</option>
                      <option value="Carbono ZLC (Zylon Carbon)">Carbono ZLC (Zylon Carbon)</option>
                      <option value="Madeira Clássica Defensiva">Madeira Clássica Defensiva</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Peso da Lâmina (gramas)</label>
                    <input
                      type="number"
                      value={equipmentSetup.bladeWeightGrams}
                      onChange={(e) => setEquipmentSetup({ ...equipmentSetup, bladeWeightGrams: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de Empunhadura</label>
                    <select
                      value={equipmentSetup.gripType}
                      onChange={(e) => setEquipmentSetup({ ...equipmentSetup, gripType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    >
                      <option value="Clássica (Shakehand)">Clássica (Shakehand)</option>
                      <option value="Caneta Japonesa (Penhold)">Caneta Japonesa (Penhold)</option>
                      <option value="Classineta (CPen)">Classineta (CPen)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Forehand Rubber Section */}
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-red-600">
                  2. Borracha de Forehand (Lado de Ataque)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Modelo da Borracha</label>
                    <input
                      type="text"
                      required
                      value={equipmentSetup.fhRubberName}
                      onChange={(e) => setEquipmentSetup({ ...equipmentSetup, fhRubberName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de Superfície</label>
                    <select
                      value={equipmentSetup.fhRubberType}
                      onChange={(e) => setEquipmentSetup({ ...equipmentSetup, fhRubberType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    >
                      <option value="Borracha Lisa / Tensionada">Borracha Lisa / Tensionada</option>
                      <option value="Chinesa Grudenta (Tacky)">Chinesa Grudenta (Tacky / Hurricane)</option>
                      <option value="Pino Curto">Pino Curto (Ataque Rápido)</option>
                      <option value="Pino Longo">Pino Longo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Espessura da Esponja</label>
                    <select
                      value={equipmentSetup.fhSpongeThickness}
                      onChange={(e) => setEquipmentSetup({ ...equipmentSetup, fhSpongeThickness: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    >
                      <option value="2.1mm / Max">2.1mm / Max</option>
                      <option value="2.0mm">2.0mm</option>
                      <option value="1.8mm">1.8mm</option>
                      <option value="1.5mm">1.5mm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Data da Última Colagem</label>
                    <input
                      type="date"
                      value={equipmentSetup.fhAssemblyDate}
                      onChange={(e) => setEquipmentSetup({ ...equipmentSetup, fhAssemblyDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Backhand Rubber Section */}
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-700">
                  3. Borracha de Backhand (Lado Oposto)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Modelo da Borracha</label>
                    <input
                      type="text"
                      required
                      value={equipmentSetup.bhRubberName}
                      onChange={(e) => setEquipmentSetup({ ...equipmentSetup, bhRubberName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de Superfície</label>
                    <select
                      value={equipmentSetup.bhRubberType}
                      onChange={(e) => setEquipmentSetup({ ...equipmentSetup, bhRubberType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    >
                      <option value="Borracha Lisa / Macia">Borracha Lisa / Macia (Controle)</option>
                      <option value="Borracha Lisa / Tensionada">Borracha Lisa / Tensionada</option>
                      <option value="Pino Longo com Esponja">Pino Longo com Esponja</option>
                      <option value="Pino Longo OX (Sem Esponja)">Pino Longo OX (Sem Esponja)</option>
                      <option value="Anti-Spin">Anti-Spin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Espessura da Esponja</label>
                    <select
                      value={equipmentSetup.bhSpongeThickness}
                      onChange={(e) => setEquipmentSetup({ ...equipmentSetup, bhSpongeThickness: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    >
                      <option value="2.0mm">2.0mm</option>
                      <option value="2.1mm / Max">2.1mm / Max</option>
                      <option value="1.8mm">1.8mm</option>
                      <option value="1.5mm">1.5mm</option>
                      <option value="OX (Sem Esponja)">OX (Sem Esponja)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Data da Última Colagem</label>
                    <input
                      type="date"
                      value={equipmentSetup.bhAssemblyDate}
                      onChange={(e) => setEquipmentSetup({ ...equipmentSetup, bhAssemblyDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Total Weight & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peso Total Montado (g)</label>
                  <input
                    type="number"
                    value={equipmentSetup.totalWeightGrams}
                    onChange={(e) => setEquipmentSetup({ ...equipmentSetup, totalWeightGrams: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Observações do Atleta / Treinador</label>
                  <input
                    type="text"
                    placeholder="Ex: Borrachas coladas com 2 camadas de Free Chack na madeira e 1 na esponja."
                    value={equipmentSetup.notes || ''}
                    onChange={(e) => setEquipmentSetup({ ...equipmentSetup, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingSetup}
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSavingSetup ? 'Salvando Ficha...' : 'Salvar Ficha do Equipamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
