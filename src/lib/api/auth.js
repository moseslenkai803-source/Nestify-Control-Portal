import apiClient from './client'

export async function login(credentials) {
  const response = await apiClient.post('/auth/login', credentials)
  return response.data
}

export async function getCurrentUser(token) {
  const response = await apiClient.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function acceptEmployeeInvitation(payload) {
  const response = await apiClient.post(
    '/auth/employee-invitations/accept',
    payload,
  )
  return response.data
}


export async function requestPasswordReset(payload) {
  const response = await apiClient.post('/auth/password-reset', payload)
  return response.data
}

export async function confirmPasswordReset(payload) {
  const response = await apiClient.post(
    '/auth/password-reset/confirm',
    payload,
  )
  return response.data
}
