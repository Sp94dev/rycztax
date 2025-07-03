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
    path: '',
    canActivate: [isAuthenticatedGuard],
    loadComponent: () =>
      import('./shared/ui/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [isAuthenticatedGuard],
        loadComponent: () =>
          import('./features/files/pages/files.page.component').then(
            (m) => m.FilesPageComponent,
          ),
      },
    ],
  },
];
