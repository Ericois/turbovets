import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from '@turbovets/data';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/tasks`, {
      headers: this.getHeaders()
    });
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/tasks/${id}`, {
      headers: this.getHeaders()
    });
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.API_URL}/tasks`, task, {
      headers: this.getHeaders()
    });
  }

  updateTask(id: string, task: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/tasks/${id}`, task, {
      headers: this.getHeaders()
    });
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/tasks/${id}`, {
      headers: this.getHeaders()
    });
  }

  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/tasks/status/${status}`, {
      headers: this.getHeaders()
    });
  }

  getTasksByCategory(category: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/tasks/category/${category}`, {
      headers: this.getHeaders()
    });
  }
}
