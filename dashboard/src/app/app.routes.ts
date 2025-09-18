import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { TaskDashboardComponent } from './components/task-dashboard.component';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: TaskDashboardComponent,
    canActivate: [() => {
      const authService = inject(AuthService);
      if (!authService.isAuthenticated()) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return false;
      }
      return true;
    }]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

export default routes;
