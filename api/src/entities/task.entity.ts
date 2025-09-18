import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { TaskStatus, TaskPriority } from '@turbovets/data';

@Entity('tasks')
export class Task {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'varchar', default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ type: 'varchar', default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  assignedToId: string;

  @Column()
  createdById: string;

  @Column()
  organizationId: string;

  @Column({ type: 'datetime', nullable: true })
  dueDate: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.assignedTasks)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @ManyToOne(() => User, (user) => user.createdTasks)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}
