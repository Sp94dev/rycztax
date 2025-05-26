import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from './features/auth/isAuthenticated.guard';
import { isNotAuthenticatedGuard } from './features/auth/isNotAuthenticated.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    canActivate: [isNotAuthenticatedGuard],
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
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
