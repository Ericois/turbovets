import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, Role, hasPermission } from '@turbovets/data';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Get required permissions and roles from metadata
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Check role-based access
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      return false;
    }

    // Check permission-based access
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasRequiredPermissions = requiredPermissions.every(permission =>
        hasPermission(user.role, permission)
      );
      if (!hasRequiredPermissions) {
        return false;
      }
    }

    return true;
  }
}
