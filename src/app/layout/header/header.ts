import { Component, computed, effect, inject, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';

import { AuthService } from '../../core/services/auth.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { TemaService } from '../../core/services/tema.service';
import { Notificacion } from '../../core/models/notificacion.model';
import { ROL_LABEL } from '../../core/models/usuario.model';

/**
 * Barra superior de la aplicacion.
 *  - Sin sesion: mensaje de bienvenida + accesos a ingresar / registrarse.
 *  - Con sesion: nombre del usuario, icono de informacion con su rol, campana
 *    de notificaciones (contador en vivo) y cerrar sesion.
 */
@Component({
  selector: 'app-header',
  imports: [
    DatePipe,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    MatListModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificacionService = inject(NotificacionService);
  private readonly temaService = inject(TemaService);

  readonly temaOscuro = this.temaService.oscuro;

  /** Se emite para abrir/cerrar el menu lateral desde el shell. */
  readonly menuToggle = output<void>();

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly usuario = this.auth.usuario;
  readonly rol = this.auth.rol;
  readonly rolLabel = ROL_LABEL;

  readonly noLeidas = this.notificacionService.noLeidas;
  readonly notificaciones = signal<Notificacion[]>([]);
  readonly cargandoNotif = signal(false);

  /** Iniciales del usuario para el avatar. */
  readonly iniciales = computed(() => {
    const u = this.usuario();
    if (!u) return '';
    return `${u.nombre?.[0] ?? ''}${u.apellido?.[0] ?? ''}`.toUpperCase();
  });

  constructor() {
    // Al iniciar sesion, refrescamos el contador de notificaciones no leidas.
    effect(() => {
      if (this.isAuthenticated()) {
        this.notificacionService.refrescarConteo();
      }
    });

    // Tambien al navegar entre pantallas (asi el contador se actualiza cuando
    // el usuario recibe notificaciones por acciones de otros).
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isAuthenticated()) {
          this.notificacionService.refrescarConteo();
        }
      });
  }

  /** Carga el listado al abrir el menu de la campana. */
  abrirNotificaciones(): void {
    this.cargandoNotif.set(true);
    this.notificacionService.listar().subscribe({
      next: (r) => {
        // Normalizamos la fecha a ISO para que el pipe de fecha la interprete bien.
        const datos = (r.datos ?? []).map((n) => ({ ...n, fecha: n.fecha.replace(' ', 'T') }));
        this.notificaciones.set(datos);
        this.cargandoNotif.set(false);
      },
      error: () => this.cargandoNotif.set(false),
    });
  }

  marcarLeida(notificacion: Notificacion): void {
    if (notificacion.leida) {
      return;
    }
    this.notificacionService.marcarLeida(notificacion.id).subscribe(() => {
      this.notificaciones.update((lista) =>
        lista.map((n) => (n.id === notificacion.id ? { ...n, leida: 1 } : n)),
      );
    });
  }

  alternarTema(): void {
    this.temaService.alternar();
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.notificacionService.limpiar();
    this.router.navigate(['/']);
  }
}
