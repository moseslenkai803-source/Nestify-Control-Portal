import apiClient from './client'

function authConfig(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

export async function getPlatformSettings(token) {
  const response = await apiClient.get('/settings', authConfig(token))
  return response.data
}

export async function updatePlatformSettings(token, payload) {
  const response = await apiClient.patch(
    '/settings',
    payload,
    authConfig(token),
  )
  return response.data
}

export async function getPlatformSettingsAuditLogs(
  token,
  { limit = 50, offset = 0 } = {},
) {
  const response = await apiClient.get('/settings/audit-logs', {
    ...authConfig(token),
    params: { limit, offset },
  })
  return response.data
}

export async function getPlatformSettingsStatus(token) {
  const response = await apiClient.get('/settings/status', authConfig(token))
  return response.data
}
