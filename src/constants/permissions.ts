import { User } from '../types';

export const ROLE_IDS = {
  ADMIN: "6a5dd5e32f27b365d7dc4720",
  MANAGER: "6a5dd5e32f27b365d7dc4721",
  SALES: "6a5dd5e32f27b365d7dc4722"
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "rolepermission:create",
    "rolepermission:read",
    "rolepermission:delete",
    "users:update",
    "company:create",
    "users:create",
    "users:read",
    "users:delete",
    "customers:create",
    "customers:read",
    "customers:delete",
    "customers:update",
    "users:restore",
    "users:export",
    "users:import",
    "lead:create",
    "lead:read",
    "lead:delete",
    "lead:update",
    "deal:update",
    "pipeline:update",
    "task:update",
    "company:update",
    "note:update",
    "note:create",
    "deal:create",
    "deal:read",
    "deal:delete",
    "pipeline:delete",
    "pipeline:create",
    "pipeline:read",
    "task:read",
    "task:delete",
    "task:create",
    "company:read",
    "company:delete",
    "note:delete",
    "note:read",
    "contareadct:create",
    "contact:read",
    "contact:update",
    "contact:delete",
    "activity:read",
    "dashboard:read"
  ],
  manager: [
    "customers:create",
    "customers:read",
    "customers:update",
    "lead:create",
    "lead:read",
    "lead:update",
    "deal:create",
    "deal:read",
    "deal:update",
    "pipeline:create",
    "pipeline:read",
    "pipeline:update",
    "task:create",
    "task:read",
    "task:update",
    "company:create",
    "company:read",
    "company:update",
    "note:create",
    "note:read",
    "note:update",
    "contact:create",
    "contact:read",
    "contact:update",
    "dashboard:read"
  ],
  sales: [
    "customers:create",
    "customers:read",
    "customers:update",
    "lead:create",
    "lead:read",
    "lead:update",
    "deal:create",
    "deal:read",
    "deal:update",
    "task:create",
    "task:read",
    "task:update",
    "note:create",
    "note:read",
    "note:update",
    "company:read",
    "pipeline:read",
    "contact:create",
    "contact:read"
  ]
};

export function getUserRoleKey(user: User | null): 'admin' | 'manager' | 'sales' {
  if (!user) return 'sales';

  const roleId = user.roleId || (user as any).role_id;
  if (roleId === ROLE_IDS.ADMIN) return 'admin';
  if (roleId === ROLE_IDS.MANAGER) return 'manager';
  if (roleId === ROLE_IDS.SALES) return 'sales';

  // Fallback checks by role name
  const roleStr = (user.role || '').toLowerCase();
  if (roleStr.includes('admin')) return 'admin';
  if (roleStr.includes('manager')) return 'manager';
  return 'sales';
}

export function hasPermission(user: User | null, permissionCode: string): boolean {
  if (!user) return false;

  const roleKey = getUserRoleKey(user);

  // Override if profile has explicit permissions array
  if (Array.isArray((user as any).permissions)) {
    return (user as any).permissions.includes(permissionCode);
  }

  const rolePerms = ROLE_PERMISSIONS[roleKey] || ROLE_PERMISSIONS['sales'];
  return rolePerms.includes(permissionCode);
}
