import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  host: {
    class: 'flex flex-col h-screen p-4 bg-background',
  },
  template: ` <router-outlet />`,
})
export class AppComponent {}
