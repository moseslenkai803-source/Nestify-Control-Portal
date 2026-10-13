import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  Box,
  ClipboardList,
  Factory,
  MapPinned,
  Truck,
  Warehouse,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../auth/useAuth'
import { hasPermission, PERMISSIONS } from '../auth/permissions'
import { getAddressPlateRequests } from '../lib/api/addressPlateRequests'
import { getDispatches } from '../lib/api/dispatches'
import { getManufacturingOrders } from '../lib/api/manufacturingOrders'
import { getAccessibleProperties } from '../lib/api/properties'

const emptyData = {
  properties: null,
  requests: null,
  manufacturingOrders: null,
  dispatches: null,
}

const emptySourceState = {
  properties: { loading: true, error: '' },
  requests: { loading: true, error: '' },
  manufacturingOrders: { loading: true, error: '' },
  dispatches: { loading: true, error: '' },
}

const quickActions = [
  {
    label: 'Review requests',
    description: 'Review incoming plate requests',
    icon: ClipboardList,
    path: '/plate-operations?tab=requests',
    permission: PERMISSIONS.PLATE_OPERATIONS,
  },
  {
    label: 'Open inventory',
    description: 'View available plate inventory',
    icon: Warehouse,
    path: '/plate-operations?tab=inventory',
    permission: PERMISSIONS.PLATE_OPERATIONS,
  },
  {
    label: 'Dispatch queue',
    description: 'Manage plate dispatches',
    icon: Truck,
    path: '/plate-operations?tab=dispatch',
    permission: PERMISSIONS.PLATE_OPERATIONS,
  },
  {
    label: 'Installation jobs',
    description: 'View installation assignments',
    icon: Box,
    path: '/plate-operations?tab=installation',
    permission: PERMISSIONS.PLATE_OPERATIONS,
  },
  {
    label: 'Verify installations',
    description: 'Review pending installation verification',
    icon: ArrowUpRight,
    path: '/plate-operations?tab=verification',
    permission: PERMISSIONS.INSTALLATION_VERIFICATION,
  },
]

function listOrThrow(data, sourceName) {
  if (!Array.isArray(data)) {
    throw new Error(`Unexpected ${sourceName} response format`)
  }

  return data
}

function errorMessage(error) {
  if (error.response?.status === 403) {
    return 'Unavailable for your role.'
  }

  return 'Unable to load this data.'
}

function MetricCard({ label, value, detail, icon: Icon, loading, error }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-200">
          <Icon className="h-5 w-5" />
        </div>
        {loading ? (
          <span className="text-xs text-slate-500">Loading</span>
        ) : error ? (
          <span className="text-xs text-amber-300">Unavailable</span>
        ) : null}
      </div>
      <p className="mt-5 text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-50">
        {loading ? '—' : error ? '—' : value}
      </p>
      <p className="mt-2 text-sm text-slate-500">
        {loading ? 'Fetching live data…' : error || detail}
      </p>
    </div>
  )
}

function QueueRow({ label, value, loading, error, accent = 'sky' }) {
  const accentClass = {
    sky: 'bg-sky-950 text-sky-300',
    amber: 'bg-amber-950 text-amber-300',
    emerald: 'bg-emerald-950 text-emerald-300',
  }[accent]

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
      <p className="text-sm text-slate-300">{label}</p>
      <span
        className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold ${
          error ? 'bg-slate-800 text-slate-400' : accentClass
        }`}
      >
        {loading ? '—' : error ? '—' : value}
      </span>
    </div>
  )
}

function DashboardPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(emptyData)
  const [sourceState, setSourceState] = useState(emptySourceState)

  useEffect(() => {
    let cancelled = false

    setData(emptyData)
    setSourceState(
      Object.fromEntries(
        Object.keys(emptySourceState).map((key) => [
          key,
          { loading: true, error: '' },
        ]),
      ),
    )

    if (!token) {
      setSourceState(
        Object.fromEntries(
          Object.keys(emptySourceState).map((key) => [
            key,
            { loading: false, error: 'Sign in to load dashboard data.' },
          ]),
        ),
      )
      return () => {
        cancelled = true
      }
    }

    async function loadSource(key, loader) {
      try {
        const result = await loader()

        if (!cancelled) {
          setData((current) => ({ ...current, [key]: result }))
          setSourceState((current) => ({
            ...current,
            [key]: { loading: false, error: '' },
          }))
        }
      } catch (error) {
        if (!cancelled) {
          setSourceState((current) => ({
            ...current,
            [key]: { loading: false, error: errorMessage(error) },
          }))
        }
      }
    }

    loadSource('properties', async () =>
      listOrThrow(await getAccessibleProperties(token), 'properties'),
    )

    if (hasPermission(user, PERMISSIONS.PLATE_OPERATIONS)) {
      loadSource('requests', async () => {
        const responses = await Promise.all(
          ['pending', 'approved', 'rejected'].map((status) =>
            getAddressPlateRequests(token, status),
          ),
        )
        return responses.flatMap((response) =>
          listOrThrow(response, 'plate requests'),
        )
      })

      loadSource('manufacturingOrders', async () =>
        listOrThrow(
          await getManufacturingOrders(token),
          'manufacturing orders',
        ),
      )

      loadSource('dispatches', async () =>
        listOrThrow(await getDispatches(token), 'dispatches'),
      )
    } else {
      for (const key of ['requests', 'manufacturingOrders', 'dispatches']) {
        setSourceState((current) => ({
          ...current,
          [key]: {
            loading: false,
            error: 'Unavailable for your role.',
          },
        }))
      }
    }

    return () => {
      cancelled = true
    }
  }, [token, user])

  const properties = data.properties
  const requests = data.requests
  const manufacturingOrders = data.manufacturingOrders
  const dispatches = data.dispatches

  const pendingRequests =
    requests?.filter((request) => request.status === 'pending').length ?? null

  const inProductionOrders =
    manufacturingOrders?.filter(
      (order) => order.status === 'in_production',
    ).length ?? null

  const ordersAwaitingAction =
    manufacturingOrders?.filter((order) =>
      ['draft', 'approved'].includes(order.status),
    ).length ?? null

  const activeDispatches =
    dispatches?.filter((dispatch) =>
      ['ready', 'dispatched'].includes(dispatch.status),
    ).length ?? null

  const visibleQuickActions = quickActions.filter((action) =>
    hasPermission(user, action.permission),
  )

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Operations overview"
        title="Dashboard"
        description="Live operational counts based on data available to your account."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Accessible properties"
          value={properties?.length ?? 0}
          detail="Properties available to your account"
          icon={MapPinned}
          {...sourceState.properties}
        />
        <MetricCard
          label="Plate requests"
          value={requests?.length ?? 0}
          detail={
            requests
              ? `${pendingRequests} pending`
              : 'Request totals unavailable'
          }
          icon={ClipboardList}
          {...sourceState.requests}
        />
        <MetricCard
          label="In production"
          value={inProductionOrders ?? 0}
          detail={
            manufacturingOrders
              ? `${ordersAwaitingAction} awaiting action`
              : 'Manufacturing totals unavailable'
          }
          icon={Factory}
          {...sourceState.manufacturingOrders}
        />
        <MetricCard
          label="Active dispatches"
          value={activeDispatches ?? 0}
          detail="Ready or dispatched"
          icon={Truck}
          {...sourceState.dispatches}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-lg font-semibold text-slate-100">
            System health &amp; analytics
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Health trends will appear when a persisted monitoring and analytics
            data source is available. This dashboard does not currently report
            system-health measurements.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-lg font-semibold text-slate-100">Pending work</p>
          <div className="mt-5 space-y-3">
            <QueueRow
              label="Plate requests"
              value={pendingRequests ?? 0}
              loading={sourceState.requests.loading}
              error={sourceState.requests.error}
            />
            <QueueRow
              label="Manufacturing orders"
              value={ordersAwaitingAction ?? 0}
              loading={sourceState.manufacturingOrders.loading}
              error={sourceState.manufacturingOrders.error}
              accent="amber"
            />
            <QueueRow
              label="Active dispatches"
              value={activeDispatches ?? 0}
              loading={sourceState.dispatches.loading}
              error={sourceState.dispatches.error}
              accent="emerald"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-lg font-semibold text-slate-100">Quick actions</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {visibleQuickActions.map(({ label, description, icon: Icon, path }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(path)}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <span>
                  <span className="block">{label}</span>
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    {description}
                  </span>
                </span>
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            ))}
            {visibleQuickActions.length === 0 && (
              <p className="text-sm text-slate-400">
                No operational quick actions are available for your account.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-lg font-semibold text-slate-100">Recent activity</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            A verified activity feed is not available yet. Activity will appear
            here when the backend provides an auditable activity endpoint.
          </p>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
