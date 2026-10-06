import { useEffect, useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { useAuth } from '../auth/useAuth'
import { getEmployees } from '../lib/api/employees'

function ManagementPage() {
  const { token } = useAuth()
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('active')

  async function loadEmployees() {
    if (!token) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await getEmployees(token, false)
      setEmployees(data)
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          'Unable to load the employee directory.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    async function fetchEmployees() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getEmployees(token, false)

        if (!cancelled) {
          setEmployees(data)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.detail ||
              'Unable to load the employee directory.',
          )
          setEmployees([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchEmployees()

    return () => {
      cancelled = true
    }
  }, [token])

  const activeCount = employees.filter(
    (employee) => !employee.ended_at,
  ).length

  const historicalCount = employees.filter(
    (employee) => Boolean(employee.ended_at),
  ).length

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const employeesInView = employees.filter((employee) => {
      if (view === 'active') {
        return !employee.ended_at
      }

      return Boolean(employee.ended_at)
    })

    if (!normalizedSearch) {
      return employeesInView
    }

    return employeesInView.filter((employee) =>
      [
        employee.employee_number,
        employee.department,
        employee.position,
        employee.user_id,
      ].some((value) =>
        String(value ?? '').toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [employees, search, view])

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Operational management"
        title="Management"
        description="Manage Nestify employees and their operational access."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Total employees</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">
            {employees.length}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            Complete employee directory
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Active</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">
            {activeCount}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            Current operational staff
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Historical</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">
            {historicalCount}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            Terminated employee records
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee number, department, position, or user ID"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView('active')}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                view === 'active'
                  ? 'border-slate-600 bg-slate-800 text-slate-50'
                  : 'border-slate-700 bg-slate-950 text-slate-400 hover:bg-slate-900'
              }`}
            >
              Active
            </button>

            <button
              type="button"
              onClick={() => setView('historical')}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                view === 'historical'
                  ? 'border-slate-600 bg-slate-800 text-slate-50'
                  : 'border-slate-700 bg-slate-950 text-slate-400 hover:bg-slate-900'
              }`}
            >
              Historical
            </button>

            <button
              type="button"
              onClick={loadEmployees}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <LoadingState message="Loading employee directory..." />
      )}

      {!isLoading && error && (
        <ErrorState
          message={error}
          action={
            <button
              type="button"
              onClick={loadEmployees}
              className="mt-4 rounded-lg border border-red-700 bg-red-950/50 px-3 py-2 text-sm font-medium text-red-200"
            >
              Retry
            </button>
          }
        />
      )}

      {!isLoading && !error && filteredEmployees.length === 0 && (
        <EmptyState
          title="No employees found"
          description={
            employees.length === 0
              ? view === 'active'
                ? 'No active employees are currently registered.'
                : 'No historical employee records are currently available.'
              : 'Adjust the search to view more employees.'
          }
        />
      )}

      {!isLoading && !error && filteredEmployees.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700 hover:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Users className="h-4 w-4 text-slate-400" />
                    <p className="text-lg font-semibold">
                      {employee.employee_number}
                    </p>
                  </div>

                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    {employee.position}
                  </p>
                </div>

                <StatusBadge
                  status={employee.ended_at ? 'terminated' : 'active'}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Department
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    {employee.department}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Position
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    {employee.position}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  User ID
                </p>
                <p className="mt-2 break-all text-sm text-slate-300">
                  {employee.user_id}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Joined {new Date(employee.joined_at).toLocaleDateString()}
                </span>

                {employee.ended_at && (
                  <span>
                    Ended {new Date(employee.ended_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default ManagementPage
