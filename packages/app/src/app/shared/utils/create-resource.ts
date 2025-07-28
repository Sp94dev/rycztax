import { Injector, runInInjectionContext, signal } from '@angular/core';

interface LoadingState {
  state: 'loading';
}
interface LoadedState<T> {
  state: 'loaded';
  value: T;
}
interface ErrorState {
  state: 'error';
  error: unknown;
}

export type ResourceState<T> = LoadingState | LoadedState<T> | ErrorState;

export function createResource<T>(
  injector: Injector,
  sourceFn: () => Promise<T>,
) {
  const state = signal<ResourceState<T>>({ state: 'loading' });

  runInInjectionContext(injector, () => {
    sourceFn()
      .then((value) => state.set({ state: 'loaded', value }))
      .catch((error) => state.set({ state: 'error', error }));
  });

  return state.asReadonly();
}
