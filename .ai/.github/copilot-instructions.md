# GitHub Copilot Instructions for the Rycztax Project

## About The Project

This is an Angular 20 PWA for expense invoice management. The backend is a BaaS based on Firebase. The main goal is to automate data extraction from invoice images using an LLM.

## Key Technologies & Patterns

- **Frontend Framework:** Angular 20+
- **UI Components:** PrimeNG
- **Styling:** Tailwind CSS for custom layouts and overrides.
- **Backend:** Firebase (Authentication, Firestore, Storage, Functions).
- **State Management:** Angular Signals for component state. RxJS for handling async events (API calls).
- **API Communication:** Use dedicated services that call API wrappers from `shared/api/`. Components NEVER call Firebase SDK directly.

## Project Structure Rules

- **`./src/features/{feature-name}`**: Main directory for a domain feature (e.g., `invoices`).
  - **`data-access`**: Contains services for the feature's business logic.
  - **`ui`**: Contains "smart" components (views) that manage state.
  - **`components`**: Contains "dumb", reusable, presentational components.
  - **`models`**: Contains TypeScript types and interfaces for the feature.
- **`./src/shared`**: Contains globally reusable services, components, pipes, and models.
- **`./src/shared/api/*.api.ts`**: These files are wrappers around the Firebase SDK. They are the ONLY place where the Firebase SDK is directly called (e.g., `invoices.api.ts`). Services in `data-access` will call methods from these API wrappers.

## Angular Coding Standards

- **Always use `standalone: true`** for components, directives, and pipes. Do not use NgModules.
- **Use Signals** for managing component state.
- **Use the `inject()` function** for dependency injection. Do not use constructor injection.
- **Use new control flow syntax:** `@if`, `@for`, `@switch`. Do not use `*ngIf` or `*ngFor`.
- **Use functional guards and resolvers**. Do not use class-based ones.
- **Use `@defer`** for deferred loading of components and improved loading state UX.
- **All components must use `changeDetection: ChangeDetectionStrategy.OnPush`**.
- **Use native JavaScript private fields (`#field`)** for private class members. Avoid using the TypeScript `private` keyword. Do not explicitly use the `public` keyword, as it is the default.

## Firebase/Firestore Rules

- **Security First:** All Firestore security rules must follow a "deny-by-default" principle. Explicitly grant `read` or `write` access where needed.
- **User Roles:** The primary user role is `user`. Rules should be written with `request.auth.uid` to secure user-specific data.
- **Cloud Functions for Complex Logic:** Use Firebase Functions for any backend logic that is too complex for security rules (e.g., cascading deletes, data aggregation, calling the AI/LLM API).
- **Data Structure:** Design a "shallow" data structure to avoid fetching large, nested documents.

## Version Control (Git) Rules

- **Commit Messages:** Must follow the **Conventional Commits** standard (e.g., `feat: ...`, `fix: ...`, `refactor: ...`).
- **Branch Names:** Must follow the pattern: `type/TICKET-ID_short-description` (e.g., `feature/RTX-123_implement-export`).

## General Coding Practices

- **Code Formatting:** Adhere to the `.prettierrc` configuration. The `printWidth` is 100 characters.
- **Type Safety:** Always provide explicit types. Avoid using `any`.
