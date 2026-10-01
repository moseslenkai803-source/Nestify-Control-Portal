import { createBrowserRouter } from 'react-router-dom'
import ControlPortalLayout from '../components/layout/ControlPortalLayout'
import DashboardPage from '../pages/DashboardPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ControlPortalLayout>
        <DashboardPage />
      </ControlPortalLayout>
    ),
  },
])
