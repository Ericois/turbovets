import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Role, TaskStatus, TaskPriority } from '@turbovets/data';
import { OrganizationsService } from '../organizations/organizations.service';

describe('TasksController - RBAC Denial Tests', () => {
  let controller: TasksController;
  let tasksService: TasksService;
  let authService: AuthService;

  // Mock users with different roles
  const mockOwner: User = {
    id: 'owner-1',
    email: 'owner@acme.com',
    password: 'hashed-password',
    firstName: 'Owner',
    lastName: 'User',
    role: Role.OWNER,
    organizationId: 'org-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdmin: User = {
    id: 'admin-1',
    email: 'admin@acme.com',
    password: 'hashed-password',
    firstName: 'Admin',
    lastName: 'User',
    role: Role.ADMIN,
    organizationId: 'org-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockViewer: User = {
    id: 'viewer-1',
    email: 'viewer@acme.com',
    password: 'hashed-password',
    firstName: 'Viewer',
    lastName: 'User',
    role: Role.VIEWER,
    organizationId: 'org-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    category: 'Work',
    assignedToId: 'user-1',
    createdById: 'owner-1',
    organizationId: 'org-1',
    dueDate: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  const mockOrganizationsService = {
    getDescendantOrganizations: jest.fn(),
    isDescendantOf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: OrganizationsService,
          useValue: mockOrganizationsService,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('RBAC Denial Tests - Viewer Role Restrictions', () => {
    it('should deny viewer from creating tasks', async () => {
      // Arrange
      const createTaskDto = {
        title: 'New Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
      };

      // Act & Assert
      await expect(
        controller.create(createTaskDto, mockViewer)
      ).rejects.toThrow('Unauthorized to create tasks');
    });

    it('should deny viewer from updating tasks', async () => {
      // Arrange
      const updateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      // Act & Assert
      await expect(
        controller.update('task-1', updateTaskDto, mockViewer)
      ).rejects.toThrow('Unauthorized to modify tasks');
    });

    it('should deny viewer from deleting tasks', async () => {
      // Act & Assert
      await expect(
        controller.remove('task-1', mockViewer)
      ).rejects.toThrow('Unauthorized to delete tasks');
    });

    it('should allow viewer to read tasks (view-only access)', async () => {
      // Arrange
      mockTasksService.findAll.mockResolvedValue([mockTask]);

      // Act
      const result = await controller.findAll(mockViewer);

      // Assert
      expect(result).toEqual([mockTask]);
      expect(mockTasksService.findAll).toHaveBeenCalledWith(mockViewer);
    });
  });

  describe('RBAC Denial Tests - Admin Role Boundaries', () => {
    it('should deny admin from accessing tasks from different organization', async () => {
      // Arrange
      const adminFromDifferentOrg = {
        ...mockAdmin,
        organizationId: 'org-2', // Different organization
      };

      const taskFromDifferentOrg = {
        ...mockTask,
        organizationId: 'org-3', // Different organization
      };

      mockTasksService.findOne.mockResolvedValue(taskFromDifferentOrg);
      mockOrganizationsService.isDescendantOf.mockResolvedValue(false);

      // Act & Assert
      await expect(
        controller.findOne('task-1', adminFromDifferentOrg)
      ).rejects.toThrow('Unauthorized access to this task');
    });

    it('should deny admin from modifying tasks from different organization', async () => {
      // Arrange
      const adminFromDifferentOrg = {
        ...mockAdmin,
        organizationId: 'org-2',
      };

      const taskFromDifferentOrg = {
        ...mockTask,
        organizationId: 'org-3',
      };

      const updateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      mockTasksService.findOne.mockResolvedValue(taskFromDifferentOrg);
      mockOrganizationsService.isDescendantOf.mockResolvedValue(false);

      // Act & Assert
      await expect(
        controller.update('task-1', updateTaskDto, adminFromDifferentOrg)
      ).rejects.toThrow('Unauthorized to modify this task');
    });

    it('should deny admin from deleting tasks from different organization', async () => {
      // Arrange
      const adminFromDifferentOrg = {
        ...mockAdmin,
        organizationId: 'org-2',
      };

      const taskFromDifferentOrg = {
        ...mockTask,
        organizationId: 'org-3',
      };

      mockTasksService.findOne.mockResolvedValue(taskFromDifferentOrg);
      mockOrganizationsService.isDescendantOf.mockResolvedValue(false);

      // Act & Assert
      await expect(
        controller.remove('task-1', adminFromDifferentOrg)
      ).rejects.toThrow('Unauthorized to delete this task');
    });
  });

  describe('RBAC Denial Tests - Unauthorized Access', () => {
    it('should deny access when user is null', async () => {
      // Act & Assert
      await expect(
        controller.findAll(null as any)
      ).rejects.toThrow('User not authenticated');
    });

    it('should deny access when user is undefined', async () => {
      // Act & Assert
      await expect(
        controller.findAll(undefined as any)
      ).rejects.toThrow('User not authenticated');
    });

    it('should deny access when user has invalid role', async () => {
      // Arrange
      const invalidUser = {
        ...mockViewer,
        role: 'invalid-role' as any,
      };

      // Act & Assert
      await expect(
        controller.create({ title: 'Test' }, invalidUser)
      ).rejects.toThrow('Invalid user role');
    });
  });

  describe('RBAC Denial Tests - Task Ownership', () => {
    it('should deny regular user from modifying tasks created by others', async () => {
      // Arrange
      const regularUser = {
        ...mockViewer,
        id: 'user-2', // Different from task creator
      };

      const taskCreatedByOthers = {
        ...mockTask,
        createdById: 'owner-1', // Created by someone else
      };

      const updateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      mockTasksService.findOne.mockResolvedValue(taskCreatedByOthers);

      // Act & Assert
      await expect(
        controller.update('task-1', updateTaskDto, regularUser)
      ).rejects.toThrow('Unauthorized to modify this task');
    });

    it('should deny regular user from deleting tasks created by others', async () => {
      // Arrange
      const regularUser = {
        ...mockViewer,
        id: 'user-2', // Different from task creator
      };

      const taskCreatedByOthers = {
        ...mockTask,
        createdById: 'owner-1', // Created by someone else
      };

      mockTasksService.findOne.mockResolvedValue(taskCreatedByOthers);

      // Act & Assert
      await expect(
        controller.remove('task-1', regularUser)
      ).rejects.toThrow('Unauthorized to delete this task');
    });
  });

  describe('RBAC Denial Tests - Organization Hierarchy', () => {
    it('should deny access to tasks from parent organization when user is in child org', async () => {
      // Arrange
      const childOrgUser = {
        ...mockAdmin,
        organizationId: 'org-child', // Child organization
      };

      const parentOrgTask = {
        ...mockTask,
        organizationId: 'org-parent', // Parent organization
      };

      mockTasksService.findOne.mockResolvedValue(parentOrgTask);
      mockOrganizationsService.isDescendantOf.mockResolvedValue(false);

      // Act & Assert
      await expect(
        controller.findOne('task-1', childOrgUser)
      ).rejects.toThrow('Unauthorized access to this task');
    });

    it('should deny access to tasks from sibling organization', async () => {
      // Arrange
      const siblingOrgUser = {
        ...mockAdmin,
        organizationId: 'org-sibling-1',
      };

      const siblingOrgTask = {
        ...mockTask,
        organizationId: 'org-sibling-2', // Different sibling org
      };

      mockTasksService.findOne.mockResolvedValue(siblingOrgTask);
      mockOrganizationsService.isDescendantOf.mockResolvedValue(false);

      // Act & Assert
      await expect(
        controller.findOne('task-1', siblingOrgUser)
      ).rejects.toThrow('Unauthorized access to this task');
    });
  });
});
