import apiClient from './client'

export async function getAccessibleProperties(token) {
  const response = await apiClient.get('/properties/accessible', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function getPropertyPortfolio(token) {
  const response = await apiClient.get('/properties/portfolio', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}
