import { Component, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ScanFileComponent } from '../files/scan-file.component';

@Component({
  selector: 'app-dashboard',
  imports: [ScanFileComponent],
  template: `
    <app-scan-file />
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
