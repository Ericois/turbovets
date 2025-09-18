const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');

// Simple entity definitions for seeding
const User = {
  name: 'users',
  columns: {
    id: { type: 'varchar', primary: true, generated: 'uuid' },
    email: { type: 'varchar', unique: true },
    password: { type: 'varchar' },
    firstName: { type: 'varchar' },
    lastName: { type: 'varchar' },
    organizationId: { type: 'varchar' },
    role: { type: 'varchar', default: 'viewer' },
    isActive: { type: 'boolean', default: true },
    createdAt: { type: 'datetime', default: () => 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }
  }
};

const Organization = {
  name: 'organizations',
  columns: {
    id: { type: 'varchar', primary: true, generated: 'uuid' },
    name: { type: 'varchar' },
    parentId: { type: 'varchar', nullable: true },
    level: { type: 'int', default: 0 },
    isActive: { type: 'boolean', default: true },
    createdAt: { type: 'datetime', default: () => 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }
  }
};

const Task = {
  name: 'tasks',
  columns: {
    id: { type: 'varchar', primary: true, generated: 'uuid' },
    title: { type: 'varchar' },
    description: { type: 'text', nullable: true },
    status: { type: 'varchar', default: 'todo' },
    priority: { type: 'varchar', default: 'medium' },
    category: { type: 'varchar' },
    assignedToId: { type: 'varchar', nullable: true },
    createdById: { type: 'varchar' },
    organizationId: { type: 'varchar' },
    dueDate: { type: 'datetime', nullable: true },
    completedAt: { type: 'datetime', nullable: true },
    createdAt: { type: 'datetime', default: () => 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }
  }
};

const AuditLog = {
  name: 'audit_logs',
  columns: {
    id: { type: 'varchar', primary: true, generated: 'uuid' },
    userId: { type: 'varchar' },
    action: { type: 'varchar' },
    resource: { type: 'varchar' },
    resourceId: { type: 'varchar' },
    details: { type: 'text', nullable: true },
    ipAddress: { type: 'varchar', nullable: true },
    userAgent: { type: 'varchar', nullable: true },
    createdAt: { type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }
  }
};

async function seed() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [User, Organization, Task, AuditLog],
    synchronize: true,
  });

  await dataSource.initialize();

  const orgRepo = dataSource.getRepository(Organization);
  const userRepo = dataSource.getRepository(User);
  const taskRepo = dataSource.getRepository(Task);

  // Create organizations
  const rootOrg = orgRepo.create({
    id: 'org-1',
    name: 'Acme Corporation',
    level: 0,
  });
  await orgRepo.save(rootOrg);

  const subOrg = orgRepo.create({
    id: 'org-2',
    name: 'Engineering Department',
    parentId: rootOrg.id,
    level: 1,
  });
  await orgRepo.save(subOrg);

  // Create users
  const owner = userRepo.create({
    id: 'user-1',
    email: 'owner@acme.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'John',
    lastName: 'Owner',
    organizationId: rootOrg.id,
    role: 'owner',
  });
  await userRepo.save(owner);

  const admin = userRepo.create({
    id: 'user-2',
    email: 'admin@acme.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'Jane',
    lastName: 'Admin',
    organizationId: subOrg.id,
    role: 'admin',
  });
  await userRepo.save(admin);

  const viewer = userRepo.create({
    id: 'user-3',
    email: 'viewer@acme.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'Bob',
    lastName: 'Viewer',
    organizationId: subOrg.id,
    role: 'viewer',
  });
  await userRepo.save(viewer);

  // Create tasks
  const tasks = [
    {
      id: 'task-1',
      title: 'Implement user authentication',
      description: 'Set up JWT-based authentication system',
      status: 'in_progress',
      priority: 'high',
      category: 'Development',
      assignedToId: admin.id,
      createdById: owner.id,
      organizationId: subOrg.id,
    },
    {
      id: 'task-2',
      title: 'Design database schema',
      description: 'Create ERD and database tables',
      status: 'completed',
      priority: 'medium',
      category: 'Design',
      assignedToId: admin.id,
      createdById: owner.id,
      organizationId: subOrg.id,
      completedAt: new Date(),
    },
    {
      id: 'task-3',
      title: 'Write API documentation',
      description: 'Document all API endpoints',
      status: 'todo',
      priority: 'low',
      category: 'Documentation',
      assignedToId: viewer.id,
      createdById: admin.id,
      organizationId: subOrg.id,
    },
  ];

  for (const taskData of tasks) {
    const task = taskRepo.create(taskData);
    await taskRepo.save(task);
  }

  console.log('✅ Database seeded successfully!');
  console.log('📧 Test accounts:');
  console.log('   Owner: owner@acme.com / password123');
  console.log('   Admin: admin@acme.com / password123');
  console.log('   Viewer: viewer@acme.com / password123');

  await dataSource.destroy();
}

seed().catch(console.error);
