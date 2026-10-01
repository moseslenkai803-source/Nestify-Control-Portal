import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { getAccessibleProperties } from '../lib/api/properties'

function PropertiesPage() {
  const { token } = useAuth()

  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadProperties() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getAccessibleProperties(token)
        setProperties(data)
      } catch (requestError) {
        setError(
          requestError.response?.data?.detail ||
            'Unable to load accessible properties.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      loadProperties()
    }
  }, [token])

  return (
    <section>
      <p className="text-sm font-medium text-slate-400">
        Property Operations
      </p>

      <div className="mt-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Properties
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Properties currently accessible to your employee account.
        </p>
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Loading properties...
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-6">
            <p className="text-sm font-medium text-red-300">
              Unable to load properties
            </p>
            <p className="mt-2 text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {!isLoading && !error && properties.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-medium text-slate-200">
              No accessible properties
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Your employee account does not currently have access to any
              properties.
            </p>
          </div>
        )}

        {!isLoading && !error && properties.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-950">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Property
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {properties.map((property) => (
                    <tr
                      key={property.id}
                      className="transition-colors hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">
                          {property.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {property.id}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                        {property.property_code}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                        {property.property_type}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300">
                          {property.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default PropertiesPage
