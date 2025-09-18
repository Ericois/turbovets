# Task Management System with RBAC

A secure Task Management System built with NX monorepo, featuring role-based access control (RBAC), JWT authentication, and a modern Angular frontend with TailwindCSS.

## 🏗️ Architecture Overview

This project uses an NX monorepo structure with the following applications and libraries:

```
turbovets/
├── apps/
│   ├── api/                 # NestJS backend API
│   └── dashboard/           # Angular frontend
├── libs/
│   ├── data/               # Shared TypeScript interfaces & DTOs
│   └── auth/               # Reusable RBAC logic and decorators
└── packages/               # NX packages
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up the database and seed initial data:
```bash
cd api
npm run seed
```

3. Start the backend API:
```bash
npm run start:api
```

4. Start the frontend dashboard:
```bash
npm run start:dashboard
```

5. Open your browser and navigate to `http://localhost:4200`

## 🔐 Authentication & Authorization

### Test Accounts

The system comes with pre-configured test accounts:

- **Owner**: `owner@acme.com` / `password123`
- **Admin**: `admin@acme.com` / `password123`
- **Viewer**: `viewer@acme.com` / `password123`

### Role-Based Access Control

The system implements three roles with different permission levels:

#### Owner
- Full access to all resources
- Can create, read, update, and delete tasks
- Can manage users and organizations
- Can view audit logs

#### Admin
- Can create, read, update, and delete tasks
- Can read and update users
- Can read organization information
- Can view audit logs

#### Viewer
- Can only read tasks, users, and organization information
- Cannot modify any data

## 📊 Data Model

### Core Entities

#### User
- `id`: Unique identifier
- `email`: Login email (unique)
- `password`: Hashed password
- `firstName`, `lastName`: User details
- `organizationId`: Associated organization
- `role`: User role (Owner, Admin, Viewer)
- `isActive`: Account status

#### Organization
- `id`: Unique identifier
- `name`: Organization name
- `parentId`: Parent organization (for hierarchy)
- `level`: Hierarchy level (0 = root, 1 = sub-org)
- `isActive`: Organization status

#### Task
- `id`: Unique identifier
- `title`: Task title
- `description`: Task description
- `status`: TaskStatus (todo, in_progress, completed, cancelled)
- `priority`: TaskPriority (low, medium, high, urgent)
- `category`: Task category
- `assignedToId`: Assigned user
- `createdById`: Task creator
- `organizationId`: Associated organization
- `dueDate`: Due date
- `completedAt`: Completion timestamp

#### AuditLog
- `id`: Unique identifier
- `userId`: User who performed the action
- `action`: Action performed
- `resource`: Resource type
- `resourceId`: Resource identifier
- `details`: Additional details
- `ipAddress`, `userAgent`: Request metadata
- `createdAt`: Timestamp

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration (Owner/Admin only)
- `GET /auth/profile` - Get current user profile

### Tasks
- `GET /tasks` - List all accessible tasks
- `GET /tasks/:id` - Get specific task
- `POST /tasks` - Create new task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `GET /tasks/status/:status` - Filter by status
- `GET /tasks/category/:category` - Filter by category

### Audit
- `GET /audit/logs` - View audit logs (Owner/Admin only)

## 🎨 Frontend Features

### Task Dashboard
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Task Management**: Create, edit, delete, and view tasks
- **Filtering**: Filter by status and category
- **Role-based UI**: Different features based on user role
- **Real-time Updates**: Immediate UI updates after actions

### Authentication UI
- **Login Form**: Clean, accessible login interface
- **Role Indicators**: Visual role badges
- **Error Handling**: User-friendly error messages

## 🛡️ Security Features

### JWT Authentication
- Secure token-based authentication
- Token expiration (24 hours)
- Automatic token validation

### RBAC Implementation
- Permission-based access control
- Organization-level data isolation
- Role inheritance and hierarchy

### Data Validation
- Input validation on both frontend and backend
- SQL injection prevention with TypeORM
- XSS protection

## 🧪 Testing

### Backend Testing
```bash
npm run test:api
```

### Frontend Testing
```bash
npm run test:dashboard
```

### E2E Testing
```bash
npm run e2e:dashboard
```

## 📁 Project Structure

### Backend (NestJS)
```
api/
├── src/
│   ├── entities/           # TypeORM entities
│   ├── auth/              # Authentication module
│   ├── tasks/             # Tasks module
│   ├── audit/             # Audit logging module
│   └── main.ts            # Application entry point
└── .env                   # Environment variables
```

### Frontend (Angular)
```
dashboard/
├── src/
│   ├── app/
│   │   ├── components/    # Angular components
│   │   ├── services/      # Angular services
│   │   └── app.routes.ts  # Routing configuration
│   └── styles.css         # Global styles with TailwindCSS
```

### Shared Libraries
```
libs/
├── data/                  # Shared interfaces and DTOs
└── auth/                  # RBAC decorators and guards
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `api` directory:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_URL=sqlite:database.sqlite
PORT=3000
```

### Database Configuration

The system uses SQLite for development. For production, update the database configuration in `api/src/app.module.ts`.

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application: `npm run build:api`
3. Deploy to your preferred platform

### Frontend Deployment
1. Update API URLs in services
2. Build the application: `npm run build:dashboard`
3. Deploy to your preferred platform

## 🔮 Future Enhancements

### Advanced Features
- **Task Dependencies**: Link related tasks
- **Time Tracking**: Track time spent on tasks
- **File Attachments**: Attach files to tasks
- **Comments System**: Add comments to tasks
- **Notifications**: Real-time notifications
- **Advanced Reporting**: Analytics and reports

### Security Improvements
- **JWT Refresh Tokens**: Implement refresh token rotation
- **CSRF Protection**: Add CSRF tokens
- **Rate Limiting**: Implement API rate limiting
- **RBAC Caching**: Cache permission checks for performance

### Scalability
- **Database Optimization**: Add indexes and query optimization
- **Caching Layer**: Implement Redis caching
- **Microservices**: Split into microservices
- **Load Balancing**: Add load balancer support

