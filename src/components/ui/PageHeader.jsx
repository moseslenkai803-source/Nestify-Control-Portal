function PageHeader({ eyebrow, title, description, actions, theme = 'light' }) {
  const isDark = theme === 'dark'

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-[#C7F000]' : 'text-[#667085]'}`}>
          {eyebrow}
        </p>
        <h1 className={`mt-2 text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-[#172033]'}`}>
          {title}
        </h1>
        {description && (
          <p className={`mt-2 max-w-2xl text-sm leading-6 ${isDark ? 'text-[#CBD5E1]' : 'text-[#667085]'}`}>
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export default PageHeader
