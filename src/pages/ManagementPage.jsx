import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import LoadingState from '../components/ui/LoadingState'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import { useAuth } from '../auth/useAuth'
import { useToast } from '../components/ui/useToast'
import {
  addEmployeeClearance,
  createEmployee,
  getEmployee,
  getEmployeeCandidates,
  getEmployeeClearances,
  getEmployees,
  removeEmployeeClearance,
} from '../lib/api/employees'
import {
  addContractorMember,
  createContractor,
  getContractor,
  getContractorCandidates,
  getContractorMembers,
  getContractors,
} from '../lib/api/contractors'

function ManagementPage() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [managementView, setManagementView] = useState('employees')
  const [employees, setEmployees] = useState([])
  const [contractors, setContractors] = useState([])
  const [isLoadingContractors, setIsLoadingContractors] = useState(true)
  const [contractorError, setContractorError] = useState('')
  const [contractorSearch, setContractorSearch] = useState('')
  const [contractorView, setContractorView] = useState('active')
  const [selectedContractor, setSelectedContractor] = useState(null)
  const [contractorMembers, setContractorMembers] = useState([])
  const [isContractorDetailModalOpen, setIsContractorDetailModalOpen] =
    useState(false)
  const [isLoadingContractorDetails, setIsLoadingContractorDetails] =
    useState(false)
  const [contractorDetailError, setContractorDetailError] = useState('')
  const [isAddContractorMemberModalOpen, setIsAddContractorMemberModalOpen] =
    useState(false)
  const [contractorCandidates, setContractorCandidates] = useState([])
  const [isLoadingContractorCandidates, setIsLoadingContractorCandidates] =
    useState(false)
  const [contractorCandidateError, setContractorCandidateError] = useState('')
  const [selectedContractorCandidate, setSelectedContractorCandidate] =
    useState('')
  const [isAddingContractorMember, setIsAddingContractorMember] =
    useState(false)
  const [addContractorMemberError, setAddContractorMemberError] =
    useState('')
  const [isCreateContractorModalOpen, setIsCreateContractorModalOpen] =
    useState(false)
  const [isCreatingContractor, setIsCreatingContractor] = useState(false)
  const [createContractorForm, setCreateContractorForm] = useState({
    name: '',
    contractorType: 'company',
    contactEmail: '',
    contactPhone: '',
  })
  const [createContractorError, setCreateContractorError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('active')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [candidates, setCandidates] = useState([])
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [candidateError, setCandidateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    userId: '',
    employeeNumber: '',
    department: '',
    position: '',
    clearances: [],
  })
  const [createError, setCreateError] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employeeClearances, setEmployeeClearances] = useState([])
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [clearanceError, setClearanceError] = useState('')
  const [clearanceForm, setClearanceForm] = useState('')
  const [isUpdatingClearance, setIsUpdatingClearance] = useState(false)

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

  async function loadContractors() {
    if (!token) {
      return
    }

    setIsLoadingContractors(true)
    setContractorError('')

    try {
      const data = await getContractors(token, false)
      setContractors(data)
    } catch (requestError) {
      setContractorError(
        requestError.response?.data?.detail ||
          'Unable to load the contractor directory.',
      )
    } finally {
      setIsLoadingContractors(false)
    }
  }

  function resetCreateContractorForm() {
    setCreateContractorForm({
      name: '',
      contractorType: 'company',
      contactEmail: '',
      contactPhone: '',
    })
    setCreateContractorError('')
  }

  function closeCreateContractorModal() {
    if (isCreatingContractor) {
      return
    }

    setIsCreateContractorModalOpen(false)
    resetCreateContractorForm()
  }

  function handleCreateContractorFieldChange(field, value) {
    setCreateContractorForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleCreateContractor(event) {
    event.preventDefault()

    if (!token || isCreatingContractor) {
      return
    }

    const name = createContractorForm.name.trim()

    if (!name) {
      setCreateContractorError('Contractor name is required.')
      return
    }

    setIsCreatingContractor(true)
    setCreateContractorError('')

    try {
      await createContractor(token, {
        name,
        contractor_type: createContractorForm.contractorType.trim(),
        contact_email:
          createContractorForm.contactEmail.trim() || null,
        contact_phone:
          createContractorForm.contactPhone.trim() || null,
      })

      await loadContractors()
      setIsCreateContractorModalOpen(false)
      resetCreateContractorForm()
      showToast('Contractor created successfully.')
    } catch (requestError) {
      setCreateContractorError(
        requestError.response?.data?.detail ||
          'Unable to create the contractor.',
      )
    } finally {
      setIsCreatingContractor(false)
    }
  }

  function closeContractorDetailModal() {
    if (isLoadingContractorDetails) {
      return
    }

    setIsContractorDetailModalOpen(false)
    setSelectedContractor(null)
    setContractorMembers([])
    setContractorDetailError('')
  }

  async function openContractorDetails(contractorId) {
    if (!token || isLoadingContractorDetails) {
      return
    }

    setSelectedContractor(null)
    setContractorMembers([])
    setContractorDetailError('')
    setIsContractorDetailModalOpen(true)
    setIsLoadingContractorDetails(true)

    try {
      const [contractor, members] = await Promise.all([
        getContractor(token, contractorId),
        getContractorMembers(token, contractorId),
      ])

      setSelectedContractor(contractor)
      setContractorMembers(members)
    } catch (requestError) {
      setContractorDetailError(
        requestError.response?.data?.detail ||
          'Unable to load contractor details.',
      )
    } finally {
      setIsLoadingContractorDetails(false)
    }
  }

  async function loadContractorCandidates() {
    if (!token) {
      return
    }

    setIsLoadingContractorCandidates(true)
    setContractorCandidateError('')

    try {
      const data = await getContractorCandidates(token)
      setContractorCandidates(data)
    } catch (requestError) {
      setContractorCandidateError(
        requestError.response?.data?.detail ||
          'Unable to load contractor member candidates.',
      )
    } finally {
      setIsLoadingContractorCandidates(false)
    }
  }

  function resetAddContractorMemberForm() {
    setContractorCandidates([])
    setContractorCandidateError('')
    setSelectedContractorCandidate('')
    setAddContractorMemberError('')
  }

  function closeAddContractorMemberModal() {
    if (isAddingContractorMember) {
      return
    }

    setIsAddContractorMemberModalOpen(false)
    resetAddContractorMemberForm()
  }

  async function openAddContractorMemberModal() {
    if (
      !token ||
      !selectedContractor ||
      selectedContractor.status !== 'active' ||
      isAddingContractorMember
    ) {
      return
    }

    resetAddContractorMemberForm()
    setIsContractorDetailModalOpen(false)
    setIsAddContractorMemberModalOpen(true)
    await loadContractorCandidates()
  }

  async function handleAddContractorMember(event) {
    event.preventDefault()

    if (
      !token ||
      !selectedContractor ||
      selectedContractor.status !== 'active' ||
      isAddingContractorMember
    ) {
      return
    }

    if (!selectedContractorCandidate) {
      setAddContractorMemberError('Select a contractor user.')
      return
    }

    setIsAddingContractorMember(true)
    setAddContractorMemberError('')

    try {
      await addContractorMember(
        token,
        selectedContractor.id,
        selectedContractorCandidate,
      )

      const [contractor, members] = await Promise.all([
        getContractor(token, selectedContractor.id),
        getContractorMembers(token, selectedContractor.id),
      ])

      setSelectedContractor(contractor)
      setContractorMembers(members)
      setIsAddContractorMemberModalOpen(false)
      resetAddContractorMemberForm()
      setIsContractorDetailModalOpen(true)
      showToast('Contractor member added successfully.')
    } catch (requestError) {
      setAddContractorMemberError(
        requestError.response?.data?.detail ||
          'Unable to add the contractor member.',
      )
    } finally {
      setIsAddingContractorMember(false)
    }
  }

  function resetCreateForm() {
    setCreateForm({
      userId: '',
      employeeNumber: '',
      department: '',
      position: '',
      clearances: [],
    })
    setCreateError('')
    setCandidateError('')
  }

  function closeCreateModal() {
    if (isCreating) {
      return
    }

    setIsCreateModalOpen(false)
    resetCreateForm()
  }

  async function openCreateModal() {
    if (!token) {
      return
    }

    resetCreateForm()
    setIsCreateModalOpen(true)
    setIsLoadingCandidates(true)

    try {
      const data = await getEmployeeCandidates(token)
      setCandidates(data)
    } catch (requestError) {
      setCandidates([])
      setCandidateError(
        requestError.response?.data?.detail ||
          'Unable to load eligible employee users.',
      )
    } finally {
      setIsLoadingCandidates(false)
    }
  }

  function handleCreateFieldChange(field, value) {
    setCreateForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function toggleClearance(clearance) {
    setCreateForm((current) => {
      const alreadySelected = current.clearances.includes(clearance)

      return {
        ...current,
        clearances: alreadySelected
          ? current.clearances.filter((item) => item !== clearance)
          : [...current.clearances, clearance],
      }
    })
  }

  async function handleCreateEmployee(event) {
    event.preventDefault()

    if (!token || isCreating) {
      return
    }

    setIsCreating(true)
    setCreateError('')

    try {
      await createEmployee(token, {
        user_id: createForm.userId,
        employee_number: createForm.employeeNumber,
        department: createForm.department,
        position: createForm.position,
        clearances: createForm.clearances,
      })

      setIsCreateModalOpen(false)
      resetCreateForm()
      await loadEmployees()
      showToast('Employee created successfully.')
    } catch (requestError) {
      setCreateError(
        requestError.response?.data?.detail ||
          'Unable to create the employee.',
      )
    } finally {
      setIsCreating(false)
    }
  }

  function closeDetailModal() {
    if (isUpdatingClearance) {
      return
    }

    setIsDetailModalOpen(false)
    setSelectedEmployee(null)
    setEmployeeClearances([])
    setDetailError('')
    setClearanceError('')
    setClearanceForm('')
  }

  async function openEmployeeDetails(employeeId) {
    if (!token || isLoadingDetails) {
      return
    }

    setSelectedEmployee(null)
    setEmployeeClearances([])
    setDetailError('')
    setClearanceError('')
    setClearanceForm('')
    setIsDetailModalOpen(true)
    setIsLoadingDetails(true)

    try {
      const [employee, clearances] = await Promise.all([
        getEmployee(token, employeeId),
        getEmployeeClearances(token, employeeId),
      ])

      setSelectedEmployee(employee)
      setEmployeeClearances(clearances)
    } catch (requestError) {
      setDetailError(
        requestError.response?.data?.detail ||
          'Unable to load employee details.',
      )
    } finally {
      setIsLoadingDetails(false)
    }
  }

  async function reloadEmployeeClearances(employeeId) {
    if (!token) {
      return
    }

    const data = await getEmployeeClearances(token, employeeId)
    setEmployeeClearances(data)
  }

  async function handleAddClearance(event) {
    event.preventDefault()

    if (
      !token ||
      !selectedEmployee ||
      !clearanceForm.trim() ||
      isUpdatingClearance
    ) {
      return
    }

    setIsUpdatingClearance(true)
    setClearanceError('')

    try {
      await addEmployeeClearance(
        token,
        selectedEmployee.id,
        clearanceForm,
      )

      await reloadEmployeeClearances(selectedEmployee.id)
      setClearanceForm('')
      showToast('Clearance added successfully.')
    } catch (requestError) {
      setClearanceError(
        requestError.response?.data?.detail ||
          'Unable to add the clearance.',
      )
    } finally {
      setIsUpdatingClearance(false)
    }
  }

  async function handleRemoveClearance(clearance) {
    if (
      !token ||
      !selectedEmployee ||
      isUpdatingClearance
    ) {
      return
    }

    const confirmed = window.confirm(
      `Remove the "${clearance}" clearance from ${selectedEmployee.employee_number}?`,
    )

    if (!confirmed) {
      return
    }

    setIsUpdatingClearance(true)
    setClearanceError('')

    try {
      await removeEmployeeClearance(
        token,
        selectedEmployee.id,
        clearance,
      )

      await reloadEmployeeClearances(selectedEmployee.id)
      showToast('Clearance removed successfully.')
    } catch (requestError) {
      setClearanceError(
        requestError.response?.data?.detail ||
          'Unable to remove the clearance.',
      )
    } finally {
      setIsUpdatingClearance(false)
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

  useEffect(() => {
    if (!token || managementView !== 'contractors') {
      return
    }

    let cancelled = false

    async function fetchContractors() {
      setIsLoadingContractors(true)
      setContractorError('')

      try {
        const data = await getContractors(token, false)

        if (!cancelled) {
          setContractors(data)
        }
      } catch (requestError) {
        if (!cancelled) {
          setContractorError(
            requestError.response?.data?.detail ||
              'Unable to load the contractor directory.',
          )
          setContractors([])
        }
      } finally {
        if (!cancelled) {
          setIsLoadingContractors(false)
        }
      }
    }

    fetchContractors()

    return () => {
      cancelled = true
    }
  }, [token, managementView])

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

  const activeContractorCount = contractors.filter(
    (contractor) => contractor.status === 'active',
  ).length

  const inactiveContractorCount = contractors.filter(
    (contractor) => contractor.status === 'inactive',
  ).length

  const filteredContractors = useMemo(() => {
    const normalizedSearch = contractorSearch.trim().toLowerCase()

    const contractorsInView = contractors.filter((contractor) => {
      if (contractorView === 'active') {
        return contractor.status === 'active'
      }

      return contractor.status === 'inactive'
    })

    if (!normalizedSearch) {
      return contractorsInView
    }

    return contractorsInView.filter((contractor) =>
      [
        contractor.name,
        contractor.contractor_type,
        contractor.contact_email,
        contractor.contact_phone,
        contractor.status,
      ].some((value) =>
        String(value ?? '').toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [contractors, contractorSearch, contractorView])

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Operational management"
        title="Management"
        description="Manage Nestify employees, contractors, and operational relationships."
        actions={
          managementView === 'employees' ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-700 bg-sky-950/60 px-4 py-2.5 text-sm font-medium text-sky-100 transition hover:bg-sky-900/70"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </button>
          ) : null
        }
      />

      <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-2">
        <button
          type="button"
          onClick={() => setManagementView('employees')}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            managementView === 'employees'
              ? 'bg-slate-800 text-slate-50'
              : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
          }`}
        >
          Employees
        </button>

        <button
          type="button"
          onClick={() => setManagementView('contractors')}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            managementView === 'contractors'
              ? 'bg-slate-800 text-slate-50'
              : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
          }`}
        >
          Contractors
        </button>
      </div>

      {managementView === 'employees' && (
      <div className="space-y-8">
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
            <button
              key={employee.id}
              type="button"
              onClick={() => openEmployeeDetails(employee.id)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900"
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
            </button>
          ))}
        </div>
      )}

      </div>
      )}

      {managementView === 'contractors' && (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Total contractors</p>
              <p className="mt-3 text-3xl font-semibold text-slate-50">
                {contractors.length}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                Complete contractor directory
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Active</p>
              <p className="mt-3 text-3xl font-semibold text-slate-50">
                {activeContractorCount}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                Current contractor organizations
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Inactive</p>
              <p className="mt-3 text-3xl font-semibold text-slate-50">
                {inactiveContractorCount}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                Historical contractor records
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={contractorSearch}
                  onChange={(event) =>
                    setContractorSearch(event.target.value)
                  }
                  placeholder="Search contractor name, type, email, or phone"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetCreateContractorForm()
                    setIsCreateContractorModalOpen(true)
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-700 bg-sky-950/60 px-3 py-2.5 text-sm font-medium text-sky-100 transition hover:bg-sky-900/70"
                >
                  <Plus className="h-4 w-4" />
                  Add Contractor
                </button>

                <button
                  type="button"
                  onClick={() => setContractorView('active')}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    contractorView === 'active'
                      ? 'border-slate-600 bg-slate-800 text-slate-50'
                      : 'border-slate-700 bg-slate-950 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  Active
                </button>

                <button
                  type="button"
                  onClick={() => setContractorView('inactive')}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    contractorView === 'inactive'
                      ? 'border-slate-600 bg-slate-800 text-slate-50'
                      : 'border-slate-700 bg-slate-950 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  Inactive
                </button>

                <button
                  type="button"
                  onClick={loadContractors}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {isLoadingContractors && (
            <LoadingState message="Loading contractor directory..." />
          )}

          {!isLoadingContractors && contractorError && (
            <ErrorState
              message={contractorError}
              action={
                <button
                  type="button"
                  onClick={loadContractors}
                  className="mt-4 rounded-lg border border-red-700 bg-red-950/50 px-3 py-2 text-sm font-medium text-red-200"
                >
                  Retry
                </button>
              }
            />
          )}

          {!isLoadingContractors &&
            !contractorError &&
            filteredContractors.length === 0 && (
              <EmptyState
                title="No contractors found"
                description={
                  contractors.length === 0
                    ? contractorView === 'active'
                      ? 'No active contractors are currently registered.'
                      : 'No inactive contractor records are currently available.'
                    : 'Adjust the search to view more contractors.'
                }
              />
            )}

          {!isLoadingContractors &&
            !contractorError &&
            filteredContractors.length > 0 && (
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredContractors.map((contractor) => (
                  <button
                    key={contractor.id}
                    type="button"
                    onClick={() => openContractorDetails(contractor.id)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-100">
                          {contractor.name}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                          {contractor.contractor_type}
                        </p>
                      </div>

                      <StatusBadge status={contractor.status} />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                          Email
                        </p>
                        <p className="mt-2 break-all text-sm font-medium text-slate-100">
                          {contractor.contact_email || '—'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                          Phone
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-100">
                          {contractor.contact_phone || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Created{' '}
                        {new Date(
                          contractor.created_at,
                        ).toLocaleDateString()}
                      </span>
                      <span>View details</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Add Employee"
        size="lg"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-6">
          <div>
            <p className="text-sm text-slate-300">
              Create an employee record for an eligible employee user.
            </p>
          </div>

          {candidateError && (
            <ErrorState
              title="Unable to load candidates"
              message={candidateError}
            />
          )}

          <div>
            <label
              htmlFor="employee-user"
              className="text-sm font-medium text-slate-200"
            >
              Employee user
            </label>

            <select
              id="employee-user"
              value={createForm.userId}
              onChange={(event) =>
                handleCreateFieldChange('userId', event.target.value)
              }
              disabled={isLoadingCandidates || isCreating}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              required
            >
              <option value="">
                {isLoadingCandidates
                  ? 'Loading eligible users...'
                  : 'Select an employee user'}
              </option>

              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.email}
                </option>
              ))}
            </select>

            {!isLoadingCandidates &&
              !candidateError &&
              candidates.length === 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  No eligible employee users are currently available.
                </p>
              )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="employee-number"
                className="text-sm font-medium text-slate-200"
              >
                Employee number
              </label>
              <input
                id="employee-number"
                type="text"
                value={createForm.employeeNumber}
                onChange={(event) =>
                  handleCreateFieldChange(
                    'employeeNumber',
                    event.target.value,
                  )
                }
                disabled={isCreating}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="EMP-001"
                required
              />
            </div>

            <div>
              <label
                htmlFor="employee-department"
                className="text-sm font-medium text-slate-200"
              >
                Department
              </label>
              <input
                id="employee-department"
                type="text"
                value={createForm.department}
                onChange={(event) =>
                  handleCreateFieldChange('department', event.target.value)
                }
                disabled={isCreating}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Operations"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="employee-position"
              className="text-sm font-medium text-slate-200"
            >
              Position
            </label>
            <input
              id="employee-position"
              type="text"
              value={createForm.position}
              onChange={(event) =>
                handleCreateFieldChange('position', event.target.value)
              }
              disabled={isCreating}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Field Officer"
              required
            />
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-slate-200">
              Initial clearances
            </legend>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                'plate_operations',
                'property_verification',
                'installation_verification',
                'contractor_management',
              ].map((clearance) => (
                <label
                  key={clearance}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3"
                >
                  <input
                    type="checkbox"
                    checked={createForm.clearances.includes(clearance)}
                    onChange={() => toggleClearance(clearance)}
                    disabled={isCreating}
                    className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-950"
                  />
                  <span className="text-sm text-slate-300">
                    {clearance}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {createError && (
            <ErrorState
              title="Unable to create employee"
              message={createError}
            />
          )}

          <div className="flex justify-end gap-2 border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={closeCreateModal}
              disabled={isCreating}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isCreating ||
                isLoadingCandidates ||
                candidates.length === 0
              }
              className="rounded-xl border border-sky-700 bg-sky-950/60 px-4 py-2.5 text-sm font-medium text-sky-100 transition hover:bg-sky-900/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCreateContractorModalOpen}
        onClose={closeCreateContractorModal}
        title="Add Contractor"
        size="md"
      >
        <form onSubmit={handleCreateContractor} className="space-y-6">
          <div>
            <p className="text-sm text-slate-300">
              Register a contractor organization. Contractor members can be
              associated after the organization is created.
            </p>
          </div>

          <div>
            <label
              htmlFor="contractor-name"
              className="text-sm font-medium text-slate-200"
            >
              Contractor name
            </label>
            <input
              id="contractor-name"
              type="text"
              value={createContractorForm.name}
              onChange={(event) =>
                handleCreateContractorFieldChange(
                  'name',
                  event.target.value,
                )
              }
              disabled={isCreatingContractor}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Example Contractors Ltd"
              required
            />
          </div>

          <div>
            <label
              htmlFor="contractor-type"
              className="text-sm font-medium text-slate-200"
            >
              Contractor type
            </label>
            <input
              id="contractor-type"
              type="text"
              value={createContractorForm.contractorType}
              onChange={(event) =>
                handleCreateContractorFieldChange(
                  'contractorType',
                  event.target.value,
                )
              }
              disabled={isCreatingContractor}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="company"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="contractor-email"
                className="text-sm font-medium text-slate-200"
              >
                Contact email
              </label>
              <input
                id="contractor-email"
                type="email"
                value={createContractorForm.contactEmail}
                onChange={(event) =>
                  handleCreateContractorFieldChange(
                    'contactEmail',
                    event.target.value,
                  )
                }
                disabled={isCreatingContractor}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="contractor-phone"
                className="text-sm font-medium text-slate-200"
              >
                Contact phone
              </label>
              <input
                id="contractor-phone"
                type="tel"
                value={createContractorForm.contactPhone}
                onChange={(event) =>
                  handleCreateContractorFieldChange(
                    'contactPhone',
                    event.target.value,
                  )
                }
                disabled={isCreatingContractor}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="+254..."
              />
            </div>
          </div>

          {createContractorError && (
            <ErrorState
              title="Unable to create contractor"
              message={createContractorError}
            />
          )}

          <div className="flex justify-end gap-2 border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={closeCreateContractorModal}
              disabled={isCreatingContractor}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isCreatingContractor ||
                !createContractorForm.name.trim()
              }
              className="rounded-xl border border-sky-700 bg-sky-950/60 px-4 py-2.5 text-sm font-medium text-sky-100 transition hover:bg-sky-900/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingContractor ? 'Creating...' : 'Create Contractor'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAddContractorMemberModalOpen}
        onClose={closeAddContractorMemberModal}
        title="Add Contractor Member"
        size="md"
      >
        <form onSubmit={handleAddContractorMember} className="space-y-6">
          <div>
            <p className="text-sm text-slate-300">
              Associate an active contractor user with{' '}
              <span className="font-medium text-slate-100">
                {selectedContractor?.name}
              </span>
              .
            </p>
          </div>

          <div>
            <label
              htmlFor="contractor-member-user"
              className="text-sm font-medium text-slate-200"
            >
              Contractor user
            </label>

            <select
              id="contractor-member-user"
              value={selectedContractorCandidate}
              onChange={(event) =>
                setSelectedContractorCandidate(event.target.value)
              }
              disabled={
                isLoadingContractorCandidates ||
                isAddingContractorMember
              }
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              required
            >
              <option value="">
                {isLoadingContractorCandidates
                  ? 'Loading eligible users...'
                  : 'Select a contractor user'}
              </option>

              {contractorCandidates.map((candidate) => {
                const membership = contractorMembers.find(
                  (member) => member.user_id === candidate.id,
                )

                const isActiveMember = membership?.is_active === true

                return (
                  <option
                    key={candidate.id}
                    value={candidate.id}
                    disabled={isActiveMember}
                  >
                    {candidate.email}
                    {isActiveMember
                      ? ' — already an active member'
                      : membership
                        ? ' — reactivate membership'
                        : ''}
                  </option>
                )
              })}
            </select>

            {!isLoadingContractorCandidates &&
              !contractorCandidateError &&
              contractorCandidates.length === 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  No active contractor users are currently available.
                </p>
              )}
          </div>

          {contractorCandidateError && (
            <ErrorState
              title="Unable to load contractor users"
              message={contractorCandidateError}
            />
          )}

          {addContractorMemberError && (
            <ErrorState
              title="Unable to add contractor member"
              message={addContractorMemberError}
            />
          )}

          <div className="flex justify-end gap-2 border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={closeAddContractorMemberModal}
              disabled={isAddingContractorMember}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isAddingContractorMember ||
                isLoadingContractorCandidates ||
                contractorCandidates.length === 0 ||
                !selectedContractorCandidate ||
                contractorMembers.some(
                  (member) =>
                    member.user_id === selectedContractorCandidate &&
                    member.is_active,
                )
              }
              className="rounded-xl border border-sky-700 bg-sky-950/60 px-4 py-2.5 text-sm font-medium text-sky-100 transition hover:bg-sky-900/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAddingContractorMember ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isContractorDetailModalOpen}
        onClose={closeContractorDetailModal}
        title="Contractor Details"
        size="lg"
      >
        {isLoadingContractorDetails && (
          <LoadingState message="Loading contractor details..." />
        )}

        {!isLoadingContractorDetails && contractorDetailError && (
          <ErrorState
            title="Unable to load contractor"
            message={contractorDetailError}
          />
        )}

        {!isLoadingContractorDetails &&
          !contractorDetailError &&
          selectedContractor && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Contractor
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-50">
                    {selectedContractor.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {selectedContractor.contractor_type}
                  </p>
                </div>

                <StatusBadge status={selectedContractor.status} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Contractor type
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    {selectedContractor.contractor_type}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-medium capitalize text-slate-100">
                    {selectedContractor.status}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Contact email
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-100">
                    {selectedContractor.contact_email || '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Contact phone
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    {selectedContractor.contact_phone || '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Created
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    {new Date(
                      selectedContractor.created_at,
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Updated
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    {new Date(
                      selectedContractor.updated_at,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-100">
                      Members
                    </h4>
                    <p className="mt-1 text-sm text-slate-400">
                      Users associated with this contractor.
                    </p>
                  </div>

                  {selectedContractor.status === 'active' && (
                    <button
                      type="button"
                      onClick={openAddContractorMemberModal}
                      className="rounded-xl border border-sky-700 bg-sky-950/60 px-3 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-900/70"
                    >
                      Add Member
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  {contractorMembers.length === 0 && (
                    <EmptyState
                      title="No members"
                      description="This contractor currently has no recorded members."
                    />
                  )}

                  {contractorMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-100">
                          {member.user_id}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Added{' '}
                          {new Date(
                            member.created_at,
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <StatusBadge
                        status={
                          member.is_active
                            ? 'active'
                            : 'inactive'
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={closeContractorDetailModal}
                  disabled={isLoadingContractorDetails}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Close
                </button>
              </div>
            </div>
          )}
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        title="Employee Details"
        size="lg"
      >
        {isLoadingDetails && (
          <LoadingState message="Loading employee details..." />
        )}

        {!isLoadingDetails && detailError && (
          <ErrorState
            title="Unable to load employee"
            message={detailError}
          />
        )}

        {!isLoadingDetails && !detailError && selectedEmployee && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Employee
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-50">
                  {selectedEmployee.employee_number}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedEmployee.position}
                </p>
              </div>

              <StatusBadge
                status={
                  selectedEmployee.ended_at
                    ? 'terminated'
                    : 'active'
                }
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Department
                </p>
                <p className="mt-2 text-sm font-medium text-slate-100">
                  {selectedEmployee.department}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Position
                </p>
                <p className="mt-2 text-sm font-medium text-slate-100">
                  {selectedEmployee.position}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Joined
                </p>
                <p className="mt-2 text-sm font-medium text-slate-100">
                  {new Date(
                    selectedEmployee.joined_at,
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Ended
                </p>
                <p className="mt-2 text-sm font-medium text-slate-100">
                  {selectedEmployee.ended_at
                    ? new Date(
                        selectedEmployee.ended_at,
                      ).toLocaleDateString()
                    : '—'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                User ID
              </p>
              <p className="mt-2 break-all text-sm text-slate-300">
                {selectedEmployee.user_id}
              </p>
            </div>

            <div className="border-t border-slate-800 pt-6">
              <div>
                <h4 className="text-lg font-semibold text-slate-100">
                  Clearances
                </h4>
                <p className="mt-1 text-sm text-slate-400">
                  Operational access assigned to this employee.
                </p>
              </div>

              {clearanceError && (
                <div className="mt-4">
                  <ErrorState
                    title="Clearance update failed"
                    message={clearanceError}
                  />
                </div>
              )}

              <div className="mt-4 space-y-3">
                {employeeClearances.length === 0 && (
                  <EmptyState
                    title="No clearances"
                    description="This employee currently has no recorded clearances."
                  />
                )}

                {employeeClearances.map((clearance) => (
                  <div
                    key={clearance.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        {clearance.clearance}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {clearance.is_active
                          ? 'Active'
                          : 'Inactive'}
                      </p>
                    </div>

                    {clearance.is_active &&
                      !selectedEmployee.ended_at && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveClearance(
                              clearance.clearance,
                            )
                          }
                          disabled={isUpdatingClearance}
                          className="rounded-lg border border-red-800/70 bg-red-950/40 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-900/50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                  </div>
                ))}
              </div>

              {!selectedEmployee.ended_at && (
                <form
                  onSubmit={handleAddClearance}
                  className="mt-5 flex flex-col gap-3 sm:flex-row"
                >
                  <select
                    value={clearanceForm}
                    onChange={(event) =>
                      setClearanceForm(event.target.value)
                    }
                    disabled={isUpdatingClearance}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Select clearance</option>
                    {[
                      'plate_operations',
                      'property_verification',
                      'installation_verification',
                      'contractor_management',
                    ].map((clearance) => (
                      <option key={clearance} value={clearance}>
                        {clearance}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={
                      isUpdatingClearance || !clearanceForm
                    }
                    className="rounded-xl border border-sky-700 bg-sky-950/60 px-4 py-2.5 text-sm font-medium text-sky-100 transition hover:bg-sky-900/70 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdatingClearance
                      ? 'Updating...'
                      : 'Add Clearance'}
                  </button>
                </form>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-800 pt-5">
              <button
                type="button"
                onClick={closeDetailModal}
                disabled={isUpdatingClearance}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}

export default ManagementPage
