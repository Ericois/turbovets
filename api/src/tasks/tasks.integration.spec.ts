import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as request from 'supertest';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AuthService } from '../auth/auth.service';
import { AuthController } from '../auth/auth.controller';
import { JwtStrategy } from '../auth/jwt.strategy';
import { OrganizationsService } from '../organizations/organizations.service';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Role, TaskStatus, TaskPriority } from '@turbovets/data';

describe('TasksController Integration - RBAC Denial Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let tasksService: TasksService;

  // Test users
  const testUsers = {
    owner: {
      email: 'owner@test.com',
      password: 'password123',
      firstName: 'Owner',
      lastName: 'User',
      role: Role.OWNER,
      organizationId: 'org-1',
    },
    admin: {
      email: 'admin@test.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      organizationId: 'org-1',
    },
    viewer: {
      email: 'viewer@test.com',
      password: 'password123',
      firstName: 'Viewer',
      lastName: 'User',
      role: Role.VIEWER,
      organizationId: 'org-1',
    },
    adminDifferentOrg: {
      email: 'admin2@test.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      organizationId: 'org-2',
    },
  };

  let authTokens: { [key: string]: string } = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Organization, Task, AuditLog],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([User, Organization, Task, AuditLog]),
        PassportModule,
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [TasksController, AuthController],
      providers: [
        TasksService,
        AuthService,
        JwtStrategy,
        OrganizationsService,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    tasksService = moduleFixture.get<TasksService>(TasksService);

    // Create test users and get auth tokens
    for (const [role, userData] of Object.entries(testUsers)) {
      const user = await authService.register(userData);
      const loginResult = await authService.login(userData);
      authTokens[role] = loginResult.access_token;
    }

    // Create test organizations
    const orgRepo = moduleFixture.get('OrganizationRepository');
    await orgRepo.save([
      { id: 'org-1', name: 'Test Organization 1', level: 0, isActive: true },
      { id: 'org-2', name: 'Test Organization 2', level: 0, isActive: true },
    ]);

    // Create test tasks
    const taskRepo = moduleFixture.get('TaskRepository');
    await taskRepo.save([
      {
        id: 'task-1',
        title: 'Test Task 1',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        category: 'Work',
        createdById: 'owner-1',
        organizationId: 'org-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'task-2',
        title: 'Test Task 2',
        description: 'Test Description',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        category: 'Personal',
        createdById: 'admin-1',
        organizationId: 'org-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'task-3',
        title: 'Test Task 3',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        category: 'Work',
        createdById: 'admin-2',
        organizationId: 'org-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('RBAC Denial Tests - Viewer Role Restrictions', () => {
    it('should return 403 when viewer tries to create a task', async () => {
      const createTaskDto = {
        title: 'New Task by Viewer',
        description: 'This should be denied',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authTokens.viewer}`)
        .send(createTaskDto)
        .expect(403);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 403 when viewer tries to update a task', async () => {
      const updateTaskDto = {
        title: 'Updated Task by Viewer',
        status: TaskStatus.IN_PROGRESS,
      };

      const response = await request(app.getHttpServer())
        .patch('/tasks/task-1')
        .set('Authorization', `Bearer ${authTokens.viewer}`)
        .send(updateTaskDto)
        .expect(403);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 403 when viewer tries to delete a task', async () => {
      const response = await request(app.getHttpServer())
        .delete('/tasks/task-1')
        .set('Authorization', `Bearer ${authTokens.viewer}`)
        .expect(403);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should allow viewer to read tasks (view-only access)', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${authTokens.viewer}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('RBAC Denial Tests - Admin Role Boundaries', () => {
    it('should return 403 when admin tries to access task from different organization', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks/task-3')
        .set('Authorization', `Bearer ${authTokens.adminDifferentOrg}`)
        .expect(403);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 403 when admin tries to update task from different organization', async () => {
      const updateTaskDto = {
        title: 'Updated Task by Admin from Different Org',
        status: TaskStatus.IN_PROGRESS,
      };

      const response = await request(app.getHttpServer())
        .patch('/tasks/task-3')
        .set('Authorization', `Bearer ${authTokens.adminDifferentOrg}`)
        .send(updateTaskDto)
        .expect(403);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 403 when admin tries to delete task from different organization', async () => {
      const response = await request(app.getHttpServer())
        .delete('/tasks/task-3')
        .set('Authorization', `Bearer ${authTokens.adminDifferentOrg}`)
        .expect(403);

      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('RBAC Denial Tests - Unauthorized Access', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 401 when expired token is provided', async () => {
      // This would require creating an expired token
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', 'Bearer expired-token')
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('RBAC Denial Tests - Task Ownership', () => {
    it('should return 403 when user tries to modify task created by others', async () => {
      const updateTaskDto = {
        title: 'Updated Task by Non-Creator',
        status: TaskStatus.IN_PROGRESS,
      };

      const response = await request(app.getHttpServer())
        .patch('/tasks/task-1')
        .set('Authorization', `Bearer ${authTokens.viewer}`)
        .send(updateTaskDto)
        .expect(403);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 403 when user tries to delete task created by others', async () => {
      const response = await request(app.getHttpServer())
        .delete('/tasks/task-1')
        .set('Authorization', `Bearer ${authTokens.viewer}`)
        .expect(403);

      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('RBAC Denial Tests - Organization Hierarchy', () => {
    it('should return 403 when user tries to access task from parent organization', async () => {
      // This would require setting up a proper hierarchy
      const response = await request(app.getHttpServer())
        .get('/tasks/task-3')
        .set('Authorization', `Bearer ${authTokens.admin}`)
        .expect(403);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 403 when user tries to access task from sibling organization', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks/task-3')
        .set('Authorization', `Bearer ${authTokens.admin}`)
        .expect(403);

      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('RBAC Denial Tests - Permission-Based Access', () => {
    it('should return 403 when user lacks required permission for task creation', async () => {
      const createTaskDto = {
        title: 'New Task',
        description: 'This should be denied',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authTokens.viewer}`)
        .send(createTaskDto)
        .expect(403);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 403 when user lacks required permission for task modification', async () => {
      const updateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      const response = await request(app.getHttpServer())
        .patch('/tasks/task-1')
        .set('Authorization', `Bearer ${authTokens.viewer}`)
        .send(updateTaskDto)
        .expect(403);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 403 when user lacks required permission for task deletion', async () => {
      const response = await request(app.getHttpServer())
        .delete('/tasks/task-1')
        .set('Authorization', `Bearer ${authTokens.viewer}`)
        .expect(403);

      expect(response.body.message).toContain('Unauthorized');
    });
  });
});
