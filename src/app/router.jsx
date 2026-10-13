import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'
import { PERMISSIONS } from '../auth/permissions'
import ControlPortalLayout from '../components/layout/ControlPortalLayout'
import DashboardPage from '../pages/DashboardPage'
import AcceptEmployeeInvitationPage from '../pages/AcceptEmployeeInvitationPage'
import LoginPage from '../pages/LoginPage'
import ManagementPage from '../pages/ManagementPage'
import PropertiesPage from '../pages/PropertiesPage'
import PlateOperationsPage from '../pages/PlateOperationsPage'
import SettingsPage from '../pages/SettingsPage'

const portalPermissions = [
  PERMISSIONS.PLATE_OPERATIONS,
  PERMISSIONS.INSTALLATION_VERIFICATION,
  PERMISSIONS.PROPERTY_VERIFICATION,
  PERMISSIONS.CONTRACTOR_MANAGEMENT,
]

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/accept-employee-invitation',
    element: <AcceptEmployeeInvitationPage />,
  },
  {
    element: <ProtectedRoute requireAnyPermission={portalPermissions} />,
    children: [
      {
        path: '/',
        element: (
          <ControlPortalLayout>
            <DashboardPage />
          </ControlPortalLayout>
        ),
      },
      {
        path: '/properties',
        element: (
          <ProtectedRoute requireAnyPermission={portalPermissions}>
            <ControlPortalLayout>
              <PropertiesPage />
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
              <PlateOperationsPage />
            </ControlPortalLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: '/management',
        element: (
          <ProtectedRoute requireAdmin>
            <ControlPortalLayout>
              <ManagementPage />
            </ControlPortalLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute requireAdmin>
            <ControlPortalLayout>
              <SettingsPage />
            </ControlPortalLayout>
          </ProtectedRoute>
        ),
      },
    ],
  },
])
