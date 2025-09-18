// Data models and interfaces for the Task Management System

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer'
}

export enum Permission {
  // Task permissions
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  
  // User permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // Organization permissions
  ORG_READ = 'org:read',
  ORG_UPDATE = 'org:update',
  ORG_DELETE = 'org:delete',
  
  // Audit permissions
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

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  organization?: Organization;
}

export interface Organization {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: Organization;
  children?: Organization[];
  users?: User[];
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
  assignedTo?: User;
  createdBy: User;
  organization: Organization;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  user?: User;
}

// DTOs for API requests/responses
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  role: Role;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: Role;
  isActive?: boolean;
}

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

export interface CreateOrganizationDto {
  name: string;
  parentId?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  parentId?: string;
  isActive?: boolean;
}

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.ORG_READ,
    Permission.ORG_UPDATE,
    Permission.ORG_DELETE,
    Permission.AUDIT_READ
  ],
  [Role.ADMIN]: [
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.ORG_READ,
    Permission.AUDIT_READ
  ],
  [Role.VIEWER]: [
    Permission.TASK_READ,
    Permission.USER_READ,
    Permission.ORG_READ
  ]
};

// Utility functions
export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

export function canAccessOrganization(userOrgId: string, targetOrgId: string, userRole: Role): boolean {
  // Owners and Admins can access their organization and sub-organizations
  // Viewers can only access their own organization
  if (userRole === Role.VIEWER) {
    return userOrgId === targetOrgId;
  }
  
  // For Owner and Admin, they can access their org and sub-orgs
  // This would need to be implemented with proper organization hierarchy checking
  return userOrgId === targetOrgId;
}

export function canAccessTask(user: User, task: Task): boolean {
  // User can access tasks from their organization or sub-organizations
  return canAccessOrganization(user.organizationId, task.organizationId, user.role);
}

export function canModifyTask(user: User, task: Task): boolean {
  // Owners can modify any task
  if (user.role === Role.OWNER) {
    return true;
  }
  // Admins can modify tasks within their organization
  if (user.role === Role.ADMIN && user.organizationId === task.organizationId) {
    return true;
  }
  // Users can modify their own tasks if they are not Owners or Admins
  return user.id === task.createdById && user.organizationId === task.organizationId;
}

export function canDeleteTask(user: User, task: Task): boolean {
  // Owners can delete any task
  if (user.role === Role.OWNER) {
    return true;
  }
  // Admins can delete tasks within their organization
  if (user.role === Role.ADMIN && user.organizationId === task.organizationId) {
    return true;
  }
  return false;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  access_token: string;
  user: Omit<User, 'password'>;
}
