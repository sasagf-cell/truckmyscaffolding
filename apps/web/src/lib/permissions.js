
export const hasPermission = (user, subcontractorRecord, permissionName) => {
  if (!user) return false;
  // Coordinators (project owners) have full access
  if (user.role === 'Coordinator') return true;
  
  // Subcontractors need explicit permission
  if (!subcontractorRecord || !subcontractorRecord.permissions) return false;
  
  return subcontractorRecord.permissions.includes(permissionName);
};

export const canViewScaffoldRequests = (user, record) => hasPermission(user, record, 'view_scaffold_requests');
export const canCreateScaffoldRequests = (user, record) => hasPermission(user, record, 'create_scaffold_requests');
export const canApproveScaffoldRequests = (user, record) => hasPermission(user, record, 'approve_scaffold_requests');

export const canViewSiteDiary = (user, record) => hasPermission(user, record, 'view_site_diary');
export const canCreateSiteDiary = (user, record) => hasPermission(user, record, 'create_site_diary');

export const canViewMaterialDeliveries = (user, record) => hasPermission(user, record, 'view_material_deliveries');
export const canViewReports = (user, record) => hasPermission(user, record, 'view_reports');
export const canViewTeam = (user, record) => hasPermission(user, record, 'view_team');

export const canViewScaffoldLogs = (user) => {
  if (!user) return false;
  return user.role === 'Coordinator';
};

export const canViewMaterialMasterData = (user) => {
  if (!user) return false;
  return user.role === 'Coordinator';
};

export const canViewInspections = (user) => {
  if (!user) return false;
  return user.role === 'Coordinator';
};

