import { Component } from '@angular/core';
import { LoginPageComponent } from 'auth/pages/login-page.component';

@Component({
  selector: 'app-home',
  imports: [LoginPageComponent],
  template: ` <app-login-page /> `,
})
export class HomeComponent {}
