import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { hasAnyPermission, PERMISSIONS } from '../auth/permissions'

const portalPermissions = [
  PERMISSIONS.PLATE_OPERATIONS,
  PERMISSIONS.INSTALLATION_VERIFICATION,
  PERMISSIONS.PROPERTY_VERIFICATION,
  PERMISSIONS.CONTRACTOR_MANAGEMENT,
]

function AccessDeniedPage() {
  const { user, logout } = useAuth()
  const canAccessPortal = hasAnyPermission(user, portalPermissions)

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-900/60 bg-amber-950/40 text-amber-300">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold">Access denied</h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Your account does not have permission to access this page.
          Contact a Nestify administrator if you believe you need access.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {canAccessPortal && (
            <Link
              to="/"
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-700"
            >
              Return to dashboard
            </Link>
          )}

          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </section>
    </main>
  )
}

export default AccessDeniedPage
