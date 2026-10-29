import React from 'react';

export type DrillDiagramType =
  | 'crosscourt'
  | 'falkenberg'
  | 'third_ball'
  | 'multiball'
  | 'banana_flick'
  | 'short_touch';

interface DrillTableDiagramProps {
  type: DrillDiagramType;
  title?: string;
}

export default function DrillTableDiagram({ type, title }: DrillTableDiagramProps) {
  // Pre-configured diagram metadata and tactical step coordinates
  const configs: Record<
    DrillDiagramType,
    {
      title: string;
      description: string;
      steps: { num: number; text: string; color: string }[];
      renderSvgOverlay: () => React.ReactNode;
    }
  > = {
    crosscourt: {
      title: 'Troca Cruzada Regular (Forehand / Backhand)',
      description: 'Trajetória diagonal constante buscando profundidade no terço final da mesa.',
      steps: [
        { num: 1, text: 'Bola cruzada profunda de Forehand', color: '#f97316' },
        { num: 2, text: 'Retorno cruzado no mesmo ângulo', color: '#38bdf8' },
        { num: 3, text: 'Variação opcional paralela para quebra de ritmo', color: '#a855f7' }
      ],
      renderSvgOverlay: () => (
        <g>
          {/* Path 1: Player A right to Player B right (crosscourt) */}
          <path
            d="M 230 240 Q 180 150 130 60"
            fill="none"
            stroke="#f97316"
            strokeWidth="3.5"
            strokeDasharray="4 2"
          />
          {/* Arrowhead */}
          <polygon points="126,55 137,60 131,68" fill="#f97316" />

          {/* Path 2: Return crosscourt */}
          <path
            d="M 140 60 Q 190 150 240 240"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="5 3"
          />
          <polygon points="243,246 233,241 239,233" fill="#38bdf8" />

          {/* Bounce markers */}
          <circle cx="150" cy="85" r="8" fill="#f97316" stroke="#ffffff" strokeWidth="2" />
          <text x="150" y="89" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">1</text>

          <circle cx="215" cy="215" r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
          <text x="215" y="219" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">2</text>
        </g>
      )
    },
    falkenberg: {
      title: 'Falkenberg Drill Clássico (3 Bolas com Pivot)',
      description: 'O drill olímpico: 1 Backhand no canto, 2 Pivot de Forehand no mesmo canto, 3 Deslocamento rápido para o Forehand aberto.',
      steps: [
        { num: 1, text: 'Backhand do canto esquerdo', color: '#3b82f6' },
        { num: 2, text: 'Passo de Pivot + Topspin de Forehand no mesmo canto', color: '#ea580c' },
        { num: 3, text: 'Deslocamento lateral + Topspin de Forehand cruzado', color: '#10b981' }
      ],
      renderSvgOverlay: () => (
        <g>
          {/* Ball 1: BH from Left */}
          <path d="M 85 240 L 85 60" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="3 2" />
          <polygon points="85,55 80,65 90,65" fill="#3b82f6" />
          <circle cx="85" cy="80" r="7" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
          <text x="85" y="84" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>

          {/* Pivot Footwork Arc */}
          <path
            d="M 85 255 C 65 260 55 245 70 235"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="2 2"
          />
          <text x="50" y="252" fill="#fbbf24" fontSize="8" fontWeight="bold">PIVOT</text>

          {/* Ball 2: FH from Pivot corner */}
          <path d="M 75 235 L 210 65" fill="none" stroke="#ea580c" strokeWidth="3" />
          <polygon points="214,61 204,63 210,72" fill="#ea580c" />
          <circle cx="190" cy="85" r="7" fill="#ea580c" stroke="#fff" strokeWidth="1.5" />
          <text x="190" y="89" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>

          {/* SPRINT FOOTWORK ARROW from left to right */}
          <path
            d="M 80 265 Q 150 280 230 255"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            markerEnd="url(#arrow-green)"
          />
          <polygon points="234,253 223,252 227,261" fill="#10b981" />
          <text x="150" y="280" fill="#34d399" fontSize="8" fontWeight="bold" textAnchor="middle">
            DESLOCAMENTO RÁPIDO &rarr;
          </text>

          {/* Ball 3: FH from wide corner */}
          <path d="M 235 245 L 90 70" fill="none" stroke="#10b981" strokeWidth="3.5" />
          <polygon points="86,66 96,69 90,77" fill="#10b981" />
          <circle cx="110" cy="90" r="7" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
          <text x="110" y="94" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
        </g>
      )
    },
    third_ball: {
      title: 'Saque Curto + Ataque de Terceira Bola',
      description: 'Saque curto com efeito cortado no meio; devolução longa e ataque decisivo de Forehand.',
      steps: [
        { num: 1, text: 'Saque curto cortado com duas quicadas perto da rede', color: '#f59e0b' },
        { num: 2, text: 'Devolução passiva empurrada longa pelo adversário', color: '#64748b' },
        { num: 3, text: 'Topspin agressivo de 3ª bola no canto vago', color: '#ef4444' }
      ],
      renderSvgOverlay: () => (
        <g>
          {/* Saque Curto: Player A to Net Area */}
          <path
            d="M 180 240 Q 165 180 150 120"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="4 2"
          />
          <circle cx="150" cy="120" r="7" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
          <text x="150" y="124" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>
          <text x="150" y="108" fill="#fbbf24" fontSize="8" fontWeight="bold" textAnchor="middle">Curto</text>

          {/* Devolução longa para o Forehand */}
          <path
            d="M 150 115 Q 180 160 215 220"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeDasharray="3 3"
          />
          <circle cx="215" cy="220" r="7" fill="#64748b" stroke="#fff" strokeWidth="1.5" />
          <text x="215" y="224" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>

          {/* Ataque Decisivo 3ª bola */}
          <path
            d="M 220 230 L 75 60"
            fill="none"
            stroke="#ef4444"
            strokeWidth="4"
          />
          <polygon points="71,56 81,60 76,68" fill="#ef4444" />
          <circle cx="95" cy="80" r="8" fill="#ef4444" stroke="#fff" strokeWidth="2" />
          <text x="95" y="84" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">3</text>
          <text x="60" y="95" fill="#f87171" fontSize="9" fontWeight="bold">PONTO!</text>
        </g>
      )
    },
    multiball: {
      title: 'Multibolas: Explosão de Transição',
      description: 'Treinador lança do cesto em alta cadência variando canto direito, meio e canto esquerdo.',
      steps: [
        { num: 1, text: 'Lançamento rápido no canto do Backhand', color: '#06b6d4' },
        { num: 2, text: 'Lançamento no meio (cotovelo / transição)', color: '#3b82f6' },
        { num: 3, text: 'Lançamento aberto no canto do Forehand', color: '#ec4899' }
      ],
      renderSvgOverlay: () => (
        <g>
          {/* Cesto do Treinador */}
          <rect x="135" y="20" width="30" height="20" rx="4" fill="#f97316" stroke="#fff" strokeWidth="1.5" />
          <text x="150" y="34" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">CESTO</text>

          {/* 3 Trajetórias de Multibolas */}
          <path d="M 140 40 L 75 230" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="4 2" />
          <polygon points="73,234 74,223 83,227" fill="#06b6d4" />

          <path d="M 150 40 L 150 230" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4 2" />
          <polygon points="150,235 145,225 155,225" fill="#3b82f6" />

          <path d="M 160 40 L 225 230" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeDasharray="4 2" />
          <polygon points="227,234 217,227 226,223" fill="#ec4899" />

          {/* Badges */}
          <circle cx="85" cy="200" r="7" fill="#06b6d4" stroke="#fff" strokeWidth="1.5" />
          <text x="85" y="204" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>

          <circle cx="150" cy="200" r="7" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
          <text x="150" y="204" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>

          <circle cx="215" cy="200" r="7" fill="#ec4899" stroke="#fff" strokeWidth="1.5" />
          <text x="215" y="204" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
        </g>
      )
    },
    banana_flick: {
      title: 'Banana Flick (Chiquita) sobre a Mesa',
      description: 'Recepção agressiva de backhand entrando com o pé direito e chicoteando a bola no topo do quique.',
      steps: [
        { num: 1, text: 'Saque adversário curto no meio ou backhand', color: '#f59e0b' },
        { num: 2, text: 'Avanço do pé direito para baixo da mesa', color: '#10b981' },
        { num: 3, text: 'Aceleração de punho com sidespin lateral agressivo', color: '#a855f7' }
      ],
      renderSvgOverlay: () => (
        <g>
          {/* Saque curto */}
          <path d="M 160 60 Q 150 110 135 130" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 2" />
          <circle cx="135" cy="130" r="7" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
          <text x="135" y="134" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>

          {/* Foot step entering under table */}
          <ellipse cx="140" cy="175" rx="10" ry="6" fill="#10b981" opacity="0.8" />
          <text x="140" y="178" fill="#fff" fontSize="7" fontWeight="bold" textAnchor="middle">PÉ DIR.</text>

          {/* Banana curve flick */}
          <path
            d="M 135 135 Q 110 110 90 60"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3.5"
          />
          <polygon points="88,55 96,62 88,67" fill="#a855f7" />
          <circle cx="105" cy="90" r="8" fill="#a855f7" stroke="#fff" strokeWidth="1.5" />
          <text x="105" y="94" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
          <text x="70" y="80" fill="#c084fc" fontSize="8" fontWeight="bold">Efeito Banana</text>
        </g>
      )
    },
    short_touch: {
      title: 'Cozinhada Curta & Drop Shot Perto da Rede',
      description: 'Amortecimento com sensibilidade para a bola dar duas quicadas no campo adversário impedindo o ataque.',
      steps: [
        { num: 1, text: 'Toque suave na subida da bola', color: '#38bdf8' },
        { num: 2, text: 'Bola quica rente à rede com rotação cortada', color: '#10b981' },
        { num: 3, text: 'Recuperação imediata da base para o próximo golpe', color: '#f59e0b' }
      ],
      renderSvgOverlay: () => (
        <g>
          <path d="M 130 160 Q 140 145 150 135" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 2" />
          <circle cx="150" cy="135" r="7" fill="#38bdf8" stroke="#fff" strokeWidth="1.5" />
          <text x="150" y="139" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>

          <path d="M 150 135 Q 155 125 155 110" fill="none" stroke="#10b981" strokeWidth="2.5" />
          <circle cx="155" cy="110" r="6" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
          <text x="155" y="113" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">2</text>
          <text x="180" y="115" fill="#34d399" fontSize="8" fontWeight="bold">2 Quiques</text>
        </g>
      )
    }
  };

  const currentConfig = configs[type] || configs.crosscourt;

  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 text-white shadow-inner">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
            Diagrama Tático de Mesa
          </span>
          <h4 className="font-extrabold text-sm sm:text-base text-white mt-1">
            {title || currentConfig.title}
          </h4>
        </div>
      </div>

      {/* SVG Canvas depicting table tennis table */}
      <div className="relative bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 300 300"
          className="w-full max-w-[280px] sm:max-w-[320px] h-auto select-none"
        >
          {/* Table Outline (ITTF Standard Blue Top) */}
          <rect
            x="40"
            y="40"
            width="220"
            height="220"
            rx="4"
            fill="#1e3a8a"
            stroke="#ffffff"
            strokeWidth="3"
          />

          {/* White Center Line (Serving Line) */}
          <line
            x1="150"
            y1="40"
            x2="150"
            y2="260"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />

          {/* Middle Table Net */}
          <line
            x1="30"
            y1="150"
            x2="270"
            y2="150"
            stroke="#cbd5e1"
            strokeWidth="4"
          />
          {/* Net posts */}
          <circle cx="30" cy="150" r="3.5" fill="#94a3b8" />
          <circle cx="270" cy="150" r="3.5" fill="#94a3b8" />
          <text x="278" y="153" fill="#94a3b8" fontSize="7" fontWeight="bold">REDE</text>

          {/* Sector Labels */}
          <text x="95" y="55" fill="#93c5fd" opacity="0.4" fontSize="8" textAnchor="middle">CAMPO ADVERSÁRIO</text>
          <text x="95" y="250" fill="#93c5fd" opacity="0.4" fontSize="8" textAnchor="middle">SEU CAMPO (ATLETA)</text>

          {/* Left/Right labels for player */}
          <text x="50" y="250" fill="#cbd5e1" opacity="0.5" fontSize="7">ESQ (BH)</text>
          <text x="250" y="250" fill="#cbd5e1" opacity="0.5" fontSize="7" textAnchor="end">DIR (FH)</text>

          {/* Overlay Specific to Drill Type */}
          {currentConfig.renderSvgOverlay()}

          {/* Player Position Indicator A */}
          <g transform="translate(150, 275)">
            <circle cx="0" cy="0" r="9" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">A</text>
            <text x="0" y="18" fill="#fdba74" fontSize="8" fontWeight="bold" textAnchor="middle">Você</text>
          </g>

          {/* Player Position Indicator B (Partner / Coach) */}
          <g transform="translate(150, 25)">
            <circle cx="0" cy="0" r="8" fill="#475569" stroke="#ffffff" strokeWidth="1.5" />
            <text x="0" y="3" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">B</text>
            <text x="0" y="-10" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Parceiro / Treinador</text>
          </g>
        </svg>
      </div>

      {/* Trajectory Steps Legend */}
      <div className="mt-3.5 space-y-1.5">
        <p className="text-[11px] text-slate-300 font-semibold mb-1">
          {currentConfig.description}
        </p>
        <div className="grid grid-cols-1 gap-1.5 pt-1">
          {currentConfig.steps.map((st) => (
            <div
              key={st.num}
              className="flex items-center gap-2 text-xs bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/50"
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 text-white"
                style={{ backgroundColor: st.color }}
              >
                {st.num}
              </span>
              <span className="text-slate-200 text-[11px]">{st.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
