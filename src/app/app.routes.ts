import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from './features/auth/guards/isAuthenticated.guard';
import { isNotAuthenticatedGuard } from './features/auth/guards/isNotAuthenticated.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [isNotAuthenticatedGuard],
    loadComponent: () =>
      import('./features/auth/pages/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
  {
    path: 'create-account',
    canActivate: [isNotAuthenticatedGuard],
    loadComponent: () =>
      import('./features/auth/pages/create-account-page.component').then(
        (m) => m.CreateAccountPageComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [isAuthenticatedGuard],
    loadComponent: () =>
      import('./features/home/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
];
