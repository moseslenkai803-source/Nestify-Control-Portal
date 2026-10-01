import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'
import ControlPortalLayout from '../components/layout/ControlPortalLayout'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import PropertiesPage from '../pages/PropertiesPage'

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
    ],
  },
])
