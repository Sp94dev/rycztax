import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-layout',
  imports: [ButtonModule, RouterOutlet],
  host: {
    class: 'flex flex-',
  },
  styles: `
    :host {
        display: grid;
        grid-template-rows: auto 1fr;
        gap: 1rem;
    }
  `,
  template: ` <nav [style]="{ display: 'flex', justifyContent: 'flex-end' }">
      <p-button (click)="logout()">Logout</p-button>
    </nav>
    <main><router-outlet></router-outlet></main>`,
})
export class LayoutComponent {
  #authService = inject(AuthService);

  logout() {
    this.#authService.logout();
  }
}
