import apiClient from './client'

export async function getEmployees(token, activeOnly = false) {
  const response = await apiClient.get('/employees', {
    params: activeOnly ? { active_only: true } : {},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function getEmployeeCandidates(token) {
  const response = await apiClient.get('/employees/candidates', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function createEmployee(token, payload) {
  const response = await apiClient.post('/employees', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function getEmployee(token, employeeId) {
  const response = await apiClient.get(`/employees/${employeeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}


export async function getEmployeeClearances(
  token,
  employeeId,
  activeOnly = false,
) {
  const response = await apiClient.get(
    `/employees/${employeeId}/clearances`,
    {
      params: activeOnly ? { active_only: true } : {},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function addEmployeeClearance(
  token,
  employeeId,
  clearance,
) {
  const response = await apiClient.post(
    `/employees/${employeeId}/clearances`,
    { clearance },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function removeEmployeeClearance(
  token,
  employeeId,
  clearance,
) {
  const response = await apiClient.post(
    `/employees/${employeeId}/clearances/${encodeURIComponent(clearance)}/remove`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}
