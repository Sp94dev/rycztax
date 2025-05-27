import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { AuthService } from '../auth.service';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  debugger;
  return authService.user.pipe(
    map((user) => !!user),
    tap((isAuth) => !isAuth && router.navigate(['/home'])),
  );
};
