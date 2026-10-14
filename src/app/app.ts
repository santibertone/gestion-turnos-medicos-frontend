import { Component, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';

import { Header } from './layout/header/header';
import { Menu } from './layout/menu/menu';
import { Footer } from './layout/footer/footer';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, Header, Menu, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly auth = inject(AuthService);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly drawer = viewChild<MatSidenav>('drawer');

  toggleMenu(): void {
    this.drawer()?.toggle();
  }
}
