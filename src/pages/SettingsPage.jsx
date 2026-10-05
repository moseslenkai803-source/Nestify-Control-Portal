import { BellRing, Briefcase, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'

const settingsCards = [
  {
    title: 'Role access',
    description: 'Review groups, escalation paths, and operational permissions.',
    value: '12 policies (mock)',
    icon: Briefcase,
  },
  {
    title: 'Notifications',
    description: 'Configure escalation and operational alerts for plate review.',
    value: '3 channels (mock)',
    icon: BellRing,
  },
  {
    title: 'Compliance',
    description: 'Monitor installation quality thresholds and verification rules.',
    value: '92% adherence (mock)',
    icon: ShieldCheck,
  },
  {
    title: 'Portal preferences',
    description: 'Adjust dashboard layout and default table views.',
    value: 'Default ops view',
    icon: SlidersHorizontal,
  },
]

function SettingsPage() {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Control Portal Preview"
        title="Settings"
        description="Preview of control-plane settings using mock configuration data."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {settingsCards.map(({ title, description, value, icon: Icon }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-200">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-100">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-sky-300">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-lg font-semibold text-slate-100">Operations defaults</p>
          <div className="mt-5 space-y-4">
            {[
              ['Default dashboard', 'Central Operations'],
              ['Plate request review', 'Pending first'],
              ['Priority routing', 'High-risk first'],
              ['Inventory filters', 'All active locations'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-b-0 last:pb-0">
                <span className="text-sm text-slate-300">{label}</span>
                <span className="text-sm font-medium text-slate-100">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-lg font-semibold text-slate-100">Recent checks</p>
          <div className="mt-5 space-y-4">
            {[
              ['Inventory sync', 'Preview'],
              ['Installation verification', '3 pending'],
              ['Dispatch queue', 'Preview'],
            ].map(([label, status]) => (
              <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{label}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                    {status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SettingsPage
