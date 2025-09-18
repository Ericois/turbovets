// Enums
export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer'
}

export enum Permission {
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  AUDIT_READ = 'audit:read'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Role permissions mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.AUDIT_READ
  ],
  [Role.ADMIN]: [
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE
  ],
  [Role.VIEWER]: [
    Permission.TASK_READ
  ]
};

// Interfaces
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  assignedToId?: string;
  createdById: string;
  organizationId: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: string;
  newValues: string;
  userId: string;
  organizationId: string;
  timestamp: Date;
}

// DTOs
export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  assignedToId?: string;
  dueDate?: Date;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  assignedToId?: string;
  dueDate?: Date;
  completedAt?: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationDto {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDto {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  assignedToId?: string;
  createdById: string;
  organizationId: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogDto {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: string;
  newValues: string;
  userId: string;
  organizationId: string;
  timestamp: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  access_token: string;
  user: Omit<User, 'password'>;
}

// Utility functions
export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

/**
 * Hardened organization access control with hierarchical support
 * This function now properly handles organization hierarchy for different roles
 */
export function canAccessOrganization(
  userOrgId: string, 
  targetOrgId: string, 
  userRole: Role,
  accessibleOrgIds?: string[] // Optional: pre-computed accessible organization IDs
): boolean {
  // Same organization access
  if (userOrgId === targetOrgId) {
    return true;
  }

  // Role-based access control
  switch (userRole) {
    case Role.OWNER:
      // Owners can access any organization (global access)
      return true;
    
    case Role.ADMIN:
      // Admins can access their organization and all descendant organizations
      // If accessibleOrgIds is provided, use it for performance
      if (accessibleOrgIds) {
        return accessibleOrgIds.includes(targetOrgId);
      }
      // For now, return false - this should be called with proper hierarchy checking
      // In practice, this should be called from a service that has access to OrganizationsService
      return false;
    
    case Role.VIEWER:
      // Viewers can only access their own organization
      return userOrgId === targetOrgId;
    
    default:
      return false;
  }
}

/**
 * Enhanced organization access control for services with database access
 * This version should be used in services that have access to OrganizationsService
 */
export function canAccessOrganizationWithHierarchy(
  userOrgId: string,
  targetOrgId: string,
  userRole: Role,
  isDescendantOf: (descendantOrgId: string, ancestorOrgId: string) => Promise<boolean>
): Promise<boolean> {
  // Same organization access
  if (userOrgId === targetOrgId) {
    return Promise.resolve(true);
  }

  switch (userRole) {
    case Role.OWNER:
      // Owners can access any organization
      return Promise.resolve(true);
    
    case Role.ADMIN:
      // Admins can access their organization and all descendant organizations
      return isDescendantOf(targetOrgId, userOrgId);
    
    case Role.VIEWER:
      // Viewers can only access their own organization
      return Promise.resolve(userOrgId === targetOrgId);
    
    default:
      return Promise.resolve(false);
  }
}

export function canAccessTask(user: User, task: Task, accessibleOrgIds?: string[]): boolean {
  // User can access tasks from their accessible organizations
  return canAccessOrganization(user.organizationId, task.organizationId, user.role, accessibleOrgIds);
}

export function canModifyTask(user: User, task: Task, accessibleOrgIds?: string[]): boolean {
  // Owners can modify any task
  if (user.role === Role.OWNER) {
    return true;
  }
  
  // Admins can modify tasks within their accessible organizations
  if (user.role === Role.ADMIN) {
    return canAccessOrganization(user.organizationId, task.organizationId, user.role, accessibleOrgIds);
  }
  
  // Users can modify their own tasks if they have access to the organization
  return user.id === task.createdById && 
         canAccessOrganization(user.organizationId, task.organizationId, user.role, accessibleOrgIds);
}

export function canDeleteTask(user: User, task: Task, accessibleOrgIds?: string[]): boolean {
  // Owners can delete any task
  if (user.role === Role.OWNER) {
    return true;
  }
  
  // Admins can delete tasks within their accessible organizations
  if (user.role === Role.ADMIN) {
    return canAccessOrganization(user.organizationId, task.organizationId, user.role, accessibleOrgIds);
  }
  
  // Viewers cannot delete tasks
  return false;
}

/**
 * Enhanced task access control for services with database access
 */
export async function canAccessTaskWithHierarchy(
  user: User, 
  task: Task, 
  isDescendantOf: (descendantOrgId: string, ancestorOrgId: string) => Promise<boolean>
): Promise<boolean> {
  return canAccessOrganizationWithHierarchy(user.organizationId, task.organizationId, user.role, isDescendantOf);
}

export async function canModifyTaskWithHierarchy(
  user: User, 
  task: Task, 
  isDescendantOf: (descendantOrgId: string, ancestorOrgId: string) => Promise<boolean>
): Promise<boolean> {
  // Owners can modify any task
  if (user.role === Role.OWNER) {
    return true;
  }
  
  // Admins can modify tasks within their accessible organizations
  if (user.role === Role.ADMIN) {
    return canAccessOrganizationWithHierarchy(user.organizationId, task.organizationId, user.role, isDescendantOf);
  }
  
  // Users can modify their own tasks if they have access to the organization
  return user.id === task.createdById && 
         await canAccessOrganizationWithHierarchy(user.organizationId, task.organizationId, user.role, isDescendantOf);
}

export async function canDeleteTaskWithHierarchy(
  user: User, 
  task: Task, 
  isDescendantOf: (descendantOrgId: string, ancestorOrgId: string) => Promise<boolean>
): Promise<boolean> {
  // Owners can delete any task
  if (user.role === Role.OWNER) {
    return true;
  }
  
  // Admins can delete tasks within their accessible organizations
  if (user.role === Role.ADMIN) {
    return canAccessOrganizationWithHierarchy(user.organizationId, task.organizationId, user.role, isDescendantOf);
  }
  
  // Viewers cannot delete tasks
  return false;
}
