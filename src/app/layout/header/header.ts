import { Component, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { AuthService } from '../../core/services/auth.service';
import { ROL_LABEL } from '../../core/models/usuario.model';

/**
 * Barra superior de la aplicacion.
 *  - Sin sesion: mensaje de bienvenida + accesos a ingresar / registrarse.
 *  - Con sesion: nombre del usuario, icono de informacion con su rol, campana
 *    de notificaciones (funcionalidad de la semana 3) y cerrar sesion.
 */
@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Se emite para abrir/cerrar el menu lateral desde el shell. */
  readonly menuToggle = output<void>();

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly usuario = this.auth.usuario;
  readonly rol = this.auth.rol;
  readonly rolLabel = ROL_LABEL;

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
