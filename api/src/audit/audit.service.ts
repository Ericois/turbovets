import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
    });

    return this.auditLogRepository.save(auditLog);
  }

  async findAll(userId?: string, limit: number = 100): Promise<AuditLog[]> {
    const query = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.user', 'user')
      .orderBy('auditLog.createdAt', 'DESC')
      .limit(limit);

    if (userId) {
      query.where('auditLog.userId = :userId', { userId });
    }

    return query.getMany();
  }
}
