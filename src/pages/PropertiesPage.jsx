import { useEffect, useMemo, useState } from 'react'
import { Building2, Search } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { useAuth } from '../auth/useAuth'
import { getAccessibleProperties } from '../lib/api/properties'

function PropertiesPage() {
  const { token } = useAuth()
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedProperty, setSelectedProperty] = useState(null)

  async function loadProperties() {
    if (!token) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await getAccessibleProperties(token)
      setProperties(data)
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          'Unable to load the property portfolio.',
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

    async function fetchProperties() {
      setIsLoading(true)
      setError('')

      try {
        const data = await getAccessibleProperties(token)

        if (!cancelled) {
          setProperties(data)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.detail ||
              'Unable to load the property portfolio.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchProperties()

    return () => {
      cancelled = true
    }
  }, [token])

  const statusOptions = useMemo(
    () => ['All', ...new Set(properties.map((property) => property.status))],
    [properties],
  )

  const filteredProperties = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return properties.filter((property) => {
      const matchesSearch =
        !normalizedSearch ||
        property.name.toLowerCase().includes(normalizedSearch) ||
        property.property_code.toLowerCase().includes(normalizedSearch) ||
        property.property_type.toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'All' || property.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [properties, search, statusFilter])

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Property operations"
        title="Properties"
        description="Review properties you are authorized to access."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Accessible properties</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">
            {properties.length}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            From backend
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Active</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">
            {properties.filter((property) => property.status === 'active').length}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            Current status
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Filtered results</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">
            {filteredProperties.length}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            Current view
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
              placeholder="Search property name, code, or type"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="property-status" className="text-sm text-slate-400">
              Status
            </label>
            <select
              id="property-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-slate-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading && <LoadingState message="Loading property portfolio..." />}

      {!isLoading && error && (
        <ErrorState
          message={error}
          action={
            <button
              type="button"
              onClick={loadProperties}
              className="mt-4 rounded-lg border border-red-700 bg-red-950/50 px-3 py-2 text-sm font-medium text-red-200"
            >
              Retry
            </button>
          }
        />
      )}

      {!isLoading && !error && filteredProperties.length === 0 && (
        <EmptyState
          title="No properties found"
          description={
            properties.length === 0
              ? 'No accessible properties are currently available.'
              : 'Adjust the search or status filter to view more properties.'
          }
        />
      )}

      {!isLoading && !error && filteredProperties.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700 hover:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <p className="text-lg font-semibold">{property.name}</p>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    {property.property_code}
                  </p>
                </div>

                <StatusBadge status={property.status} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Type
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    {property.property_type}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Property ID
                  </p>
                  <p className="mt-2 truncate text-sm font-medium text-slate-100">
                    {property.id}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Landlord
                </p>
                <p className="mt-2 truncate text-sm text-slate-300">
                  {property.landlord_id}
                </p>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedProperty(property)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
                >
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedProperty)}
        onClose={() => setSelectedProperty(null)}
        title={selectedProperty?.name || 'Property details'}
        size="lg"
      >
        {selectedProperty && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Property code
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-50">
                  {selectedProperty.property_code}
                </p>
              </div>
              <StatusBadge status={selectedProperty.status} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Property ID
                </p>
                <p className="mt-2 break-all text-sm text-slate-100">
                  {selectedProperty.id}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Type
                </p>
                <p className="mt-2 text-sm text-slate-100">
                  {selectedProperty.property_type}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Landlord ID
                </p>
                <p className="mt-2 break-all text-sm text-slate-100">
                  {selectedProperty.landlord_id}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Status
                </p>
                <div className="mt-2">
                  <StatusBadge status={selectedProperty.status} />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}

export default PropertiesPage
