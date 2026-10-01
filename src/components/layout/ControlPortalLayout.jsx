function ControlPortalLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
          <div>
            <p className="text-lg font-semibold tracking-tight">Nestify</p>
            <p className="text-xs text-slate-400">Control Portal</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-slate-300">System online</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-8">
        {children}
      </main>
    </div>
  )
}

export default ControlPortalLayout
