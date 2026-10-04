function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center">
      <p className="text-lg font-medium text-slate-100">{title}</p>
      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      )}
      {action}
    </div>
  )
}

export default EmptyState
