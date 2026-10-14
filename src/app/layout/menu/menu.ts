import { Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/services/auth.service';
import { NAV_POR_ROL, NavItem } from '../navigation';

/** Menu lateral de navegacion con las opciones del rol logueado. */
@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  private readonly auth = inject(AuthService);

  /** Se emite al elegir una opcion (el shell cierra el menu en mobile). */
  readonly navegar = output<void>();

  readonly items = computed<NavItem[]>(() => {
    const rol = this.auth.rol();
    return rol ? NAV_POR_ROL[rol] : [];
  });
}
