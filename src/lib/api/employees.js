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

export async function getEmployee(token, employeeId) {
  const response = await apiClient.get(`/employees/${employeeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}
