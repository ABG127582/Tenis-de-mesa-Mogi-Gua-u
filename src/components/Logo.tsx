export default function Logo({ size = 'md', isLight = false }: { size?: 'sm' | 'md' | 'lg'; isLight?: boolean }) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div className="flex items-center gap-3">
      {/* Table Tennis Paddle Icon */}
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-2xl ${
          isSmall ? 'w-8 h-8' : isLarge ? 'w-14 h-14' : 'w-11 h-11'
        } ${isLight ? 'bg-white/10 text-white' : 'bg-navy-900 text-orange-500 shadow-sm'}`}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isSmall ? 'w-6 h-6' : isLarge ? 'w-10 h-10' : 'w-8 h-8'}
        >
          {/* Wooden handle */}
          <rect
            x="38"
            y="38"
            width="10"
            height="22"
            rx="3"
            transform="rotate(-45 38 38)"
            fill="#d97706"
            stroke="#92400e"
            strokeWidth="2"
          />
          {/* Paddle rubber oval */}
          <ellipse
            cx="26"
            cy="26"
            rx="20"
            ry="22"
            transform="rotate(-25 26 26)"
            fill="#ea580c"
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          {/* Inner highlight */}
          <ellipse
            cx="24"
            cy="24"
            rx="14"
            ry="16"
            transform="rotate(-25 24 24)"
            fill="#f97316"
          />
          {/* Table tennis ball */}
          <circle
            cx="48"
            cy="18"
            r="7"
            fill="#ffffff"
            stroke="#fdba74"
            strokeWidth="1.5"
          />
          <path
            d="M 45 15 A 3 3 0 0 1 49 17"
            stroke="#f97316"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1 font-black tracking-tight">
          <span className={isLight ? 'text-white' : 'text-slate-900'}>
            MESA
          </span>
          <span className="text-orange-500">
            ATIVA
          </span>
        </div>
        <span
          className={`text-[10px] uppercase font-bold tracking-wider ${
            isLight ? 'text-slate-300' : 'text-slate-500'
          }`}
        >
          Tênis de Mesa Mogi Guaçu
        </span>
      </div>
    </div>
  );
}
