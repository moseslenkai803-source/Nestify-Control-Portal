function LoadingState({ message = 'Loading data...' }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-4 w-4 animate-pulse rounded-full bg-sky-400" />
        <p className="text-sm text-slate-300">{message}</p>
      </div>
    </div>
  )
}

export default LoadingState
