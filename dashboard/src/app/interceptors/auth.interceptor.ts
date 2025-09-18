import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding token for login and profile endpoints
    if (this.shouldSkipToken(req)) {
      return next.handle(req);
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Clone the request and add the authorization header if token exists
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Handle the request and catch errors
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleAuthError(error, req, next);
      })
    );
  }

  private shouldSkipToken(req: HttpRequest<any>): boolean {
    // Skip adding token for login endpoint
    return req.url.includes('/auth/login');
  }

  private handleAuthError(error: HttpErrorResponse, req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Handle 401 Unauthorized responses
    if (error.status === 401) {
      // If we're already refreshing, wait for the new token
      if (this.isRefreshing) {
        return this.refreshTokenSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(() => next.handle(this.addTokenToRequest(req)))
        );
      }

      // Start refresh process
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // For now, just clear token and redirect to login
      // In a real app, you might want to attempt token refresh here
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      
      this.isRefreshing = false;
      this.refreshTokenSubject.next(null);
    }

    // Handle 403 Forbidden responses
    if (error.status === 403) {
      // Clear token and redirect to login for forbidden access
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }

    // Re-throw the error so it can be handled by the component
    return throwError(() => error);
  }

  private addTokenToRequest(req: HttpRequest<any>): HttpRequest<any> {
    const token = localStorage.getItem('token');
    if (token) {
      return req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return req;
  }
}
