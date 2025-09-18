import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { LoginDto, AuthResponseDto, User, Role } from '@turbovets/data';
import { Router } from '@angular/router';

// Define a User type without password for the frontend
export interface UserWithoutPassword extends Omit<User, 'password'> {}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<UserWithoutPassword | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Check for existing token on service initialization
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user info from profile endpoint
      this.verifyTokenAndLoadUser();
    }
  }

  // Secure authentication - only store JWT, fetch user info from profile endpoint
  private verifyTokenAndLoadUser(): void {
    this.http.get<UserWithoutPassword>(`${this.API_URL}/auth/profile`)
      .pipe(
        catchError(error => {
          // Token is invalid, clear it
          this.logout();
          return throwError(() => error);
        })
      )
      .subscribe(user => {
        this.currentUserSubject.next(user);
      });
  }

  login(credentials: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          // Only store the JWT token - no user data
          localStorage.setItem('token', response.access_token);
          // Fetch user info from profile endpoint
          this.verifyTokenAndLoadUser();
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): UserWithoutPassword | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: Role): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: Role[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isOwner(): boolean {
    return this.hasRole(Role.OWNER);
  }

  isAdmin(): boolean {
    return this.hasAnyRole([Role.OWNER, Role.ADMIN]);
  }

  isViewer(): boolean {
    return this.hasRole(Role.VIEWER);
  }

  // Method to refresh user data from server
  refreshUserData(): Observable<UserWithoutPassword> {
    return this.http.get<UserWithoutPassword>(`${this.API_URL}/auth/profile`)
      .pipe(
        tap(user => this.currentUserSubject.next(user)),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }
}
