import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Permission, Role, hasPermission, canAccessOrganization, canAccessTask, User, Task } from '@turbovets/data';

// Permission decorator for methods
export const RequirePermissions = (...permissions: Permission[]) => SetMetadata('permissions', permissions);

// Role decorator for methods
export const RequireRoles = (...roles: Role[]) => SetMetadata('roles', roles);

// Custom decorator to get current user from request
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Custom decorator to get organization ID from request params
export const OrganizationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.params.organizationId || request.body.organizationId;
  },
);

// RBAC Guard
export class RbacGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      return false;
    }

    // Get required permissions and roles from metadata
    const requiredPermissions = this.getPermissions(context);
    const requiredRoles = this.getRoles(context);

    // Check role-based access
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      return false;
    }

    // Check permission-based access
    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = requiredPermissions.every(permission =>
        hasPermission(user.role, permission)
      );
      if (!hasRequiredPermissions) {
        return false;
      }
    }

    return true;
  }

  private getPermissions(context: ExecutionContext): Permission[] {
    const permissions = Reflect.getMetadata('permissions', context.getHandler());
    return permissions || [];
  }

  private getRoles(context: ExecutionContext): Role[] {
    const roles = Reflect.getMetadata('roles', context.getHandler());
    return roles || [];
  }
}

// Organization access guard
export class OrganizationAccessGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const targetOrgId = request.params.organizationId || request.body.organizationId;

    if (!user || !targetOrgId) {
      return false;
    }

    return canAccessOrganization(user.organizationId, targetOrgId, user.role);
  }
}

// Task access guard
export class TaskAccessGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const task: Task = request.task; // This would be set by a previous guard or interceptor

    if (!user || !task) {
      return false;
    }

    return canAccessTask(user, task);
  }
}

// Audit logging decorator
export const AuditLog = (action: string, resource: string) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args[0]; // Assuming first argument is the request
      const user: User = request.user;
      const resourceId = request.params.id || request.body.id;

      // Log the action
      console.log(`[AUDIT] User ${user.email} performed ${action} on ${resource} ${resourceId} at ${new Date().toISOString()}`);

      // Call the original method
      return method.apply(this, args);
    };
  };
};

// Helper function to check if user can access resource
export function canUserAccessResource(user: User, resourceOrgId: string, requiredPermission: Permission): boolean {
  // Check if user has the required permission
  if (!hasPermission(user.role, requiredPermission)) {
    return false;
  }

  // Check if user can access the organization
  return canAccessOrganization(user.organizationId, resourceOrgId, user.role);
}

// Helper function to filter tasks based on user access
export function filterAccessibleTasks(user: User, tasks: Task[]): Task[] {
  return tasks.filter(task => canAccessTask(user, task));
}

// Helper function to check if user can modify task
export function canModifyTask(user: User, task: Task): boolean {
  // User must be able to access the task
  if (!canAccessTask(user, task)) {
    return false;
  }

  // User must have task update permission
  return hasPermission(user.role, Permission.TASK_UPDATE);
}

// Helper function to check if user can delete task
export function canDeleteTask(user: User, task: Task): boolean {
  // User must be able to access the task
  if (!canAccessTask(user, task)) {
    return false;
  }

  // User must have task delete permission
  return hasPermission(user.role, Permission.TASK_DELETE);
}
