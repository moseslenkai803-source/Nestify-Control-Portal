import { useMemo } from 'react'
import {
  ArrowUpRight,
  Box,
  ClipboardList,
  Factory,
  MapPinned,
  Package,
  ShieldCheck,
  Truck,
  Warehouse,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'

const statCards = [
  { label: 'Properties', value: '14', delta: '+2 this month', icon: MapPinned },
  { label: 'Plate requests', value: '28', delta: '+6 pending', icon: ClipboardList },
  { label: 'Manufacturing', value: '4', delta: '2 in progress', icon: Factory },
  { label: 'Active dispatches', value: '11', delta: '+3 today', icon: Truck },
]

const quickActions = [
  { label: 'Review requests', icon: ClipboardList },
  { label: 'Open inventory', icon: Warehouse },
  { label: 'Dispatch queue', icon: Truck },
  { label: 'Installation jobs', icon: Box },
]

const activityFeed = [
  { title: 'Riverside Residences', detail: '6 plates approved for installation', time: '12 mins ago' },
  { title: 'Kiboko Logistics Hub', detail: 'Dispatch route updated with new tracking', time: '48 mins ago' },
  { title: 'Harambee Office Park', detail: 'One verification flagged for follow-up', time: '1 hr ago' },
  { title: 'Mikindani Heights', detail: 'Maintenance review scheduled for next week', time: '2 hrs ago' },
]

const pendingQueue = [
  { label: 'Plate requests', value: '06', accent: 'sky' },
  { label: 'Manufacturing orders', value: '04', accent: 'amber' },
  { label: 'Verification backlog', value: '03', accent: 'rose' },
  { label: 'Dispatch exceptions', value: '02', accent: 'emerald' },
]

function DashboardPage() {
  const dailyHealth = useMemo(
    () => [48, 64, 58, 72, 86, 78, 94],
    [],
  )

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Control Portal Preview"
        title="Dashboard"
        description="Preview of the control portal dashboard using mock operational data."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
          >
            <ArrowUpRight className="h-4 w-4" />
            Export summary
          </button>
        }
      />

      <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map(({ label, value, delta, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                    {delta}
                  </span>
                </div>

                <p className="mt-5 text-sm text-slate-400">{label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-50">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-100">Operational health</p>
                  <p className="mt-1 text-sm text-slate-400">Current performance trend over the last seven days</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-900/60 bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Preview data
                </div>
              </div>

              <div className="mt-6 flex h-44 items-end gap-2">
                {dailyHealth.map((value, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-sky-500 to-emerald-400"
                      style={{ height: `${value}%` }}
                    />
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-lg font-semibold text-slate-100">Pending work</p>
              <div className="mt-5 space-y-3">
                {pendingQueue.map(({ label, value, accent }) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <div>
                      <p className="text-sm text-slate-300">{label}</p>
                    </div>
                    <span
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold ${
                        accent === 'sky'
                          ? 'bg-sky-950 text-sky-300'
                          : accent === 'amber'
                            ? 'bg-amber-950 text-amber-300'
                            : accent === 'rose'
                              ? 'bg-rose-950 text-rose-300'
                              : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-lg font-semibold text-slate-100">Quick actions</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {quickActions.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                  >
                    <span>{label}</span>
                    <Icon className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-lg font-semibold text-slate-100">Recent activity</p>
              <div className="mt-5 space-y-4">
                {activityFeed.map(({ title, detail, time }) => (
                  <div key={title} className="flex gap-3 border-b border-slate-800 pb-3 last:border-b-0 last:pb-0">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-200">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-100">{title}</p>
                      <p className="mt-1 text-sm text-slate-400">{detail}</p>
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </>
    </section>
  )
}

export default DashboardPage
