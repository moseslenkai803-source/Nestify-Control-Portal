import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import { hasAnyPermission, hasPermission } from './permissions'
import AccessDeniedPage from '../pages/AccessDeniedPage'

function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requireAnyPermission,
  requireAdmin = false,
}) {
  const { isLoading, isAuthenticated, user } = useAuth()

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">
          Checking authentication...
        </p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  let isAuthorized = true

  if (requireAdmin) {
    isAuthorized = hasPermission(user, 'admin')
  } else if (requiredPermission) {
    isAuthorized = hasPermission(user, requiredPermission)
  } else if (requiredPermissions?.length) {
    isAuthorized = requiredPermissions.every((permission) =>
      hasPermission(user, permission),
    )
  } else if (requireAnyPermission?.length) {
    isAuthorized = hasAnyPermission(user, requireAnyPermission)
  }

  if (!isAuthorized) {
    return <AccessDeniedPage />
  }

  return children ?? <Outlet />
}

export default ProtectedRoute
