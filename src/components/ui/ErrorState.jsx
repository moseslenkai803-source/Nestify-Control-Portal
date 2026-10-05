function ErrorState({ title = 'Unable to load data', message, action }) {
  return (
    <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-6">
      <p className="text-sm font-medium text-red-300">{title}</p>
      {message && <p className="mt-2 text-sm text-red-400">{message}</p>}
      {action}
    </div>
  )
}

export default ErrorState
