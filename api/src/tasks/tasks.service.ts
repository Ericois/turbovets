import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority, canAccessTask, canModifyTask, canDeleteTask } from '@turbovets/data';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
    const tasks = await this.taskRepository.find({
      relations: ['assignedTo', 'createdBy', 'organization'],
    });
    return tasks.filter(task => canAccessTask(user, task));
  }

  async findOne(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy', 'organization'],
    });
    if (!task || !canAccessTask(user, task)) {
      throw new NotFoundException(`Task with ID ${id} not found or unauthorized access.`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }
    if (!canModifyTask(user, task)) {
      throw new UnauthorizedException('You do not have permission to modify this task.');
    }

    // Update completedAt if status is being changed to completed
    if (updateTaskDto.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      updateTaskDto.completedAt = new Date();
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string, user: User): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }
    if (!canDeleteTask(user, task)) {
      throw new UnauthorizedException('You do not have permission to delete this task.');
    }
    await this.taskRepository.remove(task);
  }
}
