import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '@turbovets/data';
import { Organization } from './organization.entity';
import { Task } from './task.entity';
import { AuditLog } from './audit-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column('uuid')
  organizationId: string;

  @Column({
    type: 'varchar',
    default: Role.VIEWER
  })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Organization, organization => organization.users)
  organization: Organization;

  @OneToMany(() => Task, task => task.createdBy)
  createdTasks: Task[];

  @OneToMany(() => Task, task => task.assignedTo)
  assignedTasks: Task[];

  @OneToMany(() => AuditLog, auditLog => auditLog.user)
  auditLogs: AuditLog[];
}
