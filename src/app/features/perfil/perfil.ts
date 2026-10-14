import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth.service';
import { ROL_LABEL } from '../../core/models/usuario.model';
import { mensajeError } from '../../core/utils/errores';

/** Muestra los datos del usuario logueado obtenidos de GET /auth/perfil. */
@Component({
  selector: 'app-perfil',
  imports: [DatePipe, MatCardModule, MatIconModule, MatListModule, MatProgressSpinnerModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil {
  private readonly auth = inject(AuthService);

  readonly usuario = this.auth.usuario;
  readonly rolLabel = ROL_LABEL;
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    // Pedimos el perfil al backend para tener los datos siempre frescos.
    this.auth.perfil().subscribe({
      next: () => this.cargando.set(false),
      error: (err) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }
}
