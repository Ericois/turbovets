const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');

// Import entities
const { User } = require('./dist/entities/user.entity.js');
const { Organization } = require('./dist/entities/organization.entity.js');
const { Task } = require('./dist/entities/task.entity.js');

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

  // Create organizations
  const rootOrg = orgRepo.create({
    name: 'Acme Corporation',
    level: 0,
  });
  await orgRepo.save(rootOrg);

  const subOrg = orgRepo.create({
    name: 'Engineering Department',
    parentId: rootOrg.id,
    level: 1,
  });
  await orgRepo.save(subOrg);

  // Create users
  const owner = userRepo.create({
    email: 'owner@acme.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'John',
    lastName: 'Owner',
    organizationId: rootOrg.id,
    role: 'owner',
  });
  await userRepo.save(owner);

  const admin = userRepo.create({
    email: 'admin@acme.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'Jane',
    lastName: 'Admin',
    organizationId: subOrg.id,
    role: 'admin',
  });
  await userRepo.save(admin);

  const viewer = userRepo.create({
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
