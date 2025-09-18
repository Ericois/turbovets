const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('database.sqlite');

async function addTestUsers() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Add missing users
  const users = [
    {
      id: 'user-4',
      email: 'frontend@acme.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Frontend',
      organizationId: 'org-4',
      role: 'admin',
      isActive: 1
    },
    {
      id: 'user-5',
      email: 'backend@acme.com',
      password: hashedPassword,
      firstName: 'Charlie',
      lastName: 'Backend',
      organizationId: 'org-5',
      role: 'viewer',
      isActive: 1
    }
  ];

  // Add missing organizations
  const organizations = [
    {
      id: 'org-4',
      name: 'Frontend Team',
      parentId: 'org-2',
      level: 2,
      isActive: 1
    },
    {
      id: 'org-5',
      name: 'Backend Team',
      parentId: 'org-2',
      level: 2,
      isActive: 1
    }
  ];

  // Add organizations
  for (const org of organizations) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO organizations (id, name, parentId, level, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
        [org.id, org.name, org.parentId, org.level, org.isActive],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Add users
  for (const user of users) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO users (id, email, password, firstName, lastName, organizationId, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
        [user.id, user.email, user.password, user.firstName, user.lastName, user.organizationId, user.role, user.isActive],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Add additional tasks for testing
  const tasks = [
    {
      id: 'task-4',
      title: 'Create marketing campaign',
      description: 'Design and launch new marketing campaign',
      status: 'todo',
      priority: 'medium',
      category: 'Marketing',
      createdById: 'user-3',
      organizationId: 'org-3'
    },
    {
      id: 'task-5',
      title: 'Build React components',
      description: 'Create reusable React components',
      status: 'in_progress',
      priority: 'medium',
      category: 'Frontend',
      createdById: 'user-4',
      organizationId: 'org-4'
    },
    {
      id: 'task-6',
      title: 'Optimize database queries',
      description: 'Improve database performance',
      status: 'todo',
      priority: 'low',
      category: 'Backend',
      createdById: 'user-5',
      organizationId: 'org-5'
    }
  ];

  for (const task of tasks) {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO tasks (id, title, description, status, priority, category, createdById, organizationId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
        [task.id, task.title, task.description, task.status, task.priority, task.category, task.createdById, task.organizationId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  console.log('✅ Test users and organizations added successfully!');
  db.close();
}

addTestUsers().catch(console.error);
