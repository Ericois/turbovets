import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../services/tasks.service';
import { AuthService } from '../services/auth.service';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority, Role } from '@turbovets/data';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div class="flex items-center">
              <h1 class="text-3xl font-bold text-gray-900">Task Dashboard</h1>
              <span class="ml-4 px-3 py-1 text-sm font-medium rounded-full"
                    [class]="getRoleBadgeClass()">
                {{ getCurrentUser()?.role | titlecase }}
              </span>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-700">
                Welcome, {{ getCurrentUser()?.firstName }} {{ getCurrentUser()?.lastName }}
              </span>
              <button
                (click)="logout()"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Create Task Button -->
        <div class="mb-6" *ngIf="canCreateTask()">
          <button
            (click)="showCreateForm = !showCreateForm"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {{ showCreateForm ? 'Cancel' : 'Create New Task' }}
          </button>
        </div>

        <!-- Create Task Form -->
        <div *ngIf="showCreateForm && canCreateTask()" class="mb-6 bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
          <form (ngSubmit)="createTask()" #taskForm="ngForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  [(ngModel)]="newTask.title"
                  name="title"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  [(ngModel)]="newTask.category"
                  name="category"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  [(ngModel)]="newTask.priority"
                  name="priority"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  [(ngModel)]="newTask.dueDate"
                  name="dueDate"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                [(ngModel)]="newTask.description"
                name="description"
                rows="3"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              ></textarea>
            </div>
            <div class="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                (click)="showCreateForm = false"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="taskForm.invalid || isCreating"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {{ isCreating ? 'Creating...' : 'Create Task' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Filters -->
        <div class="mb-6 bg-white p-4 rounded-lg shadow">
          <div class="flex flex-wrap gap-4">
            <select
              [(ngModel)]="selectedStatus"
              (change)="filterTasks()"
              class="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              [(ngModel)]="selectedCategory"
              (change)="filterTasks()"
              class="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
            </select>
          </div>
        </div>

        <!-- Tasks Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            *ngFor="let task of filteredTasks"
            class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-medium text-gray-900">{{ task.title }}</h3>
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                [class]="getStatusBadgeClass(task.status)"
              >
                {{ task.status | titlecase }}
              </span>
            </div>
            
            <p class="text-sm text-gray-600 mb-4" *ngIf="task.description">
              {{ task.description }}
            </p>
            
            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Priority:</span>
                <span
                  class="font-medium"
                  [class]="getPriorityClass(task.priority)"
                >
                  {{ task.priority | titlecase }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Category:</span>
                <span class="font-medium">{{ task.category }}</span>
              </div>
              <div class="flex justify-between text-sm" *ngIf="task.assignedTo">
                <span class="text-gray-500">Assigned to:</span>
                <span class="font-medium">{{ task.assignedTo.firstName }} {{ task.assignedTo.lastName }}</span>
              </div>
              <div class="flex justify-between text-sm" *ngIf="task.dueDate">
                <span class="text-gray-500">Due:</span>
                <span class="font-medium">{{ task.dueDate | date:'short' }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-2" *ngIf="canModifyTask(task)">
              <button
                (click)="editTask(task)"
                class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                Edit
              </button>
              <button
                (click)="deleteTask(task)"
                class="text-red-600 hover:text-red-900 text-sm font-medium"
                *ngIf="canDeleteTask(task)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredTasks.length === 0" class="text-center py-12">
          <div class="text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
          </div>
        </div>
      </main>
    </div>
  `
})
export class TaskDashboardComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  showCreateForm = false;
  isCreating = false;
  selectedStatus = '';
  selectedCategory = '';
  categories: string[] = [];

  newTask: CreateTaskDto = {
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    category: '',
    dueDate: undefined
  };

  constructor(
    private tasksService: TasksService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.tasksService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filteredTasks = tasks;
        this.extractCategories();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  extractCategories() {
    this.categories = [...new Set(this.tasks.map(task => task.category))];
  }

  filterTasks() {
    this.filteredTasks = this.tasks.filter(task => {
      const statusMatch = !this.selectedStatus || task.status === this.selectedStatus;
      const categoryMatch = !this.selectedCategory || task.category === this.selectedCategory;
      return statusMatch && categoryMatch;
    });
  }

  createTask() {
    if (this.newTask.title && this.newTask.category) {
      this.isCreating = true;
      this.tasksService.createTask(this.newTask).subscribe({
        next: (task) => {
          this.tasks.unshift(task);
          this.filteredTasks = [...this.tasks];
          this.extractCategories();
          this.showCreateForm = false;
          this.resetNewTask();
          this.isCreating = false;
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.isCreating = false;
        }
      });
    }
  }

  editTask(task: Task) {
    // TODO: Implement edit functionality
    console.log('Edit task:', task);
  }

  deleteTask(task: Task) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasksService.deleteTask(task.id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
          this.filteredTasks = this.filteredTasks.filter(t => t.id !== task.id);
          this.extractCategories();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  resetNewTask() {
    this.newTask = {
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      category: '',
      dueDate: undefined
    };
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  canCreateTask(): boolean {
    return this.authService.isAdmin();
  }

  canModifyTask(task: Task): boolean {
    return this.authService.isAdmin();
  }

  canDeleteTask(task: Task): boolean {
    return this.authService.isAdmin();
  }

  getRoleBadgeClass(): string {
    const role = this.getCurrentUser()?.role;
    switch (role) {
      case Role.OWNER:
        return 'bg-purple-100 text-purple-800';
      case Role.ADMIN:
        return 'bg-blue-100 text-blue-800';
      case Role.VIEWER:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-100 text-gray-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TaskStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return 'text-green-600';
      case TaskPriority.MEDIUM:
        return 'text-yellow-600';
      case TaskPriority.HIGH:
        return 'text-orange-600';
      case TaskPriority.URGENT:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
}
