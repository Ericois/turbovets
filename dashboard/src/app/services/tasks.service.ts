import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from '@turbovets/data';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // No need for manual headers - interceptor handles authentication
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/tasks`);
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/tasks/${id}`);
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.API_URL}/tasks`, task);
  }

  updateTask(id: string, task: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/tasks/${id}`, task);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/tasks/${id}`);
  }

  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/tasks/status/${status}`);
  }

  getTasksByCategory(category: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/tasks/category/${category}`);
  }

  // Additional methods for filtering and sorting
  getTasksWithFilters(filters: {
    search?: string;
    category?: string;
    priority?: string;
    status?: TaskStatus;
    sortBy?: string;
  }): Observable<Task[]> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    return this.http.get<Task[]>(`${this.API_URL}/tasks?${params.toString()}`);
  }
}
