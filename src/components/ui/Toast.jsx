import { useCallback, useMemo, useState } from 'react'
import ToastContext from './useToast'

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const nextToast = { id, message, type }

    setToasts((current) => [...current, nextToast])

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3200)
  }, [])

  const value = useMemo(
    () => ({ showToast }),
    [showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-5 top-5 z-[60] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg ${
              toast.type === 'error'
                ? 'border-red-700/70 bg-red-950/80 text-red-100'
                : toast.type === 'warning'
                  ? 'border-amber-700/70 bg-amber-950/80 text-amber-100'
                  : 'border-emerald-700/70 bg-emerald-950/80 text-emerald-100'
            }`}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
