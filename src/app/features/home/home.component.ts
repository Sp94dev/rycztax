import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [FormsModule, AsyncPipe, JsonPipe],
  template: `
    <div>
      <h1>Strona Publiczna</h1>
      login
      <input
        type="text"
        name="login"
        id="loginModel"
        [(ngModel)]="loginModel"
      />
      password
      <input
        type="text"
        name="password"
        id="passwordModel"
        [(ngModel)]="passwordModel"
      />
      <button (click)="login()">Zaloguj</button>
      <br />
      <button (click)="logout()">Wyloguj</button>

      <div>
        {{ user | async | json }}
      </div>
    </div>
  `,
})
export class HomeComponent {
  #authService = inject(AuthService);

  user = this.#authService.user;

  loginModel = model<string>('');
  passwordModel = model<string>('');

  login() {
    const login = this.loginModel();
    const password = this.passwordModel();

    if (login && password) {
      this.#authService.login(login, password);
    }
  }

  logout() {
    this.#authService.logout();
  }
}
