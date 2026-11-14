import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Save,
  Settings2,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../auth/useAuth'
import { useToast } from '../components/ui/useToast'
import {
  getPlatformSettings,
  getPlatformSettingsAuditLogs,
  getPlatformSettingsStatus,
  updatePlatformSettings,
} from '../lib/api/settings'

const AUDIT_PAGE_SIZE = 20

const initialForm = {
  organization_name: '',
  legal_name: '',
  support_email: '',
  support_phone: '',
  timezone: '',
  locale: '',
  currency_code: '',
  date_format: 'DD/MM/YYYY',
  time_format: '24h',
  reason: '',
}

const settingFields = [
  {
    name: 'organization_name',
    label: 'Organization name',
    description: 'The public-facing name used across the platform.',
    required: true,
  },
  {
    name: 'legal_name',
    label: 'Legal name',
    description: 'The registered legal entity name, if different.',
  },
  {
    name: 'support_email',
    label: 'Support email',
    type: 'email',
    description: 'The contact email for platform support.',
  },
  {
    name: 'support_phone',
    label: 'Support phone',
    type: 'tel',
    description: 'The primary support contact number.',
  },
  {
    name: 'timezone',
    label: 'Timezone',
    description: 'Use an IANA timezone, for example Africa/Nairobi.',
    required: true,
  },
  {
    name: 'locale',
    label: 'Locale',
    description: 'Language and regional format, for example en-KE.',
    required: true,
  },
  {
    name: 'currency_code',
    label: 'Currency code',
    description: 'Three-letter ISO currency code, for example KES.',
    required: true,
  },
]

function inputClassName() {
  return 'mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60'
}

function errorMessage(error) {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join(', ')
  }

  if (error?.response?.status === 401) {
    return 'Your session has expired. Please sign in again.'
  }

  if (error?.response?.status === 403) {
    return 'Your account does not have permission to access platform settings.'
  }

  return 'The request could not be completed. Check the API connection and try again.'
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function StatusIndicator({ label, value }) {
  const healthy = value === 'healthy' || value === 'configured'
  const neutral = value === 'not_required'

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-800 py-3 last:border-b-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${
          healthy
            ? 'text-emerald-300'
            : neutral
              ? 'text-slate-400'
              : 'text-amber-300'
        }`}
      >
        {healthy ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <AlertCircle className="h-3.5 w-3.5" />
        )}
        {String(value ?? 'unknown').replaceAll('_', ' ')}
      </span>
    </div>
  )
}

function BooleanStatus({
  label,
  value,
  trueLabel = 'Configured',
  falseLabel = 'Not configured',
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-800 py-3 last:border-b-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span
        className={`text-xs font-semibold ${
          value ? 'text-emerald-300' : 'text-amber-300'
        }`}
      >
        {value ? trueLabel : falseLabel}
      </span>
    </div>
  )
}

function SettingsPage() {
  const { token } = useAuth()
  const { showToast } = useToast()

  const [form, setForm] = useState(initialForm)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pageError, setPageError] = useState('')
  const [auditLogs, setAuditLogs] = useState([])
  const [auditOffset, setAuditOffset] = useState(0)
  const [auditLoading, setAuditLoading] = useState(true)
  const [auditError, setAuditError] = useState('')
  const [status, setStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState('')

  const loadSettings = useCallback(async () => {
    try {
      const data = await getPlatformSettings(token)
      setPageError('')

      setForm({
        organization_name: data.organization_name ?? '',
        legal_name: data.legal_name ?? '',
        support_email: data.support_email ?? '',
        support_phone: data.support_phone ?? '',
        timezone: data.timezone ?? '',
        locale: data.locale ?? '',
        currency_code: data.currency_code ?? '',
        date_format: data.date_format ?? 'DD/MM/YYYY',
        time_format: data.time_format ?? '24h',
        reason: '',
      })
      setSettingsLoaded(true)
    } catch (error) {
      setPageError(errorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const loadAuditLogs = useCallback(async () => {
    try {
      const data = await getPlatformSettingsAuditLogs(token, {
        limit: AUDIT_PAGE_SIZE,
        offset: auditOffset,
      })
      setAuditError('')
      setAuditLogs(data)
    } catch (error) {
      setAuditError(errorMessage(error))
    } finally {
      setAuditLoading(false)
    }
  }, [token, auditOffset])

  const loadStatus = useCallback(async () => {
    try {
      const data = await getPlatformSettingsStatus(token)
      setStatusError('')
      setStatus(data)
    } catch (error) {
      setStatusError(errorMessage(error))
    } finally {
      setStatusLoading(false)
    }
  }, [token])

  useEffect(() => {
    Promise.resolve().then(() => {
      loadSettings()
      loadAuditLogs()
      loadStatus()
    })
  }, [loadSettings, loadAuditLogs, loadStatus])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)

    const payload = {
      organization_name: form.organization_name,
      legal_name: form.legal_name || null,
      support_email: form.support_email || null,
      support_phone: form.support_phone || null,
      timezone: form.timezone,
      locale: form.locale,
      currency_code: form.currency_code.toUpperCase(),
      date_format: form.date_format,
      time_format: form.time_format,
      reason: form.reason.trim() || null,
    }

    try {
      const updated = await updatePlatformSettings(token, payload)

      setForm((current) => ({
        ...current,
        ...updated,
        legal_name: updated.legal_name ?? '',
        support_email: updated.support_email ?? '',
        support_phone: updated.support_phone ?? '',
        reason: '',
      }))

      showToast('Platform settings saved successfully.')
      await Promise.all([loadAuditLogs(), loadStatus()])
    } catch (error) {
      showToast(errorMessage(error), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRefresh() {
    setIsLoading(true)
    setAuditLoading(true)
    setStatusLoading(true)
    setPageError('')
    setAuditError('')
    setStatusError('')

    await Promise.all([loadSettings(), loadAuditLogs(), loadStatus()])
  }

  function handlePreviousAuditPage() {
    setAuditOffset((current) => Math.max(0, current - AUDIT_PAGE_SIZE))
  }

  function handleNextAuditPage() {
    if (auditLogs.length === AUDIT_PAGE_SIZE) {
      setAuditOffset((current) => current + AUDIT_PAGE_SIZE)
    }
  }

  const runtime = status?.runtime_configuration
  const outbox = status?.outbox_counts

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Control Plane"
        title="Settings"
        description="Manage platform-wide organization settings and review operational health and configuration changes."
        actions={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading || statusLoading || auditLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      {pageError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-800/70 bg-red-950/30 p-4 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p>{pageError}</p>
            <button
              type="button"
              onClick={loadSettings}
              className="mt-2 font-semibold underline underline-offset-4"
            >
              Retry settings request
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-sky-300">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                Organization settings
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Platform-wide defaults and support details.
              </p>
            </div>
          </div>

          {isLoading ? (
            <p className="py-10 text-sm text-slate-400">
              Loading platform settings…
            </p>
          ) : settingsLoaded ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                {settingFields.map((field) => (
                  <label
                    key={field.name}
                    className="block min-w-0"
                  >
                    <span className="text-sm font-medium text-slate-200">
                      {field.label}
                      {field.required && (
                        <span className="ml-1 text-rose-300">*</span>
                      )}
                    </span>
                    <input
                      name={field.name}
                      type={field.type ?? 'text'}
                      value={form[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      maxLength={
                        field.name === 'support_phone'
                          ? 30
                          : field.name === 'organization_name' ||
                              field.name === 'legal_name'
                            ? 255
                            : undefined
                      }
                      className={inputClassName()}
                    />
                    <span className="mt-1.5 block text-xs leading-5 text-slate-500">
                      {field.description}
                    </span>
                  </label>
                ))}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-200">
                    Date format
                  </span>
                  <select
                    name="date_format"
                    value={form.date_format}
                    onChange={handleChange}
                    className={inputClassName()}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-200">
                    Time format
                  </span>
                  <select
                    name="time_format"
                    value={form.time_format}
                    onChange={handleChange}
                    className={inputClassName()}
                  >
                    <option value="24h">24-hour</option>
                    <option value="12h">12-hour</option>
                  </select>
                </label>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-200">
                    Change reason
                  </span>
                  <textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    maxLength={500}
                    rows={2}
                    placeholder="Explain why these settings are being changed (optional)"
                    className={inputClassName()}
                  />
                  <span className="mt-1.5 block text-xs text-slate-500">
                    This reason is recorded with each changed setting in the audit history.
                  </span>
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Changes are restricted to platform administrators.
                </p>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving…' : 'Save settings'}
                </button>
              </div>
            </form>
          ) : (
            <p className="py-8 text-sm text-slate-400">
              Settings could not be loaded.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-sky-300">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                Operational status
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Safe runtime and service indicators.
              </p>
            </div>
          </div>

          {statusLoading ? (
            <p className="py-8 text-sm text-slate-400">
              Checking operational status…
            </p>
          ) : statusError ? (
            <p className="py-8 text-sm text-amber-300">{statusError}</p>
          ) : status ? (
            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Application
                </p>
                <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/50 px-3">
                  <div className="flex justify-between gap-3 py-3 text-sm">
                    <span className="text-slate-400">Name</span>
                    <span className="text-right font-medium text-slate-100">
                      {status.app_name}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-slate-800 py-3 text-sm">
                    <span className="text-slate-400">Version</span>
                    <span className="font-medium text-slate-100">
                      {status.app_version}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-slate-800 py-3 text-sm">
                    <span className="text-slate-400">Environment</span>
                    <span className="font-medium capitalize text-slate-100">
                      {status.environment}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Service health
                </p>
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-3">
                  <StatusIndicator
                    label="Database"
                    value={status.database_status}
                  />
                  <StatusIndicator
                    label="Redis"
                    value={status.redis_status}
                  />
                  <StatusIndicator
                    label="Email configuration"
                    value={status.email_configuration_status}
                  />
                </div>
              </div>

              {outbox && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Email outbox
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(outbox).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-xl border border-slate-800 bg-slate-950/50 p-3"
                      >
                        <p className="text-xs capitalize text-slate-500">
                          {key.replaceAll('_', ' ')}
                        </p>
                        <p className="mt-1 text-xl font-semibold tabular-nums text-slate-100">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {runtime && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Runtime configuration
                  </p>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-3">
                    <BooleanStatus
                      label="Debug mode"
                      value={runtime.debug_mode}
                      trueLabel="Enabled"
                      falseLabel="Disabled"
                    />
                    <BooleanStatus
                      label="Frontend URL"
                      value={runtime.frontend_url_configured}
                    />
                    <BooleanStatus
                      label="JWT secret"
                      value={runtime.jwt_secret_configured}
                    />
                    <BooleanStatus
                      label="Outbox encryption"
                      value={runtime.outbox_encryption_configured}
                    />
                    <div className="flex items-center justify-between gap-3 py-3">
                      <span className="text-sm text-slate-300">
                        CORS origins
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-slate-100">
                        {runtime.cors_origin_count}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Settings audit history
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Recorded changes to platform settings, ordered newest first.
            </p>
          </div>
          <span className="text-xs text-slate-500">
            Showing up to {AUDIT_PAGE_SIZE} records per page
          </span>
        </div>

        {auditError && (
          <p className="mt-4 rounded-xl border border-amber-800/70 bg-amber-950/30 p-3 text-sm text-amber-200">
            {auditError}
          </p>
        )}

        {auditLoading ? (
          <p className="py-8 text-sm text-slate-400">
            Loading audit history…
          </p>
        ) : auditLogs.length === 0 ? (
          <p className="py-8 text-sm text-slate-400">
            No setting changes are recorded on this page.
          </p>
        ) : (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-4 font-semibold">Setting</th>
                    <th className="pb-3 pr-4 font-semibold">Previous value</th>
                    <th className="pb-3 pr-4 font-semibold">New value</th>
                    <th className="pb-3 pr-4 font-semibold">Changed by</th>
                    <th className="pb-3 font-semibold">Changed at</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-slate-800/70 last:border-b-0"
                    >
                      <td className="py-4 pr-4 font-medium text-slate-200">
                        {entry.setting_key.replaceAll('_', ' ')}
                        {entry.reason && (
                          <p className="mt-1 max-w-[220px] text-xs font-normal text-slate-500">
                            {entry.reason}
                          </p>
                        )}
                      </td>
                      <td className="max-w-[180px] truncate py-4 pr-4 text-slate-400">
                        {entry.previous_value ?? '—'}
                      </td>
                      <td className="max-w-[180px] truncate py-4 pr-4 text-slate-200">
                        {entry.new_value ?? '—'}
                      </td>
                      <td className="max-w-[180px] truncate py-4 pr-4 text-xs text-slate-400">
                        {entry.actor_user_id}
                      </td>
                      <td className="whitespace-nowrap py-4 text-xs text-slate-400">
                        {formatDate(entry.changed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
              <span className="text-xs text-slate-500">
                Offset {auditOffset}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePreviousAuditPage}
                  disabled={auditOffset === 0 || auditLoading}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNextAuditPage}
                  disabled={
                    auditLogs.length < AUDIT_PAGE_SIZE || auditLoading
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </section>
  )
}

export default SettingsPage
