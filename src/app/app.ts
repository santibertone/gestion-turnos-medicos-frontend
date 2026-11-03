import { Component, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconRegistry } from '@angular/material/icon';
import { filter } from 'rxjs';

import { Header } from './layout/header/header';
import { Menu } from './layout/menu/menu';
import { Footer } from './layout/footer/footer';
import { AuthService } from './core/services/auth.service';
import { routeAnimations } from './app.animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, Header, Menu, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [routeAnimations],
})
export class App {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly drawer = viewChild<MatSidenav>('drawer');

  /** Cambia en cada navegacion para disparar la animacion de transicion. */
  readonly rutaActual = signal('');

  constructor() {
    // Todos los <mat-icon> usan la fuente "Material Symbols Outlined".
    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => this.rutaActual.set((e as NavigationEnd).urlAfterRedirects));
  }

  toggleMenu(): void {
    this.drawer()?.toggle();
  }
}
