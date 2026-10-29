import { useState, useEffect } from 'react';
import {
  Trophy,
  RotateCcw,
  Clock,
  ArrowLeftRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Award,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';
import { AuthUser } from '../types';
import { apiService } from '../services/api';

interface MatchScoreboardProps {
  currentUser?: AuthUser | null;
  onNavigate?: (tabId: string) => void;
}

interface CompletedSet {
  setNumber: number;
  score1: number;
  score2: number;
  winner: 1 | 2;
}

export default function MatchScoreboard({ currentUser, onNavigate }: MatchScoreboardProps) {
  // Setup State
  const [player1Name, setPlayer1Name] = useState(currentUser?.nickname || currentUser?.name || 'Mogi Guaçu (A)');
  const [player2Name, setPlayer2Name] = useState('Adversário (B)');
  const [matchFormat, setMatchFormat] = useState<3 | 5 | 7>(5); // Best of 3, 5, or 7
  const [initialServer, setInitialServer] = useState<1 | 2>(1);
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Live Game State
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [setsWon1, setSetsWon1] = useState(0);
  const [setsWon2, setSetsWon2] = useState(0);
  const [historySets, setHistorySets] = useState<CompletedSet[]>([]);
  
  // Sides swapped visually?
  const [isSwapped, setIsSwapped] = useState(false);

  // Timeout States (1 timeout of 60s per match per player - ITTF Rule 3.4.4.2)
  const [timeoutUsed1, setTimeoutUsed1] = useState(false);
  const [timeoutUsed2, setTimeoutUsed2] = useState(false);
  const [activeTimeout, setActiveTimeout] = useState<{ player: 1 | 2; secondsRemaining: number } | null>(null);

  // Match Finished State
  const [matchWinner, setMatchWinner] = useState<1 | 2 | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSavingToDiary, setIsSavingToDiary] = useState(false);
  const [diarySaved, setDiarySaved] = useState(false);

  // Sets needed to win
  const setsToWin = Math.ceil(matchFormat / 2);
  const currentSetNumber = setsWon1 + setsWon2 + 1;
  const isDecidingSet = currentSetNumber === matchFormat;

  // Calculate current server based on ITTF Rules
  // Rule: Server switches every 2 points. If score reaches 10-10 (deuce), switches every 1 point.
  // Also, initial server alternates every set.
  const totalPointsInSet = score1 + score2;
  const currentSetInitialServer: 1 | 2 = ((currentSetNumber - 1) % 2 === 0) ? initialServer : (initialServer === 1 ? 2 : 1);
  
  const isDeuce = score1 >= 10 && score2 >= 10;
  let currentServer: 1 | 2 = currentSetInitialServer;
  if (!isDeuce) {
    const serviceTurn = Math.floor(totalPointsInSet / 2);
    currentServer = serviceTurn % 2 === 0 ? currentSetInitialServer : (currentSetInitialServer === 1 ? 2 : 1);
  } else {
    const pointsAfterDeuce = totalPointsInSet - 20;
    currentServer = pointsAfterDeuce % 2 === 0 ? currentSetInitialServer : (currentSetInitialServer === 1 ? 2 : 1);
  }

  // Towel break alert: every 6 points in a set (ITTF 3.4.4.1)
  const isTowelBreak = totalPointsInSet > 0 && totalPointsInSet % 6 === 0;

  // Deciding set side-swap alert: at 5 points
  const isDecidingSetSwap = isDecidingSet && (score1 === 5 || score2 === 5) && score1 <= 5 && score2 <= 5;

  // Beep sound generator using Web Audio API
  const playBeep = (freq = 600, duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {}
  };

  // Timeout Countdown Timer
  useEffect(() => {
    if (!activeTimeout) return;
    if (activeTimeout.secondsRemaining <= 0) {
      playBeep(880, 0.4);
      setActiveTimeout(null);
      return;
    }

    const timer = setInterval(() => {
      setActiveTimeout((prev) => {
        if (!prev) return null;
        if (prev.secondsRemaining <= 1) {
          playBeep(880, 0.4);
          return null;
        }
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTimeout]);

  // Scoring Handler
  const handleAddPoint = (player: 1 | 2) => {
    if (matchWinner) return;

    playBeep(player === 1 ? 520 : 650, 0.08);

    const newScore1 = player === 1 ? score1 + 1 : score1;
    const newScore2 = player === 2 ? score2 + 1 : score2;

    // Check if set is won (11 points and at least 2 points lead)
    const p1WinsSet = newScore1 >= 11 && newScore1 - newScore2 >= 2;
    const p2WinsSet = newScore2 >= 11 && newScore2 - newScore1 >= 2;

    if (p1WinsSet || p2WinsSet) {
      const winner = p1WinsSet ? 1 : 2;
      const newSets1 = winner === 1 ? setsWon1 + 1 : setsWon1;
      const newSets2 = winner === 2 ? setsWon2 + 1 : setsWon2;

      const newHistory: CompletedSet = {
        setNumber: currentSetNumber,
        score1: newScore1,
        score2: newScore2,
        winner
      };

      setHistorySets([...historySets, newHistory]);
      setScore1(0);
      setScore2(0);
      setSetsWon1(newSets1);
      setSetsWon2(newSets2);
      setIsSwapped(!isSwapped); // Automatic side swap between sets

      playBeep(780, 0.3);

      // Check if match is won
      if (newSets1 === setsToWin) {
        setMatchWinner(1);
      } else if (newSets2 === setsToWin) {
        setMatchWinner(2);
      }
    } else {
      setScore1(newScore1);
      setScore2(newScore2);
    }
  };

  // Undo / Decrement Point
  const handleUndoPoint = (player: 1 | 2) => {
    if (player === 1 && score1 > 0) setScore1(score1 - 1);
    if (player === 2 && score2 > 0) setScore2(score2 - 1);
  };

  // Start Timeout
  const handleCallTimeout = (player: 1 | 2) => {
    if (player === 1 && timeoutUsed1) return;
    if (player === 2 && timeoutUsed2) return;

    if (player === 1) setTimeoutUsed1(true);
    if (player === 2) setTimeoutUsed2(true);

    playBeep(440, 0.2);
    setActiveTimeout({ player, secondsRemaining: 60 });
  };

  // Reset Match
  const handleResetMatch = () => {
    setScore1(0);
    setScore2(0);
    setSetsWon1(0);
    setSetsWon2(0);
    setHistorySets([]);
    setMatchWinner(null);
    setTimeoutUsed1(false);
    setTimeoutUsed2(false);
    setActiveTimeout(null);
    setIsSwapped(false);
    setDiarySaved(false);
  };

  // Save Finished Match to Athlete's Match Diary (Ferramenta #3)
  const handleSaveToDiary = async () => {
    if (!matchWinner) return;
    setIsSavingToDiary(true);
    try {
      const isP1User = currentUser
        ? player1Name.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]) ||
          player1Name.toLowerCase().includes((currentUser.nickname || '').toLowerCase())
        : true;

      const opponent = isP1User ? player2Name : player1Name;
      const mySets = isP1User ? setsWon1 : setsWon2;
      const oppSets = isP1User ? setsWon2 : setsWon1;
      const isVict = mySets > oppSets;
      const setsStr = historySets.map((s) => `${s.score1}x${s.score2}`).join(', ');

      await apiService.matches.saveMatch({
        athleteName: currentUser?.name || player1Name,
        opponentName: opponent,
        opponentClub: 'Mogi Guaçu / Regional',
        opponentStyle: 'Ofensivo / Allround',
        matchFormat,
        setsWonPlayer: mySets,
        setsWonOpponent: oppSets,
        setsDetail: setsStr,
        isVictory: isVict,
        competitionOrEvent: 'Treino / Jogo Oficial',
        positiveTakeaways: isVict
          ? 'Boa consistência no forehand e velocidade na transição de pernas.'
          : 'Dificuldade na recepção de saques rápidos no cotovelo.',
        difficultiesFaced: isVict
          ? 'Alguns erros forçados nos primeiros pontos de cada set.'
          : 'Adversário colocou bolas anguladas exigindo recuperação de pernas.',
        coachFocusNext: 'Treinar devolução de saque curto e bloqueio firme com Prof. Max.'
      });

      setDiarySaved(true);
    } catch (err) {
      console.error('[Error saving match to diary]', err);
    } finally {
      setIsSavingToDiary(false);
    }
  };

  // Copy Match Súmula
  const handleCopySummary = () => {
    const winnerName = matchWinner === 1 ? player1Name : player2Name;
    const setsString = historySets.map((s) => `${s.score1}x${s.score2}`).join(', ');
    const text = `🏓 SÚMULA DE TÊNIS DE MESA - MOGI GUAÇU\n` +
      `Partida: ${player1Name} vs ${player2Name}\n` +
      `Formato: Melhor de ${matchFormat} sets\n` +
      `Placar Final: ${setsWon1} x ${setsWon2} (${winnerName} venceu)\n` +
      `Sets: [${setsString}]\n` +
      `Data: ${new Date().toLocaleDateString('pt-BR')}\n` +
      `Regulamento Oficial ITTF / CBTM`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // Visual order depending on isSwapped
  const leftPlayer = !isSwapped ? 1 : 2;
  const rightPlayer = !isSwapped ? 2 : 1;

  const leftName = leftPlayer === 1 ? player1Name : player2Name;
  const rightName = rightPlayer === 1 ? player1Name : player2Name;

  const leftScore = leftPlayer === 1 ? score1 : score2;
  const rightScore = rightPlayer === 1 ? score1 : score2;

  const leftSets = leftPlayer === 1 ? setsWon1 : setsWon2;
  const rightSets = rightPlayer === 1 ? setsWon1 : setsWon2;

  const leftIsServing = currentServer === leftPlayer;
  const rightIsServing = currentServer === rightPlayer;

  const leftTimeoutUsed = leftPlayer === 1 ? timeoutUsed1 : timeoutUsed2;
  const rightTimeoutUsed = rightPlayer === 1 ? timeoutUsed1 : timeoutUsed2;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-[#0c2340] via-[#102e52] to-[#163864] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5 text-orange-400" />
            Modo Mesa & Placar Digital ITTF 2026
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Placar de Partida Oficial • Mogi Guaçu
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Alternância de saque a cada 2 pontos (1 ponto em 10x10), aviso de toalha e tempo técnico oficial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title={soundEnabled ? 'Desativar sons' : 'Ativar avisos sonoros'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={() => setIsSwapped(!isSwapped)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Inverter lados da mesa manualmente"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span className="hidden sm:inline">Inverter Lado</span>
          </button>

          <button
            onClick={() => setIsConfiguring(!isConfiguring)}
            className="px-3.5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {isConfiguring ? 'Fechar Ajustes' : 'Configurar Atletas'}
          </button>

          <button
            onClick={handleResetMatch}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Reiniciar placar da partida"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Match Configuration Drawer / Modal */}
      {isConfiguring && (
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Configuração da Partida</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Atleta 1 (Nome / Equipe)</label>
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Atleta 2 (Nome / Clube)</label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Formato do Confronto</label>
              <select
                value={matchFormat}
                onChange={(e) => setMatchFormat(Number(e.target.value) as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900"
              >
                <option value={3}>Melhor de 3 Sets (Ganha 2)</option>
                <option value={5}>Melhor de 5 Sets (Padrão CBTM - Ganha 3)</option>
                <option value={7}>Melhor de 7 Sets (Finais ITTF - Ganha 4)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primeiro Sacador</label>
              <select
                value={initialServer}
                onChange={(e) => setInitialServer(Number(e.target.value) as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900"
              >
                <option value={1}>{player1Name} inicia sacando</option>
                <option value={2}>{player2Name} inicia sacando</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Official Alerts: Towel Break & Deciding Set Swap */}
      {isTowelBreak && !matchWinner && (
        <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Regra ITTF 3.4.4.1: Intervalo de Toalha autorizado (a cada 6 pontos somados: {score1 + score2} pontos).
          </span>
          <span className="text-[11px] text-amber-800">Breve pausa permitida</span>
        </div>
      )}

      {isDecidingSetSwap && !matchWinner && (
        <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-900 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
            Regra ITTF 2.14.03: Set Decisivo atingiu 5 pontos! Troquem de lado na mesa agora.
          </span>
          <button
            onClick={() => setIsSwapped(!isSwapped)}
            className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold"
          >
            Inverter Placar
          </button>
        </div>
      )}

      {/* Active 60-Second Timeout Banner */}
      {activeTimeout && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <Clock className="w-7 h-7" />
            <div>
              <p className="font-black text-sm uppercase tracking-wider">
                Tempo Técnico Oficial em Andamento ({activeTimeout.player === 1 ? player1Name : player2Name})
              </p>
              <p className="text-xs text-red-100">Regra 3.4.4.2 — 1 minuto de instruções táticas do treinador.</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl sm:text-4xl font-mono font-black">{activeTimeout.secondsRemaining}s</span>
            <div>
              <button
                onClick={() => setActiveTimeout(null)}
                className="mt-1 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold transition-colors"
              >
                Encerrar Tempo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MATCH WINNER BANNER */}
      {matchWinner && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-300" />
            Fim de Jogo • Vitória Confirmada
          </div>
          <h2 className="text-2xl sm:text-4xl font-black">
            {matchWinner === 1 ? player1Name : player2Name} é o Vencedor!
          </h2>
          <p className="text-sm text-emerald-100 font-medium">
            Placar final: <b>{setsWon1} x {setsWon2}</b> nos sets.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={handleSaveToDiary}
              disabled={isSavingToDiary || diarySaved}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                diarySaved
                  ? 'bg-amber-400 text-slate-900 shadow-md'
                  : 'bg-white text-emerald-950 hover:bg-emerald-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              {diarySaved ? '✓ Salvo no Diário de Partidas!' : isSavingToDiary ? 'Gravando Súmula...' : 'Salvar no Meu Diário de Partidas'}
            </button>

            <button
              onClick={handleCopySummary}
              className="px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copiedSummary ? 'Súmula Copiada!' : 'Copiar Súmula Oficial'}
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('estrategias')}
                className="px-4 py-2.5 rounded-xl bg-emerald-900/90 hover:bg-emerald-950 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Ver Diário & Análise</span>
                <span className="text-emerald-300">&rarr;</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN SCOREBOARD (DESKTOP & TABLET TWO-COLUMN / MOBILE STACKED) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* LEFT PLAYER CARD */}
        <div
          className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all select-none border ${
            leftPlayer === 1
              ? 'bg-[#0f2c4f] text-white border-blue-400/30 shadow-xl'
              : 'bg-[#123838] text-white border-emerald-400/30 shadow-xl'
          }`}
        >
          {/* Header of Player Card */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-2xl truncate">{leftName}</h3>
                {leftIsServing && (
                  <span
                    className="w-4 h-4 rounded-full bg-orange-500 shadow-md ring-2 ring-white/60 animate-bounce"
                    title="Sacando agora"
                  />
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {leftPlayer === 1 ? 'Lado 1' : 'Lado 2'} • Sets: <b className="text-orange-400 text-base">{leftSets}</b>
              </p>
            </div>

            {/* Timeout Button */}
            <button
              onClick={() => handleCallTimeout(leftPlayer)}
              disabled={leftTimeoutUsed || !!matchWinner}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                leftTimeoutUsed
                  ? 'bg-white/10 text-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/40'
              }`}
              title={leftTimeoutUsed ? 'Tempo técnico já utilizado nesta partida' : 'Pedir tempo técnico (60s)'}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{leftTimeoutUsed ? 'T.O. Usado' : 'Pedir Tempo'}</span>
            </button>
          </div>

          {/* GIANT SCORE BUTTON (+1 POINT ON TAP) */}
          <div
            onClick={() => handleAddPoint(leftPlayer)}
            className="my-6 py-10 sm:py-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98] group"
          >
            <span className="text-7xl sm:text-9xl font-black font-mono tracking-tight group-hover:scale-105 transition-transform">
              {leftScore}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white mt-2">
              Toque para marcar ponto (+1)
            </span>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <button
              onClick={() => handleUndoPoint(leftPlayer)}
              disabled={leftScore === 0 || !!matchWinner}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 font-semibold transition-colors cursor-pointer"
            >
              -1 Ponto (Desfazer)
            </button>

            <span className="font-semibold text-slate-300 text-xs">
              {leftIsServing ? '🎾 Com o Saque' : 'Aguardando Recepção'}
            </span>
          </div>
        </div>

        {/* RIGHT PLAYER CARD */}
        <div
          className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all select-none border ${
            rightPlayer === 1
              ? 'bg-[#0f2c4f] text-white border-blue-400/30 shadow-xl'
              : 'bg-[#123838] text-white border-emerald-400/30 shadow-xl'
          }`}
        >
          {/* Header of Player Card */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-2xl truncate">{rightName}</h3>
                {rightIsServing && (
                  <span
                    className="w-4 h-4 rounded-full bg-orange-500 shadow-md ring-2 ring-white/60 animate-bounce"
                    title="Sacando agora"
                  />
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {rightPlayer === 1 ? 'Lado 1' : 'Lado 2'} • Sets: <b className="text-orange-400 text-base">{rightSets}</b>
              </p>
            </div>

            {/* Timeout Button */}
            <button
              onClick={() => handleCallTimeout(rightPlayer)}
              disabled={rightTimeoutUsed || !!matchWinner}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                rightTimeoutUsed
                  ? 'bg-white/10 text-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white border border-red-500/40'
              }`}
              title={rightTimeoutUsed ? 'Tempo técnico já utilizado nesta partida' : 'Pedir tempo técnico (60s)'}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{rightTimeoutUsed ? 'T.O. Usado' : 'Pedir Tempo'}</span>
            </button>
          </div>

          {/* GIANT SCORE BUTTON (+1 POINT ON TAP) */}
          <div
            onClick={() => handleAddPoint(rightPlayer)}
            className="my-6 py-10 sm:py-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98] group"
          >
            <span className="text-7xl sm:text-9xl font-black font-mono tracking-tight group-hover:scale-105 transition-transform">
              {rightScore}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white mt-2">
              Toque para marcar ponto (+1)
            </span>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <button
              onClick={() => handleUndoPoint(rightPlayer)}
              disabled={rightScore === 0 || !!matchWinner}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 font-semibold transition-colors cursor-pointer"
            >
              -1 Ponto (Desfazer)
            </button>

            <span className="font-semibold text-slate-300 text-xs">
              {rightIsServing ? '🎾 Com o Saque' : 'Aguardando Recepção'}
            </span>
          </div>
        </div>
      </div>

      {/* SETS HISTORY TABLE */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-500" />
            Histórico dos Sets (Set Atual: #{currentSetNumber})
          </h3>
          <span className="text-xs text-slate-500">
            Formato: Melhor de {matchFormat} sets (ganha quem fizer {setsToWin})
          </span>
        </div>

        {historySets.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            Primeiro set em andamento. Os placares parciais serão registrados aqui ao término de cada set.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {historySets.map((s) => (
              <div
                key={s.setNumber}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2 font-mono"
              >
                <span className="font-bold text-slate-500">Set {s.setNumber}:</span>
                <span className={`font-black ${s.winner === 1 ? 'text-blue-700' : 'text-slate-700'}`}>{s.score1}</span>
                <span className="text-slate-400">x</span>
                <span className={`font-black ${s.winner === 2 ? 'text-emerald-700' : 'text-slate-700'}`}>{s.score2}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
