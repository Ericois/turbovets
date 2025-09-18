# 🚀 Turbovets - Secure Task Management System

A comprehensive, enterprise-grade task management system built with **NestJS**, **Angular**, and **NX** monorepo architecture, featuring **Role-Based Access Control (RBAC)** and **hierarchical organization management**.

## ✨ Features

### 🔐 Security & Access Control
- **JWT Authentication** with secure token management
- **Role-Based Access Control (RBAC)** with hierarchical permissions
- **Organization Hierarchy** with parent-child relationships
- **Audit Logging** for all system activities
- **HTTP Interceptors** for uniform token handling

### 📋 Task Management
- **CRUD Operations** for tasks with full validation
- **Drag & Drop** interface for intuitive task management
- **Sort, Filter & Categorize** tasks by multiple criteria
- **Task Status Tracking** (Todo, In Progress, Completed, Cancelled)
- **Priority Levels** (Low, Medium, High, Urgent)
- **Due Date Management** with completion tracking

### 📊 Analytics & Visualization
- **Task Completion Charts** with Chart.js integration
- **Real-time Statistics** and progress tracking
- **Responsive Design** with mobile support

### 🎨 User Experience
- **Dark/Light Mode** toggle with persistent preferences
- **Keyboard Shortcuts** for power users
- **Responsive UI** built with TailwindCSS
- **Modern Angular** frontend with TypeScript

## 🏗️ Architecture

### **Monorepo Structure (NX Workspace)**
```
turbovets/
├── apps/
│   ├── api/                 # NestJS Backend API
│   └── dashboard/           # Angular Frontend
├── libs/
│   ├── data/               # Shared DTOs & RBAC Logic
│   └── auth/               # Reusable Auth Decorators & Guards
├── static-frontend/        # Static HTML Frontend (Alternative)
└── data/                   # Database & Seed Files
```

### **Backend (NestJS + TypeORM + SQLite)**
- **Entities**: User, Organization, Task, AuditLog
- **Services**: AuthService, TasksService, OrganizationsService
- **Guards**: JWT authentication + RBAC permission guards
- **Controllers**: RESTful API endpoints with access control

### **Frontend (Angular + TailwindCSS)**
- **Components**: Task management, authentication, dashboard
- **Services**: API integration with HTTP interceptors
- **Guards**: Route protection and authentication
- **Interceptors**: Automatic token attachment and error handling

## 🚀 Quick Start

### **Prerequisites**
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### **One-Command Setup**
```bash
# Clone the repository
git clone https://github.com/Ericois/turbovets.git
cd turbovets

# Run the setup script
./setup.sh
```

### **Manual Setup**

#### **1. Install Dependencies**
```bash
npm install --legacy-peer-deps
```

#### **2. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit configuration (optional)
nano .env
```

#### **3. Build Shared Libraries**
```bash
npx nx build data
npx nx build auth
```

#### **4. Initialize Database**
```bash
npm run seed:db
```

#### **5. Start the Application**

**Option A: Full Stack (Recommended)**
```bash
# Terminal 1: Start API server
npm run start:api

# Terminal 2: Start Angular frontend
npm run start:frontend
```

**Option B: Static Frontend (Alternative)**
```bash
# Terminal 1: Start API server
npm run start:api

# Terminal 2: Start static frontend
npm run start:static
```

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **API Server** | http://localhost:3000 | Backend REST API |
| **Angular Frontend** | http://localhost:4200 | Main Angular application |
| **Static Frontend** | http://localhost:4201 | Alternative HTML frontend |
| **Enhanced Dashboard** | http://localhost:4202 | Advanced UI with charts |

## 🔐 Default Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Owner** | owner@acme.com | password123 | Global access to all organizations |
| **Admin** | admin@acme.com | password123 | Access to their org + sub-organizations |
| **Viewer** | viewer@acme.com | password123 | Read-only access to their organization |

## 📚 API Documentation

### **Authentication Endpoints**
```http
POST /auth/login          # User login
GET  /auth/profile        # Get current user profile
```

### **Task Management Endpoints**
```http
GET    /tasks             # Get all accessible tasks
POST   /tasks             # Create new task
GET    /tasks/:id         # Get specific task
PATCH  /tasks/:id         # Update task
DELETE /tasks/:id         # Delete task
```

### **Audit Logging**
```http
GET /audit-logs           # Get audit logs (Owner/Admin only)
```

## 🛠️ Development

### **Available Scripts**
```bash
# Development
npm run start:api         # Start API server
npm run start:frontend    # Start Angular frontend
npm run start:static      # Start static frontend

# Building
npm run build:api         # Build API
npm run build:dashboard   # Build Angular frontend

# Database
npm run seed:db           # Seed database with sample data

# Testing
npm run test:api          # Run API tests
npm run test:dashboard    # Run frontend tests
npm run test:e2e          # Run end-to-end tests

# Linting
npm run lint              # Lint all code
npm run lint:fix          # Fix linting issues
```

### **Project Structure**
```
apps/
├── api/                  # NestJS Backend
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── tasks/        # Task management module
│   │   ├── organizations/ # Organization hierarchy module
│   │   ├── audit/        # Audit logging module
│   │   └── entities/     # Database entities
│   └── dist/             # Built API
├── dashboard/            # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # UI components
│   │   │   ├── services/      # API services
│   │   │   ├── interceptors/  # HTTP interceptors
│   │   │   └── guards/        # Route guards
│   │   └── assets/       # Static assets
│   └── dist/             # Built frontend
libs/
├── data/                 # Shared Data Library
│   └── src/lib/
│       └── data.ts       # DTOs, enums, RBAC functions
└── auth/                 # Shared Auth Library
    └── src/lib/
        └── auth.ts       # Decorators, guards, RBAC logic
```

## 🔒 Security Features

### **Authentication & Authorization**
- **JWT Tokens** with configurable expiration
- **HTTP Interceptors** for automatic token attachment
- **Route Guards** for protected endpoints
- **Role-based permissions** with hierarchical access

### **Organization Hierarchy**
- **Parent-child relationships** with proper validation
- **Descendant access** for admins
- **Isolated access** for viewers
- **Database-backed hierarchy** checking

### **Data Protection**
- **Input validation** with class-validator
- **SQL injection protection** via TypeORM
- **CORS configuration** for cross-origin requests
- **Audit logging** for all operations

## 🧪 Testing

### **Backend Testing**
```bash
# Run all API tests
npm run test:api

# Run specific test file
npm run test:api -- --testNamePattern="TasksService"

# Run with coverage
npm run test:api -- --coverage
```

### **Frontend Testing**
```bash
# Run Angular tests
npm run test:dashboard

# Run e2e tests
npm run test:e2e
```

## 🚀 Deployment

### **Production Environment**
1. **Update .env** with production values:
   ```bash
   NODE_ENV=production
   DB_SYNCHRONIZE=false
   JWT_SECRET=your-production-secret
   CORS_ORIGINS=https://yourdomain.com
   ```

2. **Build the application**:
   ```bash
   npm run build:api
   npm run build:dashboard
   ```

3. **Deploy** to your preferred platform (Docker, Heroku, AWS, etc.)

### **Docker Deployment** (Optional)
```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:api
EXPOSE 3000
CMD ["npm", "run", "start:api"]
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### **Common Issues**

**Node.js Version Error**
```bash
# Upgrade to Node.js 18+
nvm install 18
nvm use 18
```

**Database Connection Error**
```bash
# Check if database file exists
ls -la database.sqlite

# Recreate database
rm database.sqlite
npm run seed:db
```

**CORS Error**
```bash
# Check .env file
cat .env | grep CORS_ORIGINS

# Update CORS origins in .env
CORS_ORIGINS=http://localhost:4200,http://localhost:4201,http://localhost:4202
```

**Build Errors**
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Rebuild libraries
npx nx build data
npx nx build auth
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Ericois/turbovets/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Ericois/turbovets/discussions)
- **Email**: erict0320@gmail.com

---

**Built with ❤️ using NestJS, Angular, and NX**
