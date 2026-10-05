import apiClient from './client'

export async function getPendingPropertyInstallations(token) {
  const response = await apiClient.get(
    '/properties/installations/pending-verification',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}

export async function verifyPropertyInstallation(
  token,
  propertyId,
  installationId,
  status,
  notes = null,
) {
  const response = await apiClient.post(
    `/properties/${propertyId}/installations/${installationId}/verify`,
    {
      status,
      notes,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.data
}
