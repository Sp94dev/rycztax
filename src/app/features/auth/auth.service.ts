import { DestroyRef, inject, Injectable, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { createResource } from 'shared/utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  #auth = inject(Auth);
  #injector = inject(Injector);
  #router = inject(Router);
  #destroyRef = inject(DestroyRef);

  user = user(this.#auth).pipe(tap(console.log));
  #handleUserChange = this.user
    .pipe(
      takeUntilDestroyed(this.#destroyRef),
      tap((user) => {
        !!user
          ? this.#router.navigate(['/dashboard'], {
              replaceUrl: true,
              onSameUrlNavigation: 'reload',
            })
          : this.#router.navigate(['/home'], {
              replaceUrl: true,
              onSameUrlNavigation: 'reload',
            });
      }),
    )
    .subscribe();

  login(email: string, password: string) {
    return createResource(this.#injector, () =>
      signInWithEmailAndPassword(this.#auth, email, password),
    );
  }

  logout() {
    return createResource(this.#injector, () => {
      return signOut(this.#auth);
    });
  }
}
