export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden>
        <defs>
          <linearGradient id="leafGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2E8FD6" />
            <stop offset="1" stopColor="#ED7D3C" />
          </linearGradient>
        </defs>
        <path
          d="M16 3C9 5 5 11 6 19c5 2 12 1 15-5 2-4 1-9-5-11Z"
          fill="url(#leafGrad)"
        />
        <path d="M8 22c4-6 10-10 17-11" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
      </svg>
      {!compact && (
        <div className="leading-none">
          <p className="text-sm font-extrabold tracking-tight text-navy-950">GrupoSC</p>
          <p className="text-xs font-bold text-orange-500">Sustentável</p>
        </div>
      )}
    </div>
  )
}
