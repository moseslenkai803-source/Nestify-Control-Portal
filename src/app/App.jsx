import { RouterProvider } from 'react-router-dom'
import AuthProvider from '../auth/AuthProvider'
import ToastProvider from '../components/ui/Toast'
import { router } from './router'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
