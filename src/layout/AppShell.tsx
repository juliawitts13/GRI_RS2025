import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Users, CalendarRange, LogOut } from 'lucide-react'
import { Logo } from '@/components/domain/Logo'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/indicadores', label: 'Coleta de Indicadores', icon: ClipboardList },
  { to: '/respondentes', label: 'Respondentes', icon: Users },
  { to: '/cronograma', label: 'Cronograma', icon: CalendarRange },
]

export function AppShell() {
  const { session, signOut } = useAuth()

  return (
    <div className="flex min-h-screen bg-navy-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-navy-100 bg-white px-4 py-6 md:flex">
        <div className="px-2 pb-8">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive ? 'bg-navy-900 text-white' : 'text-navy-700 hover:bg-navy-50',
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-navy-100 pt-4">
          <p className="truncate px-2 text-xs text-navy-700/60">{session?.user.email}</p>
          <button
            onClick={signOut}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-50"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 md:hidden">
          <Logo compact />
          <button onClick={signOut} className="text-navy-700">
            <LogOut size={20} />
          </button>
        </header>
        <main className="flex-1 px-4 py-6 md:px-10 md:py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        <nav className="grid grid-cols-4 gap-1 border-t border-navy-100 bg-white px-2 py-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold',
                  isActive ? 'text-orange-500' : 'text-navy-700/70',
                )
              }
            >
              <item.icon size={18} />
              {item.label.split(' ')[0]}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
