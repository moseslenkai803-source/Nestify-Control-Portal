import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import PlateDetailsPanel from '../components/ui/PlateDetailsPanel'
import StatusBadge from '../components/ui/StatusBadge'
import { useToast } from '../components/ui/useToast'
import { useAuth } from '../auth/useAuth'
import {
  approveAddressPlateRequest,
  getAddressPlateRequests,
  rejectAddressPlateRequest,
} from '../lib/api/addressPlateRequests'
import {
  approveManufacturingOrder,
  cancelManufacturingOrder,
  completeManufacturingOrder,
  getManufacturingOrders,
  startManufacturingOrder,
} from '../lib/api/manufacturingOrders'
import { getPlateInventory } from '../lib/api/plateInventory'
import {
  getPendingPropertyInstallations,
  verifyPropertyInstallation,
} from '../lib/api/propertyInstallationVerification'
import {
  cancelDispatch,
  getDispatches,
  markDispatchDelivered,
  markDispatchDispatched,
  markDispatchReady,
} from '../lib/api/dispatches'
import { mockInstallationJobs } from '../data/mockInstallation'

const tabConfig = [
  { id: 'requests', label: 'Requests' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'dispatch', label: 'Dispatch' },
  { id: 'installation', label: 'Installation' },
  { id: 'verification', label: 'Verification' },
]

function PlateOperationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'requests'
  const { showToast } = useToast()
  const { token } = useAuth()

  const [requestsLoading, setRequestsLoading] = useState(false)
  const [requests, setRequests] = useState([])
  const [requestError, setRequestError] = useState('')
  const [manufacturingOrders, setManufacturingOrders] = useState([])
  const [manufacturingLoading, setManufacturingLoading] = useState(false)
  const [manufacturingError, setManufacturingError] = useState('')
  const [inventory, setInventory] = useState([])
  const [inventoryLoading, setInventoryLoading] = useState(false)
  const [inventoryError, setInventoryError] = useState('')
  const [dispatches, setDispatches] = useState([])
  const [dispatchLoading, setDispatchLoading] = useState(false)
  const [dispatchError, setDispatchError] = useState('')
  const [dispatchActionLoading, setDispatchActionLoading] = useState('')
  const [installationJobs, setInstallationJobs] = useState(mockInstallationJobs)
  const [verificationTasks, setVerificationTasks] = useState([])
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [verificationActionLoading, setVerificationActionLoading] = useState('')
  const [search, setSearch] = useState('')
  const [requestStatusFilter, setRequestStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedPlate, setSelectedPlate] = useState(null)


  useEffect(() => {
    if (!token || activeTab !== 'requests') {
      return
    }

    let cancelled = false

    async function fetchRequests() {
      setRequestsLoading(true)
      setRequestError('')

      try {
        const statuses =
          requestStatusFilter === 'all'
            ? ['pending', 'approved', 'rejected']
            : [requestStatusFilter]

        const results = await Promise.all(
          statuses.map((status) => getAddressPlateRequests(token, status)),
        )

        if (!cancelled) {
          setRequests(results.flat())
        }
      } catch (error) {
        if (!cancelled) {
          setRequestError(
            error.response?.data?.detail ||
              'Unable to load address plate requests.',
          )
          setRequests([])
        }
      } finally {
        if (!cancelled) {
          setRequestsLoading(false)
        }
      }
    }

    fetchRequests()

    return () => {
      cancelled = true
    }
  }, [activeTab, requestStatusFilter, token])

  useEffect(() => {
    if (!token || activeTab !== 'dispatch') {
      return
    }

    let cancelled = false

    async function fetchDispatches() {
      setDispatchLoading(true)
      setDispatchError('')

      try {
        const results = await Promise.all(
          ['draft', 'ready', 'dispatched', 'delivered', 'cancelled'].map(
            (status) => getDispatches(token, status),
          ),
        )

        if (!cancelled) {
          setDispatches(results.flat())
        }
      } catch (error) {
        if (!cancelled) {
          setDispatchError(
            error.response?.data?.detail ||
              'Unable to load dispatches.',
          )
          setDispatches([])
        }
      } finally {
        if (!cancelled) {
          setDispatchLoading(false)
        }
      }
    }

    fetchDispatches()

    return () => {
      cancelled = true
    }
  }, [activeTab, token])

  useEffect(() => {
    if (!token || activeTab !== 'manufacturing') {
      return
    }

    let cancelled = false

    async function fetchManufacturingOrders() {
      setManufacturingLoading(true)
      setManufacturingError('')

      try {
        const orders = await getManufacturingOrders(token)

        if (!cancelled) {
          setManufacturingOrders(orders)
        }
      } catch (error) {
        if (!cancelled) {
          setManufacturingError(
            error.response?.data?.detail ||
              'Unable to load manufacturing orders.',
          )
          setManufacturingOrders([])
        }
      } finally {
        if (!cancelled) {
          setManufacturingLoading(false)
        }
      }
    }

    fetchManufacturingOrders()

    return () => {
      cancelled = true
    }
  }, [activeTab, token])

  useEffect(() => {
    if (!token || activeTab !== 'inventory') {
      return
    }

    let cancelled = false

    async function fetchPlateInventory() {
      setInventoryLoading(true)
      setInventoryError('')

      try {
        const plates = await getPlateInventory(token)

        if (!cancelled) {
          setInventory(plates)
        }
      } catch (error) {
        if (!cancelled) {
          setInventoryError(
            error.response?.data?.detail ||
              'Unable to load plate inventory.',
          )
          setInventory([])
        }
      } finally {
        if (!cancelled) {
          setInventoryLoading(false)
        }
      }
    }

    fetchPlateInventory()

    return () => {
      cancelled = true
    }
  }, [activeTab, token])

  useEffect(() => {
    if (!token || activeTab !== 'verification') {
      return
    }

    let cancelled = false

    async function fetchVerificationTasks() {
      setVerificationLoading(true)
      setVerificationError('')

      try {
        const results = await getPendingPropertyInstallations(token)

        if (!cancelled) {
          setVerificationTasks(results)
        }
      } catch (error) {
        if (!cancelled) {
          setVerificationError(
            error.response?.data?.detail ||
              'Unable to load pending installation verifications.',
          )
        }
      } finally {
        if (!cancelled) {
          setVerificationLoading(false)
        }
      }
    }

    fetchVerificationTasks()

    return () => {
      cancelled = true
    }
  }, [activeTab, token])

  const requestViews = useMemo(
    () => [
      { value: 'all', label: 'All requests' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ],
    [],
  )

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesStatus =
        requestStatusFilter === 'all' || request.status === requestStatusFilter
      const searchTerm = search.toLowerCase()

      const matchesSearch =
        request.id.toLowerCase().includes(searchTerm) ||
        request.property_id.toLowerCase().includes(searchTerm) ||
        request.requested_by.toLowerCase().includes(searchTerm)

      return matchesStatus && matchesSearch
    })
  }, [requests, requestStatusFilter, search])

  const filteredInventory = useMemo(() => {
    const searchTerm = search.toLowerCase()

    return inventory.filter((plate) => {
      const matchesSearch =
        plate.plate_code.toLowerCase().includes(searchTerm) ||
        (plate.property_code ?? '').toLowerCase().includes(searchTerm) ||
        (plate.property_name ?? '').toLowerCase().includes(searchTerm) ||
        plate.status.toLowerCase().includes(searchTerm) ||
        (plate.lifecycle_status ?? '').toLowerCase().includes(searchTerm)

      return matchesSearch
    })
  }, [inventory, search])

  const handleApproveRequest = async (requestId) => {
    try {
      const updatedRequest = await approveAddressPlateRequest(token, requestId)

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId ? updatedRequest : request,
        ),
      )

      setSelectedRequest((current) =>
        current?.id === requestId ? updatedRequest : current,
      )

      showToast('Plate request approved', 'success')
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          'Unable to approve the plate request.',
        'error',
      )
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      const updatedRequest = await rejectAddressPlateRequest(token, requestId)

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId ? updatedRequest : request,
        ),
      )

      setSelectedRequest((current) =>
        current?.id === requestId ? updatedRequest : current,
      )

      showToast('Plate request rejected', 'warning')
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          'Unable to reject the plate request.',
        'error',
      )
    }
  }

  const handleManufacturingUpdate = async (orderCode, action) => {
    try {
      let updatedOrder

      if (action === 'approve') {
        updatedOrder = await approveManufacturingOrder(token, orderCode)
      } else if (action === 'start') {
        updatedOrder = await startManufacturingOrder(token, orderCode)
      } else if (action === 'complete') {
        updatedOrder = await completeManufacturingOrder(token, orderCode)
      } else if (action === 'cancel') {
        updatedOrder = await cancelManufacturingOrder(token, orderCode)
      } else {
        throw new Error('Unsupported manufacturing action.')
      }

      setManufacturingOrders((current) =>
        current.map((order) =>
          order.order_code === orderCode ? updatedOrder : order,
        ),
      )

      showToast(`Order ${orderCode} updated`, 'success')
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          error.message ||
          `Unable to update order ${orderCode}.`,
        'error',
      )
    }
  }

  const handleDispatchUpdate = async (dispatch, nextStatus) => {
    const actionKey = `${dispatch.dispatch_code}:${nextStatus}`

    setDispatchActionLoading(actionKey)

    try {
      let updatedDispatch

      if (nextStatus === 'ready') {
        updatedDispatch = await markDispatchReady(
          token,
          dispatch.dispatch_code,
        )
      } else if (nextStatus === 'dispatched') {
        updatedDispatch = await markDispatchDispatched(
          token,
          dispatch.dispatch_code,
        )
      } else if (nextStatus === 'delivered') {
        updatedDispatch = await markDispatchDelivered(
          token,
          dispatch.dispatch_code,
        )
      } else if (nextStatus === 'cancelled') {
        updatedDispatch = await cancelDispatch(
          token,
          dispatch.dispatch_code,
        )
      } else {
        throw new Error('Unsupported dispatch action.')
      }

      setDispatches((current) =>
        current.map((item) =>
          item.dispatch_code === dispatch.dispatch_code
            ? updatedDispatch
            : item,
        ),
      )

      showToast(
        `Dispatch ${dispatch.dispatch_code} updated`,
        'success',
      )
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          error.message ||
          `Unable to update dispatch ${dispatch.dispatch_code}.`,
        'error',
      )
    } finally {
      setDispatchActionLoading('')
    }
  }

  const handleInstallationUpdate = (jobId, nextStatus) => {
    setInstallationJobs((current) =>
      current.map((job) =>
        job.id === jobId ? { ...job, status: nextStatus } : job,
      ),
    )
    showToast(`Installation job ${jobId} updated`, 'success')
  }

  const handleVerificationUpdate = async (task, nextStatus) => {
    const actionKey = `${task.property_id}:${task.id}:${nextStatus}`

    setVerificationActionLoading(actionKey)

    try {
      await verifyPropertyInstallation(
        token,
        task.property_id,
        task.id,
        nextStatus,
      )

      setVerificationTasks((current) =>
        current.filter((currentTask) => currentTask.id !== task.id),
      )

      showToast(
        `Installation ${task.id} ${nextStatus === 'verified' ? 'verified' : 'rejected'}`,
        'success',
      )
    } catch (error) {
      showToast(
        error.response?.data?.detail ||
          `Unable to ${nextStatus === 'verified' ? 'verify' : 'reject'} installation.`,
        'error',
      )
    } finally {
      setVerificationActionLoading('')
    }
  }

  const renderRequests = () => (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search requests, property, or requester"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {requestViews.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRequestStatusFilter(value)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                requestStatusFilter === value
                  ? 'border-slate-600 bg-slate-800 text-slate-100'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {requestsLoading ? (
        <LoadingState message="Loading plate requests..." />
      ) : requestError ? (
        <EmptyState
          title="Unable to load requests"
          description={requestError}
        />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title="No requests in this view"
          description="Try another filter or status to review the request queue."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950">
                <tr>
                  <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.2em] text-slate-500">Request</th>
                  <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.2em] text-slate-500">Property</th>
                  <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.2em] text-slate-500">Requested by</th>
                  <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.2em] text-slate-500">Date</th>
                  <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.2em] text-slate-500">Status</th>
                  <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.2em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-100">Plate request</div>
                      <div className="mt-1 text-xs text-slate-500">{request.id}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">{request.property_id}</td>
                    <td className="px-5 py-4 text-sm text-slate-300">{request.requested_by}</td>
                    <td className="px-5 py-4 text-sm text-slate-300">
                      {new Date(request.requested_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(request)}
                          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                        >
                          View details
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveRequest(request.id)}
                              className="rounded-lg border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-950"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectRequest(request.id)}
                              className="rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-950"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

  const renderManufacturing = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div>
          <p className="text-lg font-semibold text-slate-100">
            Manufacturing workspace
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Track manufacturing orders and production lifecycle state.
          </p>
        </div>
      </div>

      {manufacturingLoading ? (
        <LoadingState message="Loading manufacturing orders..." />
      ) : manufacturingError ? (
        <div className="rounded-2xl border border-red-900/60 bg-red-950/20 p-5">
          <p className="text-sm text-red-300">{manufacturingError}</p>
        </div>
      ) : manufacturingOrders.length === 0 ? (
        <EmptyState
          title="No manufacturing orders"
          description="There are currently no manufacturing orders available."
        />
      ) : (
        <div className="space-y-4">
          {manufacturingOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold text-slate-50">
                      {order.order_code}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    Quantity: {order.quantity}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {order.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() =>
                        handleManufacturingUpdate(order.order_code, 'approve')
                      }
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                    >
                      Approve
                    </button>
                  )}

                  {order.status === 'approved' && (
                    <button
                      type="button"
                      onClick={() =>
                        handleManufacturingUpdate(order.order_code, 'start')
                      }
                      className="rounded-lg border border-sky-800 bg-sky-950/30 px-3 py-2 text-xs font-medium text-sky-200 hover:bg-sky-950"
                    >
                      Start
                    </button>
                  )}

                  {order.status === 'in_production' && (
                    <button
                      type="button"
                      onClick={() =>
                        handleManufacturingUpdate(order.order_code, 'complete')
                      }
                      className="rounded-lg border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-950"
                    >
                      Complete
                    </button>
                  )}

                  {['draft', 'approved', 'in_production'].includes(
                    order.status,
                  ) && (
                    <button
                      type="button"
                      onClick={() =>
                        handleManufacturingUpdate(order.order_code, 'cancel')
                      }
                      className="rounded-lg border border-red-900/70 bg-red-950/20 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-950/40"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Quantity
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {order.quantity}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Created
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Started
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {order.started_at
                      ? new Date(order.started_at).toLocaleString()
                      : 'Not started'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Completed
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {order.completed_at
                      ? new Date(order.completed_at).toLocaleString()
                      : 'Not completed'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderInventory = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by plate, property, or status"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500"
          />
        </div>
      </div>

      {inventoryLoading ? (
        <LoadingState message="Loading plate inventory..." />
      ) : inventoryError ? (
        <div className="rounded-2xl border border-red-900/60 bg-red-950/20 p-5">
          <p className="text-sm font-medium text-red-300">
            Unable to load plate inventory
          </p>
          <p className="mt-2 text-sm text-red-200/80">
            {inventoryError}
          </p>
        </div>
      ) : filteredInventory.length === 0 ? (
        <EmptyState
          title="No plate records found"
          description={
            search
              ? "Check the search terms and try again."
              : "No address plates are currently available in the inventory."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-950">
                <tr>
                  <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Plate
                  </th>
                  <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Property
                  </th>
                  <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    State
                  </th>
                  <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Lifecycle
                  </th>
                  <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredInventory.map((plate) => (
                  <tr key={plate.id} className="hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-100">
                        {plate.plate_code}
                      </div>
                      <div className="mt-1 break-all text-xs text-slate-500">
                        {plate.id}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-sm text-slate-300">
                        {plate.property_name ?? 'Not assigned'}
                      </div>
                      {plate.property_code && (
                        <div className="mt-1 text-xs text-slate-500">
                          {plate.property_code}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={plate.status} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={plate.lifecycle_status ?? 'No event'}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedPlate(plate)}
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )


  const renderDispatch = () => {
    if (dispatchLoading) {
      return <LoadingState message="Loading dispatches..." />
    }

    if (dispatchError) {
      return (
        <ErrorState
          title="Unable to load dispatches"
          message={dispatchError}
        />
      )
    }

    const statuses = [
      'draft',
      'ready',
      'dispatched',
      'delivered',
      'cancelled',
    ]

    if (dispatches.length === 0) {
      return (
        <EmptyState
          title="No dispatches"
          description="There are currently no dispatch records in the control portal."
        />
      )
    }

    return (
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {statuses.map((status) => (
            <div
              key={status}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {status}
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-100">
                {dispatches.filter((item) => item.status === status).length}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {dispatches.map((dispatch) => {
            const currentActionKey = dispatchActionLoading
              .startsWith(`${dispatch.dispatch_code}:`)
              ? dispatchActionLoading
              : ''

            return (
              <div
                key={dispatch.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-slate-50">
                        {dispatch.dispatch_code}
                      </p>
                      <StatusBadge status={dispatch.status} />
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {dispatch.destination}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {dispatch.status === 'draft' && (
                      <>
                        <button
                          type="button"
                          disabled={Boolean(dispatchActionLoading)}
                          onClick={() =>
                            handleDispatchUpdate(dispatch, 'ready')
                          }
                          className="rounded-lg border border-sky-800 bg-sky-950/30 px-3 py-2 text-xs font-medium text-sky-200 hover:bg-sky-950 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {currentActionKey.endsWith(':ready')
                            ? 'Marking ready...'
                            : 'Mark ready'}
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(dispatchActionLoading)}
                          onClick={() =>
                            handleDispatchUpdate(dispatch, 'cancelled')
                          }
                          className="rounded-lg border border-red-900 bg-red-950/30 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {currentActionKey.endsWith(':cancelled')
                            ? 'Cancelling...'
                            : 'Cancel'}
                        </button>
                      </>
                    )}

                    {dispatch.status === 'ready' && (
                      <>
                        <button
                          type="button"
                          disabled={Boolean(dispatchActionLoading)}
                          onClick={() =>
                            handleDispatchUpdate(dispatch, 'dispatched')
                          }
                          className="rounded-lg border border-sky-800 bg-sky-950/30 px-3 py-2 text-xs font-medium text-sky-200 hover:bg-sky-950 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {currentActionKey.endsWith(':dispatched')
                            ? 'Dispatching...'
                            : 'Mark dispatched'}
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(dispatchActionLoading)}
                          onClick={() =>
                            handleDispatchUpdate(dispatch, 'cancelled')
                          }
                          className="rounded-lg border border-red-900 bg-red-950/30 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {currentActionKey.endsWith(':cancelled')
                            ? 'Cancelling...'
                            : 'Cancel'}
                        </button>
                      </>
                    )}

                    {dispatch.status === 'dispatched' && (
                      <button
                        type="button"
                        disabled={Boolean(dispatchActionLoading)}
                        onClick={() =>
                          handleDispatchUpdate(dispatch, 'delivered')
                        }
                        className="rounded-lg border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-950 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {currentActionKey.endsWith(':delivered')
                          ? 'Marking delivered...'
                          : 'Mark delivered'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Recipient
                    </p>
                    <p className="mt-2 text-sm text-slate-200">
                      {dispatch.recipient_name}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Phone
                    </p>
                    <p className="mt-2 text-sm text-slate-200">
                      {dispatch.recipient_phone}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Tracking
                    </p>
                    <p className="mt-2 text-sm text-slate-200">
                      {dispatch.tracking_reference || 'Not provided'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      Created
                    </p>
                    <p className="mt-2 text-sm text-slate-200">
                      {new Date(dispatch.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderInstallation = () => (
    <div className="space-y-4">
      {installationJobs.map((job) => (
        <div key={job.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-semibold text-slate-50">{job.plateCode}</p>
                <StatusBadge status={job.status} />
              </div>
              <p className="mt-2 text-sm text-slate-400">{job.propertyName} · {job.contractor}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {job.status === 'Pending' && (
                <button
                  type="button"
                  onClick={() => handleInstallationUpdate(job.id, 'Assigned')}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  Assign
                </button>
              )}
              {job.status === 'Assigned' && (
                <button
                  type="button"
                  onClick={() => handleInstallationUpdate(job.id, 'In Progress')}
                  className="rounded-lg border border-sky-800 bg-sky-950/30 px-3 py-2 text-xs font-medium text-sky-200 hover:bg-sky-950"
                >
                  Start installation
                </button>
              )}
              {job.status === 'In Progress' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleInstallationUpdate(job.id, 'Installed')}
                    className="rounded-lg border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-950"
                  >
                    Mark installed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstallationUpdate(job.id, 'Requires Review')}
                    className="rounded-lg border border-amber-800 bg-amber-950/30 px-3 py-2 text-xs font-medium text-amber-200 hover:bg-amber-950"
                  >
                    Needs review
                  </button>
                </>
              )}
              {job.status === 'Requires Review' && (
                <button
                  type="button"
                  onClick={() => handleInstallationUpdate(job.id, 'In Progress')}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  Resume installation
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Installer</p>
              <p className="mt-2 text-sm text-slate-200">{job.installer}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Scheduled</p>
              <p className="mt-2 text-sm text-slate-200">{job.scheduledDate}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Completion</p>
              <p className="mt-2 text-sm text-slate-200">{job.completionStatus}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderVerification = () => {
    if (verificationLoading) {
      return <LoadingState message="Loading pending verifications..." />
    }

    if (verificationError) {
      return (
        <EmptyState
          title="Unable to load verifications"
          description={verificationError}
        />
      )
    }

    if (verificationTasks.length === 0) {
      return (
        <EmptyState
          title="No pending verifications"
          description="There are no submitted installations awaiting verification for your assigned properties."
        />
      )
    }

    return (
      <div className="space-y-4">
        {verificationTasks.map((task) => {
          const verifyActionKey = `${task.property_id}:${task.id}:verified`
          const rejectActionKey = `${task.property_id}:${task.id}:rejected`
          const actionLoading =
            verificationActionLoading === verifyActionKey ||
            verificationActionLoading === rejectActionKey

          return (
            <div
              key={task.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold text-slate-50">
                      Installation {task.id}
                    </p>
                    <StatusBadge status={task.status} />
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-400">
                    <p>
                      <span className="text-slate-500">Property:</span>{' '}
                      {task.property_id}
                    </p>
                    <p>
                      <span className="text-slate-500">Plate:</span>{' '}
                      {task.plate_id}
                    </p>
                    <p>
                      <span className="text-slate-500">Installer:</span>{' '}
                      {task.installer_id}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleVerificationUpdate(task, 'verified')}
                    disabled={actionLoading}
                    className="rounded-lg border border-emerald-700/70 bg-emerald-950/40 px-3 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-950/70 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {verificationActionLoading === verifyActionKey
                      ? 'Verifying...'
                      : 'Verify'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerificationUpdate(task, 'rejected')}
                    disabled={actionLoading}
                    className="rounded-lg border border-red-700/70 bg-red-950/40 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-950/70 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {verificationActionLoading === rejectActionKey
                      ? 'Rejecting...'
                      : 'Reject'}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Captured at
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    {task.captured_at
                      ? new Date(task.captured_at).toLocaleString()
                      : '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Coordinates
                  </p>
                  <p className="mt-2 break-all text-sm text-slate-200">
                    {task.latitude}, {task.longitude}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Accuracy
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    {task.accuracy_meters != null
                      ? `${task.accuracy_meters} m`
                      : 'Not provided'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Notes
                  </p>
                  <p className="mt-2 text-sm text-slate-200">
                    {task.notes || 'No installation notes provided.'}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'requests':
        return renderRequests()
      case 'manufacturing':
        return renderManufacturing()
      case 'inventory':
        return renderInventory()
      case 'dispatch':
        return renderDispatch()
      case 'installation':
        return renderInstallation()
      case 'verification':
        return renderVerification()
      default:
        return renderRequests()
    }
  }

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Operational workflow"
        title="Plate Operations"
        description="Coordinate address plate requests, manufacturing, inventory, dispatch, installation, and verification."
      />

      <>
          <div className="flex flex-wrap gap-2">
            {tabConfig.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSearchParams({ tab: id })}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  activeTab === id
                    ? 'border-slate-600 bg-slate-800 text-slate-100'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {renderTabContent()}
      </>

      <Modal isOpen={Boolean(selectedRequest)} onClose={() => setSelectedRequest(null)} title="Request details" size="lg">
        {selectedRequest && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Address plate request
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-50">
                    {selectedRequest.id}
                  </p>
                </div>
                <StatusBadge status={selectedRequest.status} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Property ID
                </p>
                <p className="mt-2 break-all text-sm text-slate-100">
                  {selectedRequest.property_id}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Requested by
                </p>
                <p className="mt-2 break-all text-sm text-slate-100">
                  {selectedRequest.requested_by}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Requested at
                </p>
                <p className="mt-2 text-sm text-slate-100">
                  {new Date(selectedRequest.requested_at).toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Last updated
                </p>
                <p className="mt-2 text-sm text-slate-100">
                  {new Date(selectedRequest.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={Boolean(selectedPlate)} onClose={() => setSelectedPlate(null)} title="Plate details" size="xl">
        <PlateDetailsPanel
          plate={{
            ...selectedPlate,
            code: selectedPlate?.code,
            id: selectedPlate?.id,
            propertyName: selectedPlate?.propertyName,
            physicalStatus: selectedPlate?.physicalStatus,
            lifecycleStatus: selectedPlate?.lifecycleStatus,
            area: selectedPlate?.area,
          }}
        />
      </Modal>
    </section>
  )
}

export default PlateOperationsPage
