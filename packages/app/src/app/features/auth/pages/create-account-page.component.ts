import { Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register-page',
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    RouterLink,
  ],
  host: {
    class: 'flex flex-col items-center justify-center h-full w-full',
  },
  template: `
    <form
      #loginForm="ngForm"
      tabindex="0"
      class="flex flex-col p-6 md:p-18 lg:p-24 h-3/4 md:h-1/2 w-full md:w-2/3 justify-center items-center bg-foreground border"
    >
      <div class="flex gap-4 flex-col w-full max-w-128">
        <h1>Stworz konto</h1>
        <div class="flex flex-col gap-2 w-full">
          <label for="login">Email</label>
          <input
            pInputText
            type="text"
            name="login"
            id="login"
            inputId="loginModel"
            placeholder="Podaj email"
            required
            [(ngModel)]="loginModel"
          />
        </div>
        <div class="flex flex-col gap w-full">
          <label for="password">Hasło</label>
          <p-password
            inputStyleClass="w-full"
            styleClass="w-full"
            type="password"
            [(ngModel)]="passwordModel"
            inputId="password"
            required
            name="password"
            [feedback]="false"
            placeholder="Podaj hasło"
            (keydown.ennter)="createAccount()"
          />
        </div>
        <p-button
          [disabled]="loginForm.invalid"
          styleClass="w-full w-full"
          (click)="createAccount()"
        >
          Stwórz konto
        </p-button>
        <p-button
          routerLink="/login"
          link="true"
          variant="text"
          styleClass="w-full w-full"
        >
          Powrót do logowania
        </p-button>
      </div>
    </form>
  `,
})
export class CreateAccountPageComponent {
  #authService = inject(AuthService);

  user = this.#authService.user;

  loginModel = model<string>('');
  passwordModel = model<string>('');

  credentials = signal<{ email: string; password: string } | undefined>(
    undefined,
  );

  createAccountResource = this.#authService.register(this.credentials);
  createAccount() {
    const email = this.loginModel();
    const password = this.passwordModel();
    this.credentials.set({ email, password });
    this.createAccountResource.reload();
  }
}
