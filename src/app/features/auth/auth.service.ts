import {
  DestroyRef,
  inject,
  Injectable,
  Injector,
  resource,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Auth,
  createUserWithEmailAndPassword,
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
          : this.#router.navigate(['/login'], {
              replaceUrl: true,
              onSameUrlNavigation: 'reload',
            });
      }),
    )
    .subscribe();

  login(credentials: Signal<{ email: string; password: string } | undefined>) {
    return resource({
      request: () => ({ credentials: credentials() }),
      loader: ({ request }) => {
        const credentials = request.credentials;
        if (!credentials) {
          return Promise.resolve([] as unknown);
        }
        return signInWithEmailAndPassword(
          this.#auth,
          credentials.email,
          credentials.password,
        );
      },
    });
  }

  register(
    credentials: Signal<{ email: string; password: string } | undefined>,
  ) {
    return resource({
      request: () => ({ credentials: credentials() }),
      loader: ({ request }) => {
        const credentials = request.credentials;
        if (!credentials) {
          return Promise.resolve([] as unknown);
        }
        return createUserWithEmailAndPassword(
          this.#auth,
          credentials.email,
          credentials.password,
        );
      },
    });
  }

  logout() {
    return createResource(this.#injector, () => {
      return signOut(this.#auth);
    });
  }
}
