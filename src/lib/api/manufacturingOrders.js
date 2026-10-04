import apiClient from './client'

export async function getManufacturingOrders(token, status = null) {
  const response = await apiClient.get('/manufacturing-orders', {
    params: status ? { status } : {},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function createManufacturingOrder(token, quantity) {
  const response = await apiClient.post(
    '/manufacturing-orders',
    { quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function approveManufacturingOrder(token, orderCode) {
  const response = await apiClient.post(
    `/manufacturing-orders/${orderCode}/approve`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function startManufacturingOrder(token, orderCode) {
  const response = await apiClient.post(
    `/manufacturing-orders/${orderCode}/start`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function completeManufacturingOrder(token, orderCode) {
  const response = await apiClient.post(
    `/manufacturing-orders/${orderCode}/complete`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function cancelManufacturingOrder(token, orderCode) {
  const response = await apiClient.post(
    `/manufacturing-orders/${orderCode}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}
