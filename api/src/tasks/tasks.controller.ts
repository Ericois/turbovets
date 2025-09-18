import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskStatus, Permission, Role } from '@turbovets/data';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { RequirePermissions, RequireRoles, CurrentUser } from '@turbovets/auth';
import { User } from '../entities/user.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RbacGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @RequirePermissions(Permission.TASK_CREATE)
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  @RequirePermissions(Permission.TASK_READ)
  findAll(@CurrentUser() user: User) {
    return this.tasksService.findAll(user);
  }

  @Get(':id')
  @RequirePermissions(Permission.TASK_READ)
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.findOne(id, user);
  }

  @Patch(':id')
  @RequirePermissions(Permission.TASK_UPDATE)
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(':id')
  @RequirePermissions(Permission.TASK_DELETE)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.remove(id, user);
  }
}
