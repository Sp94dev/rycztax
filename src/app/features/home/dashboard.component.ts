import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [JsonPipe, AsyncPipe],
  template: `
    <div>
      <h1>Strona Prywatna</h1>
      @let user = user$ | async;
      <p>Witaj {{ user?.displayName }}</p>
      <pre>{{ user | json }}</pre>
    </div>
    <button (click)="logout()">Logout</button>
  `,
})
export class DashboardComponent {
  #authService = inject(AuthService);

  user$ = this.#authService.user;

  logout() {
    this.#authService.logout();
  }
}
