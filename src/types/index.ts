export type UserRole = 'visitante' | 'atleta' | 'treinador' | 'editor' | 'moderador' | 'administrador';

export interface User {
  id: string;
  name: string;
  nickname?: string;
  role: UserRole;
  avatar?: string;
  isDemo?: boolean;
}

export type SkillLevel = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Todos os Níveis';

export interface LibraryArticle {
  id: string;
  title: string;
  summary: string;
  category: 'Regras' | 'Técnica' | 'Empunhaduras' | 'Efeitos' | 'História' | 'Glossário';
  level: SkillLevel;
  readTime: string;
  author: string;
  reviewedAt: string;
  sources: string[];
  content: string[];
  keyTakeaways: string[];
  isDemo?: boolean;
}

export interface ExerciseDrill {
  id: string;
  title: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  category: 'Regularidade' | 'Técnica' | 'Deslocamento' | 'Saque e Recepção' | 'Multibolas' | 'Tática';
  durationMinutes: 15 | 30 | 45 | 60;
  objective: string;
  materials: string[];
  organization: string;
  instructions: string[];
  seriesAndReps: string;
  commonErrors: string[];
  progressions: string[];
  matchApplication: string;
  progressPercent?: number;
  diagramType?: 'crosscourt' | 'falkenberg' | 'third_ball' | 'multiball' | 'banana_flick' | 'short_touch';
  videoUrl?: string;
  youtubeVideoId?: string;
  videoTitle?: string;
  videoDuration?: string;
  isDemo?: boolean;
}

export interface PsychologyGuide {
  id: string;
  title: string;
  pillar: 'Foco' | 'Rotina' | 'Controle Emocional' | 'Confiança' | 'Gestão de Pressão';
  summary: string;
  practicalTips: string[];
  reflectionQuestions: string[];
  disclaimer: string;
  isDemo?: boolean;
}

export interface TacticalStyle {
  id: string;
  styleName: string;
  shortDescription: string;
  strengths: string[];
  weaknesses: string[];
  recommendedTactics: string[];
  servesToUse: string[];
  whatToAvoid: string[];
  proExample: string;
  isDemo?: boolean;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: 'Madeira' | 'Borracha Lisa' | 'Pino Curto' | 'Pino Longo' | 'Anti-Spin' | 'Bolas e Acessórios';
  idealFor: string;
  characteristics: {
    speed: number; // 1-10
    spin: number;  // 1-10
    control: number; // 1-10
  };
  description: string;
  maintenanceTip: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface SportEvent {
  id: string;
  title: string;
  type: 'Treinamento' | 'Campeonato Regional' | 'Circuito Estadual' | 'Torneio Local';
  date: string;
  dateISO?: string;
  time?: string;
  location: string;
  city: string;
  organizer: string;
  status: 'Confirmado' | 'Inscrições Abertas' | 'Provisório' | 'Encerrado';
  categories: string[];
  officialLink?: string;
  registrationDeadlineISO?: string;
  lastVerifiedAt: string;
  isDemo?: boolean;
}

export interface NoticeItem {
  id: string;
  title: string;
  body: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  expiresAt: string;
  publishedAtISO?: string;
  expiresAtISO?: string;
  category: 'Horários' | 'Torneio' | 'Manutenção' | 'Geral';
  isUrgent?: boolean;
  status: 'Ativo' | 'Arquivado';
  isDemo?: boolean;
}

export interface AthleteProfile {
  id: string;
  displayName: string;
  approvedNickname?: string;
  category: string;
  level: SkillLevel;
  yearsPlaying: string;
  favoriteShot: string;
  gripType: 'Clássica (Shakehand)' | 'Caneta Japonesa (Penhold)' | 'Classineta (CPen)';
  achievements: string[];
  birthMonth: string;
  birthDay: number;
  avatarUrl: string;
  consentGranted: boolean;
  isCurrentUser?: boolean;
  isDemo?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  authorName: string;
  authorNickname?: string;
  date: string;
  summary: string;
  content: string;
  coverImage?: string;
  medals?: string;
  status: 'Publicado' | 'Em Revisão' | 'Rascunho';
  reviewedBy?: string;
  hasPhotoConsent: boolean;
  isDemo?: boolean;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  timestamp: string;
  text: string;
  isOfficialAnnouncement?: boolean;
  isDemo?: boolean;
}

export interface InterestLink {
  id: string;
  title: string;
  organization: string;
  category: 'Oficial' | 'Regras & Arbitragem' | 'Educação & Cursos' | 'Vídeos & Partidas' | 'Saúde & Performance' | 'Clubes & Inspiração';
  language: 'Português' | 'Inglês' | 'Bilingue' | 'Alemão / Inglês';
  description: string;
  url: string;
  verifiedAt: string;
  isDemo?: boolean;
}

export interface EventAttendance {
  id: string;
  eventId: string;
  athleteName: string;
  athleteNickname?: string;
  category: string;
  transportNeed: 'Van da Equipe' | 'Transporte Próprio' | 'A Definir';
  confirmedAt: string;
  status: 'Confirmado pelo Prof. Max' | 'Pendente';
  isCurrentUser?: boolean;
}

export interface RefereeRuleFAQ {
  id: string;
  question: string;
  verdict: 'Válido' | 'Inválido / Falta' | 'Let (Repete o Ponto)';
  shortAnswer: string;
  officialRuleCode: string;
  detailedExplanation: string;
  situationCategory: 'Saque' | 'Toques na Mesa' | 'Bolinha e Raquete' | 'Pontuação e Finais';
  reviewedAt?: string;
  primarySources?: string[];
}

export interface CompletedDrillSession {
  id: string;
  drillId: string;
  drillTitle: string;
  athleteName: string;
  completedAtISO: string;
  durationSeconds: number;
  setsCompleted: number;
  restDurationSeconds?: number;
  notes?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  nickname?: string;
  role: UserRole;
  avatar?: string;
  email: string;
  token?: string;
}

export interface UserReport {
  id: string;
  reporterUserId?: string;
  reporterName: string;
  reporterRole: UserRole;
  reportedChannel: string;
  reportedMessageId?: string;
  reportedMessageText?: string;
  reportedMessageAuthor?: string;
  reason: string;
  createdAtISO: string;
  status: 'Pendente' | 'Analisado' | 'Arquivado' | 'Mensagem Removida';
  decisionNote?: string;
  resolvedBy?: string;
  resolvedAtISO?: string;
}

export interface PsychologyJournalEntry {
  id: string;
  date: string;
  matchOrTraining: string;
  feeling: string;
  whatWentWell: string;
  whatToImprove: string;
  focusForNextTime: string;
  createdAtISO?: string;
}

export interface TacticalScoutingSheet {
  id: string;
  opponentName: string;
  opponentGrip: string;
  opponentRubber: string;
  favoriteServe: string;
  weakness: string;
  myGameplan: string;
  notes?: string;
  createdAtISO?: string;
}

export interface AthleteSkillRadar {
  forehandConsistency: number; // 0-100
  backhandControl: number;
  serveVariation: number;
  footworkAgility: number;
  emotionalFocus: number;
  tacticalReading: number;
}

export interface TrainingRoutinePhase {
  phaseName: string;
  durationMinutes: number;
  exerciseTitle: string;
  description: string;
  keyInstructions: string[];
}

export interface OfficialRuleSection {
  code: string;
  title: string;
  englishTitle: string;
  subsections: {
    code: string;
    text: string;
  }[];
  officialReference: string;
}

export interface AthleteEquipmentSetup {
  id?: string;
  userId?: string;
  athleteName?: string;
  bladeName: string;
  bladeType: string;
  bladeWeightGrams: number;
  gripType: 'Clássica (Shakehand)' | 'Caneta Japonesa (Penhold)' | 'Classineta (CPen)';
  fhRubberName: string;
  fhRubberType: string;
  fhSpongeThickness: string;
  fhAssemblyDate: string;
  bhRubberName: string;
  bhRubberType: string;
  bhSpongeThickness: string;
  bhAssemblyDate: string;
  glueType?: string;
  totalWeightGrams: number;
  notes?: string;
  updatedAtISO?: string;
}

export interface MatchDiaryEntry {
  id: string;
  userId?: string;
  athleteName: string;
  opponentName: string;
  opponentClub?: string;
  opponentStyle?: string;
  matchFormat: number; // e.g. 5
  setsWonPlayer: number;
  setsWonOpponent: number;
  setsDetail: string; // e.g. "11x9, 8x11, 11x7, 12x10"
  isVictory: boolean;
  competitionOrEvent?: string;
  positiveTakeaways?: string;
  difficultiesFaced?: string;
  coachFocusNext?: string;
  createdAtISO: string;
}



