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

export async function getContractorCandidates(token) {
  const response = await apiClient.get('/contractors/candidates', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function createContractor(token, payload) {
  const response = await apiClient.post('/contractors', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function deactivateContractor(token, contractorId) {
  const response = await apiClient.post(
    `/contractors/${contractorId}/deactivate`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function reactivateContractor(token, contractorId) {
  const response = await apiClient.post(
    `/contractors/${contractorId}/reactivate`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function addContractorMember(
  token,
  contractorId,
  userId,
) {
  const response = await apiClient.post(
    `/contractors/${contractorId}/members`,
    { user_id: userId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function deactivateContractorMember(
  token,
  contractorId,
  userId,
) {
  const response = await apiClient.post(
    `/contractors/${contractorId}/members/${userId}/deactivate`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}
