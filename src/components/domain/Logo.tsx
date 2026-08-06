export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="36" height="28" viewBox="0 0 44 34" fill="none" aria-hidden>
        <defs>
          <linearGradient id="leafBlue" x1="4" y1="18" x2="20" y2="2" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0B4E86" />
            <stop offset="1" stopColor="#2E8FD6" />
          </linearGradient>
          <linearGradient id="leafOrange" x1="21" y1="14" x2="37" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#B23A22" />
            <stop offset="1" stopColor="#ED7D3C" />
          </linearGradient>
          <linearGradient id="leafGreen" x1="27" y1="18" x2="35" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0B5C33" />
            <stop offset="1" stopColor="#3FAE64" />
          </linearGradient>
        </defs>

        <path d="M6 30C12 20 20 17 27 18" stroke="#0B5C33" strokeWidth="2" strokeLinecap="round" fill="none" />

        <path d="M14 2C8 4 3 10 4 18c5 1.5 11 0.5 14-4 2-3.5 1-9-4-12Z" fill="url(#leafBlue)" />
        <path d="M6 15c3-5 7-9 11-10" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.5" />

        <path d="M27 4c-4 1-7 5-6 10 4 1 8 0 10-3 1.5-2.5 0.5-6-4-7Z" fill="url(#leafOrange)" />
        <path d="M23 12c2-4 5-6 8-7" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />

        <path d="M27 18c-2 4-1 9 3 12 4-2 6-6 5-11-1-4-5-3-8-1Z" fill="url(#leafGreen)" />
        <path d="M29 20c0 4 1 7 3 9" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
      </svg>
      {!compact && (
        <div className="leading-none">
          <p className="text-sm font-extrabold tracking-tight text-navy-950">GrupoSC</p>
          <p className="text-xs font-bold text-pillar-social">Sustentável</p>
        </div>
      )}
    </div>
  )
}
