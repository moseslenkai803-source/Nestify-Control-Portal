
import { useState } from 'react'
import {
  Link,
  NavLink,
  useLocation,
  useSearchParams,
} from 'react-router-dom'
import {
  Building2,
  Gauge,
  LogOut,
  Menu,
  Settings,
  Users,
  Warehouse,
  X,
} from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { hasPermission, PERMISSIONS } from '../../auth/permissions'

const navItems = [
  { to: '/', label: 'Dashboard', icon: Gauge, access: 'portal' },
  {
    to: '/properties',
    label: 'Properties',
    icon: Building2,
    access: 'portal',
  },
  {
    to: '/management',
    label: 'Management',
    icon: Users,
    adminOnly: true,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
    adminOnly: true,
  },
]

const plateOperationLinks = [
  {
    id: 'requests',
    to: '/plate-operations?tab=requests',
    label: 'Requests',
    permission: PERMISSIONS.PLATE_OPERATIONS,
  },
  {
    id: 'manufacturing',
    to: '/plate-operations?tab=manufacturing',
    label: 'Manufacturing',
    permission: PERMISSIONS.PLATE_OPERATIONS,
  },
  {
    id: 'inventory',
    to: '/plate-operations?tab=inventory',
    label: 'Inventory',
    permission: PERMISSIONS.PLATE_OPERATIONS,
  },
  {
    id: 'dispatch',
    to: '/plate-operations?tab=dispatch',
    label: 'Dispatch',
    permission: PERMISSIONS.PLATE_OPERATIONS,
  },
  {
    id: 'installation',
    to: '/plate-operations?tab=installation',
    label: 'Installation',
    permission: PERMISSIONS.PLATE_OPERATIONS,
  },
  {
    id: 'verification',
    to: '/plate-operations?tab=verification',
    label: 'Verification',
    permission: PERMISSIONS.INSTALLATION_VERIFICATION,
  },
]

const pageTitles = {
  '/': 'Dashboard',
  '/properties': 'Properties',
  '/management': 'Management',
  '/settings': 'Settings',
  '/plate-operations': 'Plate Operations',
}

function PortalSidebar({
  visibleNavItems,
  visiblePlateOperationLinks,
  activeTab,
  onNavigate,
}) {
  return (
    <div className="flex h-full flex-col px-4 py-6">
      <Link
        to="/"
        onClick={onNavigate}
        className="mb-10 block px-3"
        aria-label="Nestify Control Portal home"
      >
        <span className="block text-xl font-bold tracking-tight text-white">
          Nestify
        </span>
        <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
          Control Portal
        </span>
      </Link>

      <nav aria-label="Main navigation" className="space-y-1">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>

        {visibleNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#C7F000] text-[#101B33]'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {visiblePlateOperationLinks.length > 0 && (
        <nav aria-label="Plate Operations navigation" className="mt-8">
          <div className="mb-3 flex items-center gap-2 px-3">
            <Warehouse size={15} className="text-slate-400" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Plate Operations
            </p>
          </div>

          <div className="space-y-1">
            {visiblePlateOperationLinks.map(({ id, to, label }) => {
              const isActive = activeTab === id

              return (
                <Link
                  key={id}
                  to={to}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className={`ml-3 flex items-center rounded-lg border-l-2 px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'border-[#C7F000] bg-[#C7F000]/10 font-semibold text-[#C7F000]'
                      : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </nav>
      )}

      <div className="mt-auto border-t border-white/10 px-3 pt-5">
        <p className="text-xs text-slate-400">
          Nestify
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Property operations
        </p>
      </div>
    </div>
  )
}

function ControlPortalLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const isAdmin = hasPermission(user, PERMISSIONS.ADMIN)

  const visibleNavItems = navItems.filter((item) => {
    if (item.access === 'portal') return true
    if (item.adminOnly) return isAdmin
    if (item.permission) return hasPermission(user, item.permission)

    return item.anyPermissions?.some((permission) =>
      hasPermission(user, permission),
    )
  })

  const visiblePlateOperationLinks = plateOperationLinks.filter(
    ({ permission }) => hasPermission(user, permission),
  )

  const requestedTab = searchParams.get('tab')
  const activeTab = visiblePlateOperationLinks.some(
    ({ id }) => id === requestedTab,
  )
    ? requestedTab
    : visiblePlateOperationLinks[0]?.id || 'requests'

  const activeTabLabel =
    visiblePlateOperationLinks.find(({ id }) => id === activeTab)?.label

  const pageTitle = pageTitles[location.pathname] || 'Control Portal'
  const pageSubtitle =
    location.pathname === '/plate-operations'
      ? activeTabLabel || 'Plate Operations'
      : 'Control Portal'

  const displayName = user?.name || user?.email || 'Operations User'
  const initials = displayName.charAt(0).toUpperCase()

  const handleNavigation = () => {
    setIsMobileNavOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#202124]">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="hidden w-64 shrink-0 bg-[#101B33] lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <PortalSidebar
              visibleNavItems={visibleNavItems}
              visiblePlateOperationLinks={visiblePlateOperationLinks}
              activeTab={activeTab}
            />
          </div>
        </aside>

        {isMobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute inset-0 bg-slate-950/60"
            />

            <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[#101B33] shadow-2xl">
              <div className="flex h-full flex-col overflow-y-auto">
                <div className="flex items-center justify-end px-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(false)}
                    aria-label="Close menu"
                    className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <PortalSidebar
                  visibleNavItems={visibleNavItems}
                  visiblePlateOperationLinks={visiblePlateOperationLinks}
                  activeTab={activeTab}
                  onNavigate={handleNavigation}
                />
              </div>
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
            <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(true)}
                  aria-label="Open navigation"
                  aria-expanded={isMobileNavOpen}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
                >
                  <Menu size={19} />
                </button>

                <div className="min-w-0">
                  <h1 className="truncate text-sm font-semibold text-[#202124] sm:text-base">
                    {pageTitle}
                  </h1>
                  <p className="truncate text-xs text-[#647084]">
                    {pageSubtitle}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden min-w-0 text-right sm:block">
                  <p className="max-w-48 truncate text-xs font-semibold text-[#202124]">
                    {displayName}
                  </p>
                  {user?.role && (
                    <p className="mt-0.5 text-[11px] text-[#647084]">
                      {user.role}
                    </p>
                  )}
                </div>

                <div
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#101B33] text-sm font-semibold text-white"
                >
                  {initials}
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default ControlPortalLayout
