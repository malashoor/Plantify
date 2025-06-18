export function useRolePermissions() {
  // Basic permissions - in a real app this would check actual user roles
  return {
    canCreateSensorRules: true,
    canEditSensorRules: true,
    canDeleteSensorRules: true,
    canViewSensorRules: true,
    isAdmin: false,
    isModerator: false,
    isUser: true,
  };
}
