const variantStyles = {
  default: 'border-slate-700 bg-slate-800 text-slate-200',
  success: 'border-emerald-700/70 bg-emerald-950/70 text-emerald-300',
  warning: 'border-amber-700/70 bg-amber-950/70 text-amber-300',
  danger: 'border-red-700/70 bg-red-950/70 text-red-300',
  info: 'border-sky-700/70 bg-sky-950/70 text-sky-300',
  neutral: 'border-slate-700/70 bg-slate-950/60 text-slate-300',
}

function StatusBadge({ status, variant }) {
  const normalizedStatus = String(status ?? '').trim()
  const resolvedVariant = variant || getVariantByStatus(normalizedStatus)

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${variantStyles[resolvedVariant] ?? variantStyles.default}`}
    >
      {normalizedStatus || 'Unknown'}
    </span>
  )
}

function getVariantByStatus(status) {
  const normalized = status.toLowerCase()

  if (
    ['active', 'approved', 'verified', 'delivered', 'completed', 'installed', 'ready'].includes(normalized)
  ) {
    return 'success'
  }

  if (
    ['monitoring', 'pending', 'assigned', 'started', 'in progress', 'requires review', 'warning', 'dispatched'].includes(normalized)
  ) {
    return 'warning'
  }

  if (
    ['require action', 'maintenance', 'failed', 'rejected', 'cancelled', 'damaged'].includes(normalized)
  ) {
    return 'danger'
  }

  if (['draft', 'reserved', 'allocated', 'manufactured', 'available'].includes(normalized)) {
    return 'info'
  }

  return 'neutral'
}

export default StatusBadge
