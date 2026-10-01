import apiClient from './client'

export async function getAccessibleProperties(token) {
  const response = await apiClient.get('/properties/accessible', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}
