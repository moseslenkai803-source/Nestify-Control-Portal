import apiClient from './client'

export async function getPlateInventory(token) {
  const response = await apiClient.get('/plate-inventory', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}
