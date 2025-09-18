import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Task } from './entities/task.entity';
import { Role, TaskStatus, TaskPriority } from '@turbovets/data';

async function seed() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [User, Organization, Task],
    synchronize: true,
  });

  await dataSource.initialize();

  const orgRepo = dataSource.getRepository(Organization);
  const userRepo = dataSource.getRepository(User);
  const taskRepo = dataSource.getRepository(Task);

  // Create organization hierarchy
  const rootOrg = orgRepo.create({
    id: 'org-1',
    name: 'Acme Corporation',
    level: 0,
    isActive: true,
  });
  await orgRepo.save(rootOrg);

  const engineeringOrg = orgRepo.create({
    id: 'org-2',
    name: 'Engineering Department',
    parentId: rootOrg.id,
    level: 1,
    isActive: true,
  });
  await orgRepo.save(engineeringOrg);

  const marketingOrg = orgRepo.create({
    id: 'org-3',
    name: 'Marketing Department',
    parentId: rootOrg.id,
    level: 1,
    isActive: true,
  });
  await orgRepo.save(marketingOrg);

  const frontendTeam = orgRepo.create({
    id: 'org-4',
    name: 'Frontend Team',
    parentId: engineeringOrg.id,
    level: 2,
    isActive: true,
  });
  await orgRepo.save(frontendTeam);

  const backendTeam = orgRepo.create({
    id: 'org-5',
    name: 'Backend Team',
    parentId: engineeringOrg.id,
    level: 2,
    isActive: true,
  });
  await orgRepo.save(backendTeam);

  // Create users
  const owner = userRepo.create({
    id: 'user-1',
    email: 'owner@acme.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'John',
    lastName: 'Owner',
    organizationId: rootOrg.id,
    role: Role.OWNER,
    isActive: true,
  });
  await userRepo.save(owner);

  const admin = userRepo.create({
    id: 'user-2',
    email: 'admin@acme.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'Jane',
    lastName: 'Admin',
    organizationId: engineeringOrg.id,
    role: Role.ADMIN,
    isActive: true,
  });
  await userRepo.save(admin);

  const viewer = userRepo.create({
    id: 'user-3',
    email: 'viewer@acme.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'Bob',
    lastName: 'Viewer',
    organizationId: marketingOrg.id,
    role: Role.VIEWER,
    isActive: true,
  });
  await userRepo.save(viewer);

  const frontendDev = userRepo.create({
    id: 'user-4',
    email: 'frontend@acme.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'Alice',
    lastName: 'Frontend',
    organizationId: frontendTeam.id,
    role: Role.ADMIN,
    isActive: true,
  });
  await userRepo.save(frontendDev);

  const backendDev = userRepo.create({
    id: 'user-5',
    email: 'backend@acme.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'Charlie',
    lastName: 'Backend',
    organizationId: backendTeam.id,
    role: Role.VIEWER,
    isActive: true,
  });
  await userRepo.save(backendDev);

  // Create tasks
  const tasks = [
    {
      id: 'task-1',
      title: 'Design new dashboard',
      description: 'Create wireframes for the new dashboard',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      category: 'Design',
      createdById: owner.id,
      organizationId: rootOrg.id,
    },
    {
      id: 'task-2',
      title: 'Implement user authentication',
      description: 'Set up JWT authentication system',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      category: 'Development',
      createdById: admin.id,
      organizationId: engineeringOrg.id,
    },
    {
      id: 'task-3',
      title: 'Write API documentation',
      description: 'Document all API endpoints',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      category: 'Documentation',
      createdById: admin.id,
      organizationId: engineeringOrg.id,
    },
    {
      id: 'task-4',
      title: 'Create marketing campaign',
      description: 'Design and launch new marketing campaign',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      category: 'Marketing',
      createdById: viewer.id,
      organizationId: marketingOrg.id,
    },
    {
      id: 'task-5',
      title: 'Build React components',
      description: 'Create reusable React components',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      category: 'Frontend',
      createdById: frontendDev.id,
      organizationId: frontendTeam.id,
    },
    {
      id: 'task-6',
      title: 'Optimize database queries',
      description: 'Improve database performance',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      category: 'Backend',
      createdById: backendDev.id,
      organizationId: backendTeam.id,
    },
  ];

  for (const taskData of tasks) {
    const task = taskRepo.create(taskData);
    await taskRepo.save(task);
  }

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log(`   - ${await orgRepo.count()} organizations`);
  console.log(`   - ${await userRepo.count()} users`);
  console.log(`   - ${await taskRepo.count()} tasks`);
  console.log('');
  console.log('🔐 Test users:');
  console.log('   Owner: owner@acme.com / password123');
  console.log('   Admin: admin@acme.com / password123');
  console.log('   Viewer: viewer@acme.com / password123');
  console.log('   Frontend Admin: frontend@acme.com / password123');
  console.log('   Backend Viewer: backend@acme.com / password123');

  await dataSource.destroy();
}

seed().catch(console.error);
