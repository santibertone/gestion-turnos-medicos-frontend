import { Component, inject, signal, viewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';
import { PacienteForm } from '../../../shared/paciente-form/paciente-form';
import { mensajeError } from '../../../core/utils/errores';

/** Alta de pacientes (rol operador): reutiliza el formulario de paciente. */
@Component({
  selector: 'app-operador-pacientes',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, PacienteForm],
  templateUrl: './pacientes.html',
})
export class OperadorPacientes {
  private readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  readonly form = viewChild.required(PacienteForm);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  registrar(): void {
    const datos = this.form().obtenerDatos();
    if (!datos) return;
    this.cargando.set(true);
    this.error.set(null);
    this.auth.registro(datos).subscribe({
      next: () => {
        this.cargando.set(false);
        this.snackBar.open('Paciente registrado correctamente', 'Cerrar', { duration: 4000 });
        this.form().reiniciar();
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(mensajeError(err));
      },
    });
  }
}
