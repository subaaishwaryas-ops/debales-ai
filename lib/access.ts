export type Role = "admin" | "member";

export interface SessionUser {
  userId: string;
  projectId: string;
  role: Role;
}

export class AccessDeniedError extends Error {
  status = 403;
  constructor(msg = "Access denied") { super(msg); this.name = "AccessDeniedError"; }
}
export class UnauthorizedError extends Error {
  status = 401;
  constructor(msg = "Unauthorized") { super(msg); this.name = "UnauthorizedError"; }
}

export function canAccessProject(user: SessionUser, projectId: string) { return user.projectId === projectId; }
export function canViewAdminDashboard(user: SessionUser) { return user.role === "admin"; }
export function canToggleIntegrations(user: SessionUser) { return user.role === "admin"; }

export function assertProjectAccess(user: SessionUser, projectId: string) {
  if (!canAccessProject(user, projectId)) throw new AccessDeniedError("Not a member of this project");
}
export function assertAdmin(user: SessionUser) {
  if (!canViewAdminDashboard(user)) throw new AccessDeniedError("Admin only");
}
