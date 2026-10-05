import apiClient from './client'

export async function getAddressPlateRequests(token, status = 'pending') {
  const response = await apiClient.get('/address-plate-requests', {
    params: {
      status,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function approveAddressPlateRequest(token, requestId) {
  const response = await apiClient.post(
    `/address-plate-requests/${requestId}/approve`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function rejectAddressPlateRequest(token, requestId) {
  const response = await apiClient.post(
    `/address-plate-requests/${requestId}/reject`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}
