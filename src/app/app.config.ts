import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { environment } from '../environments/environment.prod';
import { routes } from './app.routes';
import { myPreset } from './theme/primeng/preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: myPreset,
        options: {
          darkModeSelector: false,
          prefix: '',
          order: 'theme, base, utilities, primeng',
        },
      },
    }),
    provideFirebaseApp(() => {
      return initializeApp(environment.firebase);
    }),
    provideAuth(() => {
      const auth = getAuth();

      if (environment.useEmulators) {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099');
      }
      return auth;
    }),
    provideHttpClient(),
  ],
};
