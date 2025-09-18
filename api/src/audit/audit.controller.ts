import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Permission, Role } from '@turbovets/data';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { RequirePermissions, RequireRoles, CurrentUser } from '@turbovets/auth';
import { User } from '../entities/user.entity';

@Controller('audit')
@UseGuards(JwtAuthGuard, RbacGuard)
@RequireRoles(Role.OWNER, Role.ADMIN)
@RequirePermissions(Permission.AUDIT_READ)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  findAll(@CurrentUser() user: User, @Query('userId') userId?: string, @Query('limit') limit?: number) {
    // Only allow users to see their own logs unless they are owners
    const targetUserId = user.role === Role.OWNER ? userId : user.id;
    return this.auditService.findAll(targetUserId, limit);
  }
}
