import apiClient from './client'

export async function getInstallationAssignments(token, status = null) {
  const response = await apiClient.get('/installation-assignments', {
    params: status ? { status } : {},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export async function createInstallationAssignment(token, payload) {
  const response = await apiClient.post(
    '/installation-assignments',
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function cancelInstallationAssignment(
  token,
  assignmentId,
  cancellationReason,
) {
  const response = await apiClient.post(
    `/installation-assignments/${assignmentId}/cancel`,
    {
      reason: cancellationReason,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}
