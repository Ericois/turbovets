# Manual API Endpoint Testing Guide

## Base URL
```
http://localhost:3000
```

## 1. Authentication Endpoints

### Login (POST /auth/login)
```bash
# Owner login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@acme.com","password":"password123"}'

# Admin login  
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"password123"}'

# Viewer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@acme.com","password":"password123"}'
```

## 2. Task Endpoints

### Get All Tasks (GET /tasks)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/tasks
```

### Create Task (POST /tasks)
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "New Task",
    "description": "Task description",
    "priority": "high",
    "category": "development"
  }'
```

### Get Specific Task (GET /tasks/:id)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/tasks/TASK_ID
```

### Update Task (PATCH /tasks/:id)
```bash
curl -X PATCH http://localhost:3000/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated Task Title",
    "status": "in_progress"
  }'
```

### Delete Task (DELETE /tasks/:id)
```bash
curl -X DELETE http://localhost:3000/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 3. Audit Endpoints

### Get Audit Logs (GET /audit/logs)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/audit/logs
```

## 4. Test Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Owner | owner@acme.com | password123 | Full access to all tasks and operations |
| Admin | admin@acme.com | password123 | Can manage tasks in their organization |
| Viewer | viewer@acme.com | password123 | Read-only access to tasks in their organization |

## 5. Role-Based Access Control Tests

### Test Owner Permissions
- ✅ Can create, read, update, delete any task
- ✅ Can access all organizations' tasks
- ✅ Can view audit logs

### Test Admin Permissions  
- ✅ Can create, read, update, delete tasks in their organization
- ❌ Cannot access tasks from other organizations
- ✅ Can view audit logs

### Test Viewer Permissions
- ✅ Can read tasks in their organization
- ❌ Cannot create, update, or delete tasks
- ❌ Cannot access tasks from other organizations
- ✅ Can view their own audit logs

## 6. Error Handling Tests

### Invalid Credentials
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@example.com","password":"wrong"}'
# Expected: 401 Unauthorized
```

### Missing Token
```bash
curl http://localhost:3000/tasks
# Expected: 401 Unauthorized
```

### Invalid Task ID
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/tasks/invalid-id
# Expected: 404 Not Found
```

### Unauthorized Operation
```bash
# Try to create task as viewer
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VIEWER_TOKEN" \
  -d '{"title":"Test"}'
# Expected: 403 Forbidden
```

## 7. Response Examples

### Successful Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-1",
    "email": "owner@acme.com",
    "firstName": "John",
    "lastName": "Owner",
    "role": "owner",
    "organizationId": "org-1"
  }
}
```

### Task Response
```json
{
  "id": "task-123",
  "title": "Task Title",
  "description": "Task description",
  "status": "todo",
  "priority": "high",
  "category": "development",
  "createdById": "user-1",
  "organizationId": "org-1",
  "createdAt": "2025-09-17T07:00:00.000Z",
  "updatedAt": "2025-09-17T07:00:00.000Z"
}
```

## 8. Testing with Frontend

You can also test all these endpoints through the frontend at:
```
http://localhost:4201
```

The frontend provides a user-friendly interface to test all the API functionality with different user roles.
