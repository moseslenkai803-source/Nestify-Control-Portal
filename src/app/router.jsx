import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'
import ControlPortalLayout from '../components/layout/ControlPortalLayout'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import PropertiesPage from '../pages/PropertiesPage'
import PlateOperationsPage from '../pages/PlateOperationsPage'
import SettingsPage from '../pages/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
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
          <ControlPortalLayout>
            <PropertiesPage />
          </ControlPortalLayout>
        ),
      },
      {
        path: '/plate-operations',
        element: (
          <ControlPortalLayout>
            <PlateOperationsPage />
          </ControlPortalLayout>
        ),
      },
      {
        path: '/settings',
        element: (
          <ControlPortalLayout>
            <SettingsPage />
          </ControlPortalLayout>
        ),
      },
    ],
  },
])
