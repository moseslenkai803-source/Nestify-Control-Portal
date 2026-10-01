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
