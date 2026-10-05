import StatusBadge from './StatusBadge'

const lifecycleStages = [
  'manufactured',
  'allocated',
  'dispatched',
  'installed',
  'verified',
  'activated',
]

function PlateDetailsPanel({ plate }) {
  if (!plate) {
    return null
  }

  const currentIndex = lifecycleStages.indexOf(
    plate.lifecycle_status ?? '',
  )

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Plate identity
            </p>
            <h4 className="mt-2 text-2xl font-semibold text-slate-50">
              {plate.plate_code}
            </h4>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={plate.status} />
            <StatusBadge status={plate.lifecycle_status} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Plate ID
          </p>
          <p className="mt-2 break-all text-sm font-medium text-slate-100">
            {plate.id}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Property
          </p>
          <p className="mt-2 text-sm font-medium text-slate-100">
            {plate.property_name ?? 'Not assigned'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Property code
          </p>
          <p className="mt-2 text-sm font-medium text-slate-100">
            {plate.property_code ?? 'Not assigned'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Plate state
          </p>
          <p className="mt-2 text-sm font-medium text-slate-100">
            {plate.status}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Lifecycle
          </p>
          <p className="mt-2 text-sm font-medium text-slate-100">
            {plate.lifecycle_status ?? 'No lifecycle event'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Activated at
          </p>
          <p className="mt-2 text-sm font-medium text-slate-100">
            {plate.activated_at
              ? new Date(plate.activated_at).toLocaleString()
              : 'Not activated'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm font-semibold text-slate-100">
          Lifecycle progression
        </p>

        <div className="mt-5 space-y-4">
          {lifecycleStages.map((stage, index) => {
            const isActive = index === currentIndex
            const isComplete = index < currentIndex

            return (
              <div key={stage} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      isActive
                        ? 'border-sky-400 bg-sky-400'
                        : isComplete
                          ? 'border-emerald-400 bg-emerald-400'
                          : 'border-slate-600 bg-slate-900'
                    }`}
                  />
                  {index < lifecycleStages.length - 1 && (
                    <div
                      className={`mt-1 h-10 w-px ${
                        isComplete ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    />
                  )}
                </div>

                <div className="pt-0.5">
                  <p
                    className={`text-sm font-medium ${
                      isActive
                        ? 'text-sky-300'
                        : isComplete
                          ? 'text-emerald-300'
                          : 'text-slate-300'
                    }`}
                  >
                    {stage}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PlateDetailsPanel
