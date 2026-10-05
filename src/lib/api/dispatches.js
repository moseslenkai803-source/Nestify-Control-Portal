import apiClient from './client'

export async function getDispatches(token, status = null) {
  const response = await apiClient.get('/dispatches', {
    params: status ? { status } : {},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function markDispatchReady(token, dispatchCode) {
  const response = await apiClient.post(
    `/dispatches/${dispatchCode}/ready`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function markDispatchDispatched(token, dispatchCode) {
  const response = await apiClient.post(
    `/dispatches/${dispatchCode}/dispatch`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function markDispatchDelivered(token, dispatchCode) {
  const response = await apiClient.post(
    `/dispatches/${dispatchCode}/deliver`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function cancelDispatch(token, dispatchCode) {
  const response = await apiClient.post(
    `/dispatches/${dispatchCode}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}
