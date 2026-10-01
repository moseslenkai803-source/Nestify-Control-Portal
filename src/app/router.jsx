import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'
import ControlPortalLayout from '../components/layout/ControlPortalLayout'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'

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
    ],
  },
])
