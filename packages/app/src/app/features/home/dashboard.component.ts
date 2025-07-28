import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../auth/auth.service';
import { ScanFileComponent } from '../files/scan-file.component';

@Component({
  selector: 'app-dashboard',
  imports: [ScanFileComponent, ButtonModule],
  template: ` <app-scan-file /> `,
})
export class DashboardComponent {
  #authService = inject(AuthService);

  user$ = this.#authService.user;

  logout() {
    this.#authService.logout();
  }
}
