import { Component, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';
import { PacienteForm } from '../../../shared/paciente-form/paciente-form';
import { mensajeError } from '../../../core/utils/errores';

/** Registro de pacientes: reutiliza el formulario de paciente compartido. */
@Component({
  selector: 'app-registro',
  imports: [
    RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, PacienteForm,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly form = viewChild.required(PacienteForm);
  readonly cargando = signal(false);
  readonly errorBackend = signal<string | null>(null);

  enviar(): void {
    const datos = this.form().obtenerDatos();
    if (!datos) return;

    this.cargando.set(true);
    this.errorBackend.set(null);
    this.auth.registro(datos).subscribe({
      next: () => {
        this.snackBar.open('Registro exitoso. Ya podes iniciar sesion.', 'Cerrar', { duration: 5000 });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorBackend.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }
}
