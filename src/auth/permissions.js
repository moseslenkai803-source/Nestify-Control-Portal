export const PERMISSIONS = {
  ADMIN: 'admin',
  PLATE_OPERATIONS: 'plate_operations',
  INSTALLATION_VERIFICATION: 'installation_verification',
  PROPERTY_VERIFICATION: 'property_verification',
  CONTRACTOR_MANAGEMENT: 'contractor_management',
}

export function hasPermission(user, requiredPermission) {
  const permissions = Array.isArray(user?.permissions)
    ? user.permissions
    : []

  return (
    permissions.includes(PERMISSIONS.ADMIN) ||
    permissions.includes(requiredPermission)
  )
}

export function hasAnyPermission(user, requiredPermissions) {
  return requiredPermissions.some((permission) =>
    hasPermission(user, permission),
  )
}
