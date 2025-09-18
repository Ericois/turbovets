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

// RBAC Guard with hardened organization scoping
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

    // Check organization scoping for resource access
    const targetOrgId = this.getTargetOrganizationId(request);
    if (targetOrgId && !canAccessOrganization(user.organizationId, targetOrgId, user.role)) {
      return false;
    }

    return true;
  }

  private getPermissions(context: ExecutionContext): Permission[] {
    const permissions = Reflector.getMetadata('permissions', context.getHandler()) ||
                      Reflector.getMetadata('permissions', context.getClass());
    return permissions || [];
  }

  private getRoles(context: ExecutionContext): Role[] {
    const roles = Reflector.getMetadata('roles', context.getHandler()) ||
                 Reflector.getMetadata('roles', context.getClass());
    return roles || [];
  }

  private getTargetOrganizationId(request: any): string | null {
    // Try to get organization ID from various sources
    return request.params?.organizationId || 
           request.body?.organizationId || 
           request.query?.organizationId || 
           null;
  }
}

// Enhanced RBAC Guard for services with database access
export class EnhancedRbacGuard {
  constructor(private organizationsService?: any) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    // Enhanced organization scoping with hierarchy checking
    const targetOrgId = this.getTargetOrganizationId(request);
    if (targetOrgId && this.organizationsService) {
      try {
        const hasAccess = await this.organizationsService.isDescendantOf(targetOrgId, user.organizationId);
        if (!hasAccess && user.role !== Role.OWNER) {
          return false;
        }
      } catch (error) {
        // If hierarchy check fails, fall back to basic equality check
        if (user.organizationId !== targetOrgId && user.role !== Role.OWNER) {
          return false;
        }
      }
    }

    return true;
  }

  private getPermissions(context: ExecutionContext): Permission[] {
    const permissions = Reflector.getMetadata('permissions', context.getHandler()) ||
                      Reflector.getMetadata('permissions', context.getClass());
    return permissions || [];
  }

  private getRoles(context: ExecutionContext): Role[] {
    const roles = Reflector.getMetadata('roles', context.getHandler()) ||
                 Reflector.getMetadata('roles', context.getClass());
    return roles || [];
  }

  private getTargetOrganizationId(request: any): string | null {
    // Try to get organization ID from various sources
    return request.params?.organizationId || 
           request.body?.organizationId || 
           request.query?.organizationId || 
           null;
  }
}

// Organization scoping decorator
export const RequireOrganizationAccess = (organizationIdParam: string = 'organizationId') => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const request = args.find(arg => arg && typeof arg === 'object' && arg.organizationId);
      const user = args.find(arg => arg && typeof arg === 'object' && arg.role);
      
      if (request && user) {
        const targetOrgId = request[organizationIdParam];
        if (targetOrgId && !canAccessOrganization(user.organizationId, targetOrgId, user.role)) {
          throw new Error('Unauthorized access to organization');
        }
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
};

// Task access decorator
export const RequireTaskAccess = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const user = args.find(arg => arg && typeof arg === 'object' && arg.role);
      const taskId = args.find(arg => typeof arg === 'string');
      
      if (user && taskId) {
        // This would need to be implemented with proper task fetching
        // For now, we'll rely on the service layer to handle this
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
};

// Import Reflector for metadata access
import { Reflector } from '@nestjs/core';
