import { NavLink } from 'react-router-dom'
import {
  Building2,
  Gauge,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  Warehouse,
  Wrench,
} from 'lucide-react'
import { useAuth } from '../../auth/useAuth'

const navItems = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/plate-operations', label: 'Plate Operations', icon: Warehouse },
  { to: '/management', label: 'Management', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const plateOperationLinks = [
  { to: '/plate-operations?tab=requests', label: 'Requests' },
  { to: '/plate-operations?tab=manufacturing', label: 'Manufacturing' },
  { to: '/plate-operations?tab=inventory', label: 'Inventory' },
  { to: '/plate-operations?tab=dispatch', label: 'Dispatch' },
  { to: '/plate-operations?tab=installation', label: 'Installation' },
  { to: '/plate-operations?tab=verification', label: 'Verification' },
]

function ControlPortalLayout({ children }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950/90 lg:block">
          <div className="flex h-full flex-col p-5">
            <div className="mb-8">
              <p className="text-lg font-semibold tracking-tight text-slate-50">Nestify</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Control Portal
              </p>
            </div>

            <nav className="space-y-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                      isActive
                        ? 'border-slate-700 bg-slate-900 text-slate-50'
                        : 'border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Plate Operations
              </p>
              <div className="mt-3 space-y-1.5">
                {plateOperationLinks.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `block rounded-lg px-2.5 py-2 text-sm transition ${
                        isActive
                          ? 'bg-slate-800 text-slate-50'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="mt-auto rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                  System healthy
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                <span>Operations</span>
                <span className="text-emerald-300">Online</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 lg:hidden">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-100">Operations overview</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Live portal status
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 md:flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  System online
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-100">
                    {user?.name?.charAt(0) || 'N'}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-medium text-slate-100">{user?.name || 'Operations User'}</p>
                    <p className="text-[10px] text-slate-500">{user?.role || 'Operations'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default ControlPortalLayout
