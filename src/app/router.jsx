/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'
import { PERMISSIONS } from '../auth/permissions'
import ControlPortalLayout from '../components/layout/ControlPortalLayout'

const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const AcceptEmployeeInvitationPage = lazy(
  () => import('../pages/AcceptEmployeeInvitationPage'),
)
const LoginPage = lazy(() => import('../pages/LoginPage'))
const ForgotPasswordPage = lazy(
  () => import('../pages/ForgotPasswordPage'),
)
const ResetPasswordPage = lazy(
  () => import('../pages/ResetPasswordPage'),
)
const ManagementPage = lazy(() => import('../pages/ManagementPage'))
const PropertiesPage = lazy(() => import('../pages/PropertiesPage'))
const PlateOperationsPage = lazy(
  () => import('../pages/PlateOperationsPage'),
)
const SettingsPage = lazy(() => import('../pages/SettingsPage'))

function PageLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-[#E2DED5] bg-white p-6"
    >
      <div className="flex items-center gap-3">
        <span className="h-4 w-4 animate-pulse rounded-full bg-[#C7F000]" />
        <p className="text-sm text-[#647084]">Loading page...</p>
      </div>
    </div>
  )
}

function LazyPage({ children }) {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      {children}
    </Suspense>
  )
}

const portalPermissions = [
  PERMISSIONS.PLATE_OPERATIONS,
  PERMISSIONS.INSTALLATION_VERIFICATION,
  PERMISSIONS.PROPERTY_VERIFICATION,
  PERMISSIONS.CONTRACTOR_MANAGEMENT,
]

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <LazyPage>
        <LoginPage />
      </LazyPage>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <LazyPage>
        <ForgotPasswordPage />
      </LazyPage>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <LazyPage>
        <ResetPasswordPage />
      </LazyPage>
    ),
  },
  {
    path: '/accept-employee-invitation',
    element: (
      <LazyPage>
        <AcceptEmployeeInvitationPage />
      </LazyPage>
    ),
  },
  {
    element: <ProtectedRoute requireAnyPermission={portalPermissions} />,
    children: [
      {
        path: '/',
        element: (
          <ControlPortalLayout>
            <LazyPage>
              <DashboardPage />
            </LazyPage>
          </ControlPortalLayout>
        ),
      },
      {
        path: '/properties',
        element: (
          <ProtectedRoute requireAnyPermission={portalPermissions}>
            <ControlPortalLayout>
              <LazyPage>
                <PropertiesPage />
              </LazyPage>
            </ControlPortalLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: '/plate-operations',
        element: (
          <ProtectedRoute
            requireAnyPermission={[
              PERMISSIONS.PLATE_OPERATIONS,
              PERMISSIONS.INSTALLATION_VERIFICATION,
            ]}
          >
            <ControlPortalLayout>
              <LazyPage>
                <PlateOperationsPage />
              </LazyPage>
            </ControlPortalLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: '/management',
        element: (
          <ProtectedRoute requireAdmin>
            <ControlPortalLayout>
              <LazyPage>
                <ManagementPage />
              </LazyPage>
            </ControlPortalLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute requireAdmin>
            <ControlPortalLayout>
              <LazyPage>
                <SettingsPage />
              </LazyPage>
            </ControlPortalLayout>
          </ProtectedRoute>
        ),
      },
    ],
  },
])
