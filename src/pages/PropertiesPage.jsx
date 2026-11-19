import { useEffect, useMemo, useState } from 'react'
import { Building2, Search } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { useAuth } from '../auth/useAuth'
import { getAccessibleProperties, getPropertyPortfolio } from '../lib/api/properties'

function PropertiesPage() {
  const { token, user } = useAuth()
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
      const fetchProperties =
        user?.role === 'admin' ? getPropertyPortfolio : getAccessibleProperties
      const data = await fetchProperties(token)
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
        const fetchProperties =
          user?.role === 'admin' ? getPropertyPortfolio : getAccessibleProperties
        const data = await fetchProperties(token)

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
  }, [token, user?.role])

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
    <section className="space-y-8 rounded-3xl bg-[#0B1220] p-5 md:p-8">
      <PageHeader
        theme="dark"
        eyebrow="Property operations"
        title="Properties"
        description={
          user?.role === 'admin'
            ? 'Review the property portfolio across the platform.'
            : 'Review properties you are authorized to access.'
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#334155] bg-[#17243B] p-5">
          <p className="text-sm text-[#CBD5E1]">
            {user?.role === 'admin' ? 'Total properties' : 'Accessible properties'}
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {properties.length}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#94A3B8]">
            From backend
          </p>
        </div>

        <div className="rounded-2xl border border-[#334155] bg-[#17243B] p-5">
          <p className="text-sm text-[#CBD5E1]">Active</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {properties.filter((property) => property.status === 'active').length}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#94A3B8]">
            Current status
          </p>
        </div>

        <div className="rounded-2xl border border-[#334155] bg-[#17243B] p-5">
          <p className="text-sm text-[#CBD5E1]">Filtered results</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {filteredProperties.length}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#94A3B8]">
            Current view
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#334155] bg-[#17243B] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C7F000]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search property name, code, or type"
              className="w-full rounded-xl border border-[#334155] bg-[#0B1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#94A3B8] focus:border-[#C7F000]"
            />
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="property-status" className="text-sm text-[#CBD5E1]">
              Status
            </label>
            <select
              id="property-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-[#334155] bg-[#0B1220] px-3 py-2.5 text-sm text-white outline-none focus:border-[#C7F000]"
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
              className="rounded-2xl border border-[#334155] bg-[#17243B] p-5 transition hover:border-[#C7F000] hover:bg-[#1E2D46]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-white">
                    <Building2 className="h-4 w-4 text-[#C7F000]" />
                    <p className="text-lg font-semibold text-[#C7F000]">{property.name}</p>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#94A3B8]">
                    {property.property_code}
                  </p>
                </div>

                <StatusBadge status={property.status} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">
                    Type
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {property.property_type}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">
                    Property ID
                  </p>
                  <p className="mt-2 truncate text-sm font-medium text-white">
                    {property.id}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">
                  Landlord
                </p>
                <p className="mt-2 truncate text-sm text-[#CBD5E1]">
                  {property.landlord_id}
                </p>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedProperty(property)}
                  className="rounded-lg border border-[#C7F000] bg-[#C7F000] px-3 py-2 text-sm font-semibold text-[#101B33] transition hover:bg-[#D8FF24]"
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
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#334155] bg-[#0B1220] p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">
                  Property code
                </p>
                <p className="mt-2 text-xl font-semibold text-[#C7F000]">
                  {selectedProperty.property_code}
                </p>
              </div>
              <StatusBadge status={selectedProperty.status} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#334155] bg-[#17243B] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">
                  Property ID
                </p>
                <p className="mt-2 break-all text-sm text-white">
                  {selectedProperty.id}
                </p>
              </div>

              <div className="rounded-xl border border-[#334155] bg-[#17243B] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">
                  Type
                </p>
                <p className="mt-2 text-sm text-white">
                  {selectedProperty.property_type}
                </p>
              </div>

              <div className="rounded-xl border border-[#334155] bg-[#17243B] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">
                  Landlord ID
                </p>
                <p className="mt-2 break-all text-sm text-white">
                  {selectedProperty.landlord_id}
                </p>
              </div>

              <div className="rounded-xl border border-[#334155] bg-[#17243B] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">
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
