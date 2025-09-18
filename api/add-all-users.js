const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('database.sqlite');

async function addAllUsers() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Add all organizations
  const organizations = [
    {
      id: 'org-1',
      name: 'Acme Corporation',
      parentId: null,
      level: 0,
      isActive: 1
    },
    {
      id: 'org-2',
      name: 'Engineering Department',
      parentId: 'org-1',
      level: 1,
      isActive: 1
    },
    {
      id: 'org-3',
      name: 'Marketing Department',
      parentId: 'org-1',
      level: 1,
      isActive: 1
    },
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

  // Add all users
  const users = [
    {
      id: 'user-1',
      email: 'owner@acme.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Owner',
      organizationId: 'org-1',
      role: 'owner',
      isActive: 1
    },
    {
      id: 'user-2',
      email: 'admin@acme.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Admin',
      organizationId: 'org-2',
      role: 'admin',
      isActive: 1
    },
    {
      id: 'user-3',
      email: 'viewer@acme.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Viewer',
      organizationId: 'org-3',
      role: 'viewer',
      isActive: 1
    },
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

  // Add tasks
  const tasks = [
    {
      id: 'task-1',
      title: 'Design new dashboard',
      description: 'Create wireframes for the new dashboard',
      status: 'todo',
      priority: 'high',
      category: 'Design',
      createdById: 'user-1',
      organizationId: 'org-1'
    },
    {
      id: 'task-2',
      title: 'Implement user authentication',
      description: 'Set up JWT authentication system',
      status: 'in_progress',
      priority: 'high',
      category: 'Development',
      createdById: 'user-2',
      organizationId: 'org-2'
    },
    {
      id: 'task-3',
      title: 'Write API documentation',
      description: 'Document all API endpoints',
      status: 'todo',
      priority: 'low',
      category: 'Documentation',
      createdById: 'user-2',
      organizationId: 'org-2'
    },
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

  console.log('✅ All users, organizations, and tasks added successfully!');
  db.close();
}

addAllUsers().catch(console.error);
