-- Insert organizations
INSERT INTO organizations (id, name, level, isActive, createdAt, updatedAt) VALUES 
('org-1', 'Acme Corporation', 0, 1, datetime('now'), datetime('now')),
('org-2', 'Engineering Department', 1, 1, datetime('now'), datetime('now'));

-- Insert users (password is 'password123' hashed with bcrypt)
INSERT INTO users (id, email, password, firstName, lastName, organizationId, role, isActive, createdAt, updatedAt) VALUES 
('user-1', 'owner@acme.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Owner', 'org-1', 'owner', 1, datetime('now'), datetime('now')),
('user-2', 'admin@acme.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Admin', 'org-2', 'admin', 1, datetime('now'), datetime('now')),
('user-3', 'viewer@acme.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob', 'Viewer', 'org-2', 'viewer', 1, datetime('now'), datetime('now'));

-- Insert tasks
INSERT INTO tasks (id, title, description, status, priority, category, assignedToId, createdById, organizationId, createdAt, updatedAt) VALUES 
('task-1', 'Implement user authentication', 'Set up JWT-based authentication system', 'in_progress', 'high', 'Development', 'user-2', 'user-1', 'org-2', datetime('now'), datetime('now')),
('task-2', 'Design database schema', 'Create ERD and database tables', 'completed', 'medium', 'Design', 'user-2', 'user-1', 'org-2', datetime('now'), datetime('now')),
('task-3', 'Write API documentation', 'Document all API endpoints', 'todo', 'low', 'Documentation', 'user-3', 'user-2', 'org-2', datetime('now'), datetime('now'));
