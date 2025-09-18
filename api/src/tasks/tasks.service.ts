import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority, canAccessTaskWithHierarchy, canModifyTaskWithHierarchy, canDeleteTaskWithHierarchy } from '@turbovets/data';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private organizationsService: OrganizationsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
      createdById: user.id,
      organizationId: user.organizationId,
      status: createTaskDto.status || TaskStatus.TODO,
      priority: createTaskDto.priority || TaskPriority.MEDIUM,
    });

    return this.taskRepository.save(task);
  }

  async findAll(user: User): Promise<Task[]> {
    // Get all accessible organizations for the user
    const accessibleOrgIds = await this.getAccessibleOrganizationIds(user);
    
    const tasks = await this.taskRepository.find({
      where: { organizationId: { $in: accessibleOrgIds } } as any, // TypeORM syntax may vary
      relations: ['assignedTo', 'createdBy', 'organization'],
    });
    
    // Filter tasks using hardened organization scoping
    const filteredTasks = [];
    for (const task of tasks) {
      if (await canAccessTaskWithHierarchy(user, task, this.organizationsService.isDescendantOf.bind(this.organizationsService))) {
        filteredTasks.push(task);
      }
    }
    
    return filteredTasks;
  }

  async findOne(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy', 'organization'],
    });
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }
    
    if (!(await canAccessTaskWithHierarchy(user, task, this.organizationsService.isDescendantOf.bind(this.organizationsService)))) {
      throw new UnauthorizedException('Unauthorized access to this task.');
    }
    
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({ 
      where: { id },
      relations: ['assignedTo', 'createdBy', 'organization']
    });
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }
    
    if (!(await canModifyTaskWithHierarchy(user, task, this.organizationsService.isDescendantOf.bind(this.organizationsService)))) {
      throw new UnauthorizedException('Unauthorized to modify this task.');
    }

    // Update completedAt if status is being changed to completed
    if (updateTaskDto.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      updateTaskDto.completedAt = new Date();
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string, user: User): Promise<void> {
    const task = await this.taskRepository.findOne({ 
      where: { id },
      relations: ['assignedTo', 'createdBy', 'organization']
    });
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }
    
    if (!(await canDeleteTaskWithHierarchy(user, task, this.organizationsService.isDescendantOf.bind(this.organizationsService)))) {
      throw new UnauthorizedException('Unauthorized to delete this task.');
    }

    await this.taskRepository.remove(task);
  }

  /**
   * Get all organization IDs that the user can access based on their role and hierarchy
   */
  private async getAccessibleOrganizationIds(user: User): Promise<string[]> {
    switch (user.role) {
      case 'owner':
        // Owners can access all organizations
        return await this.getAllOrganizationIds();
      
      case 'admin':
        // Admins can access their organization and all descendant organizations
        return await this.organizationsService.getDescendantOrganizations(user.organizationId);
      
      case 'viewer':
        // Viewers can only access their own organization
        return [user.organizationId];
      
      default:
        return [user.organizationId];
    }
  }

  /**
   * Get all organization IDs in the system
   */
  private async getAllOrganizationIds(): Promise<string[]> {
    const organizations = await this.organizationsService['organizationsRepository'].find({
      where: { isActive: true },
      select: ['id']
    });
    return organizations.map(org => org.id);
  }
}
