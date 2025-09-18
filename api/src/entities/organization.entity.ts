import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid', { nullable: true })
  parentId: string;

  @Column({ default: 0 })
  level: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Organization, organization => organization.children)
  parent: Organization;

  @OneToMany(() => Organization, organization => organization.parent)
  children: Organization[];

  @OneToMany(() => User, user => user.organization)
  users: User[];
}
