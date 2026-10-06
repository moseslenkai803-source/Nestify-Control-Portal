import apiClient from './client'

export async function getContractors(token, activeOnly = false) {
  const response = await apiClient.get('/contractors', {
    params: activeOnly ? { active_only: true } : {},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function getContractor(token, contractorId) {
  const response = await apiClient.get(`/contractors/${contractorId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function getContractorMembers(token, contractorId) {
  const response = await apiClient.get(
    `/contractors/${contractorId}/members`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}
