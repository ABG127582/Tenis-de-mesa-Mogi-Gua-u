import { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Users,
  Eye,
  Trash2,
  HelpCircle,
  Send
} from 'lucide-react';
import { AuthUser } from '../types';
import { apiService } from '../services/api';

interface PrivacyPolicyProps {
  currentUser: AuthUser | null;
}

export default function PrivacyPolicy({ currentUser }: PrivacyPolicyProps) {
  const [isMinor, setIsMinor] = useState(false);
  const [legalGuardianName, setLegalGuardianName] = useState('');
  const [legalGuardianRelationship, setLegalGuardianRelationship] = useState('Mãe/Pai');
  const [legalGuardianPhone, setLegalGuardianPhone] = useState('');
  const [legalGuardianCpf, setLegalGuardianCpf] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmitConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      setErrorMsg('Você precisa marcar a caixa concordando com os termos para registrar seu consentimento.');
      return;
    }

    if (isMinor && !legalGuardianName.trim()) {
      setErrorMsg('Para atletas menores de 18 anos, é obrigatório informar o nome do responsável legal.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSubmitSuccess(null);

    try {
      const res = await apiService.consents.register({
        policyVersion: 'LGPD-2026.1-MOGI',
        isMinor,
        legalGuardianName: isMinor ? legalGuardianName.trim() : undefined,
        legalGuardianCpf: isMinor && legalGuardianCpf.trim() ? legalGuardianCpf.trim() : undefined,
        legalGuardianRelationship: isMinor ? legalGuardianRelationship : undefined,
        legalGuardianPhone: isMinor && legalGuardianPhone.trim() ? legalGuardianPhone.trim() : undefined,
        agreedTerms: true
      });

      setSubmitSuccess(`Consentimento registrado com sucesso no banco de dados com protocolo: ${res.consentId}`);
      setAgreedTerms(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao registrar consentimento no servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Termos de Uso e Política de Privacidade (LGPD)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Conformidade com a Lei nº 13.709/2018 • Versão 2026.1 • Mogi Guaçu - SP
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Auditoria & Conformidade
          </span>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Esta Política de Privacidade estabelece as diretrizes de governança e segurança para o tratamento de dados pessoais no âmbito da plataforma comunitária e esportiva do <strong>Tênis de Mesa Mogi Guaçu</strong>, sob coordenação técnica do <strong>Professor Max</strong>.
        </p>
      </div>

      {/* Main Legal Clauses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Finalidade Esportiva */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
            1. Finalidade do Tratamento de Dados
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Os dados coletados têm a finalidade estrita de:
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Organizar escalas de treinos e turmas no Ginásio Municipal de Mogi Guaçu.</li>
            <li>Gerenciar convocações e lista de presença em campeonatos regionais (ex: Mogi Mirim, Ourinhos).</li>
            <li>Planejar a logística de transporte seguro (Van da Equipe).</li>
            <li>Monitorar a evolução técnica e assiduidade dos atletas pelo Prof. Max.</li>
          </ul>
          <p className="text-[11px] text-slate-500 italic">
            Nenhum dado é comercializado, cedido ou compartilhado com terceiros para fins de marketing ou publicidade.
          </p>
        </div>

        {/* Card 2: Dados Coletados */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Eye className="w-4 h-4" />
            </div>
            2. Minimização e Dados Coletados
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Em estrito cumprimento ao princípio da necessidade (Art. 6º, III, LGPD), coletamos apenas:
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li><strong>Identificação esportiva:</strong> Nome, apelido aprovado e e-mail institucional.</li>
            <li><strong>Atuação no esporte:</strong> Categoria (Adulto, Sub-19, etc.), empunhadura e nível técnico.</li>
            <li><strong>Participação:</strong> Presença confirmada em eventos e duração de treinos práticos.</li>
            <li><strong>Relatos e fotos:</strong> Somente publicados mediante autorização prévia por escrito.</li>
          </ul>
        </div>

        {/* Card 3: Proteção a Menores de 18 Anos */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 md:col-span-2">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
            3. Proteção Específica para Atletas Menores de Idade (Art. 14 LGPD)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            O tratamento de dados de crianças e adolescentes (categorias Sub-11, Sub-13, Sub-15 e Sub-19) é realizado no seu melhor interesse e exige o <strong>consentimento específico dado por pelo menos um dos pais ou pelo responsável legal</strong>.
          </p>
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900">
            <strong>Regras Obrigatórias para Menores:</strong>
            <ul className="mt-1 space-y-1 list-disc list-inside text-[11px]">
              <li>Não é permitida a exposição de contatos diretos (telefone ou endereço) de menores na plataforma.</li>
              <li>A inscrição em campeonatos externos com transporte da equipe requer termo de autorização assinado pelo responsável.</li>
              <li>Fotos e histórias esportivas de menores de 18 anos exigem consentimento de imagem específico.</li>
            </ul>
          </div>
        </div>

        {/* Card 4: Direitos do Titular */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 md:col-span-2">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <Trash2 className="w-4 h-4" />
            </div>
            4. Direitos do Titular e Revogação do Consentimento (Art. 18 LGPD)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            A qualquer momento, o atleta ou seu responsável legal tem o direito de solicitar à Comissão Técnica:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold block text-slate-900 mb-1">Confirmação e Acesso</span>
              Consultar integralmente quais dados e histórico estão armazenados no banco de dados.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold block text-slate-900 mb-1">Correção e Atualização</span>
              Retificar categorias, apelidos, grafias ou dados de contato incorretos.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold block text-slate-900 mb-1">Exclusão e Revogação</span>
              Exigir a eliminação permanente do perfil e histórico do banco de dados SQLite.
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Consent Registration Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">
              Registro Formal de Consentimento
            </h2>
            <p className="text-xs text-slate-500">
              Registre a aceitação formal dos termos esportivos com assinatura digital no banco de dados
            </p>
          </div>
        </div>

        {currentUser ? (
          <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Atleta / Usuário Conectado:</span>
              <span className="font-bold text-slate-900">{currentUser.name}</span> ({currentUser.role})
            </div>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-1 rounded-full">
              Autenticado
            </span>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
            Você está navegando como visitante. Você pode registrar o termo de aceite ou fazer login para vincular seu perfil oficial de atleta.
          </div>
        )}

        <form onSubmit={handleSubmitConsent} className="space-y-4">
          {/* Minor checkbox */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isMinor}
                onChange={(e) => setIsMinor(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded-sm focus:ring-orange-400"
              />
              <span className="text-xs font-bold text-slate-800">
                O atleta é menor de 18 anos (exige identificação do responsável legal)
              </span>
            </label>

            {isMinor && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nome Completo do Responsável Legal:
                  </label>
                  <input
                    type="text"
                    value={legalGuardianName}
                    onChange={(e) => setLegalGuardianName(e.target.value)}
                    placeholder="Ex: Maria de Fátima Gomes"
                    required={isMinor}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Grau de Parentesco / Vínculo:
                  </label>
                  <select
                    value={legalGuardianRelationship}
                    onChange={(e) => setLegalGuardianRelationship(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Mãe">Mãe</option>
                    <option value="Pai">Pai</option>
                    <option value="Tutor / Responsável Legal">Tutor / Responsável Legal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Telefone de Contato para Emergências:
                  </label>
                  <input
                    type="tel"
                    value={legalGuardianPhone}
                    onChange={(e) => setLegalGuardianPhone(e.target.value)}
                    placeholder="(19) 90000-0000"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    CPF do Responsável (Opcional - protegido por ofuscação):
                  </label>
                  <input
                    type="text"
                    value={legalGuardianCpf}
                    onChange={(e) => setLegalGuardianCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Agree checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer p-1">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded-sm focus:ring-orange-400 mt-0.5"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Declaro que li e concordo com os termos desta Política de Privacidade para fins estritamente esportivos e de gestão de treinos da equipe de Tênis de Mesa de Mogi Guaçu.
            </span>
          </label>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !agreedTerms}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Gravando Consentimento...' : 'Registrar Consentimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
