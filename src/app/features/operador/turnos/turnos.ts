import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PacienteService } from '../../../core/services/paciente.service';
import { AuthService } from '../../../core/services/auth.service';
import { Paciente } from '../../../core/models/paciente.model';
import { Cargando } from '../../../shared/ui/cargando';
import { SinDatos } from '../../../shared/ui/sin-datos';
import { TurnoWizard } from '../../../shared/turno-wizard/turno-wizard';

/** Asignar turno (rol operador): busca al paciente y usa el wizard con su sede fija. */
@Component({
  selector: 'app-operador-turnos',
  imports: [
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatListModule, Cargando, SinDatos, TurnoWizard,
  ],
  templateUrl: './turnos.html',
})
export class OperadorTurnos {
  private readonly pacienteService = inject(PacienteService);
  private readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  readonly miSede = this.auth.usuario()?.id_sede ?? undefined;
  readonly busqueda = signal('');
  readonly pacientes = signal<Paciente[]>([]);
  readonly buscando = signal(false);
  readonly busquedaHecha = signal(false);
  readonly pacienteSel = signal<Paciente | null>(null);

  buscar(): void {
    const texto = this.busqueda().trim();
    if (!texto) return;
    this.buscando.set(true);
    this.busquedaHecha.set(true);
    this.pacienteService.buscar(texto).subscribe({
      next: (r) => {
        this.pacientes.set(r.datos ?? []);
        this.buscando.set(false);
      },
      error: () => this.buscando.set(false),
    });
  }

  seleccionar(paciente: Paciente): void {
    this.pacienteSel.set(paciente);
  }

  onCreado(): void {
    this.snackBar.open('Turno asignado correctamente', 'Cerrar', { duration: 4000 });
  }

  volver(): void {
    this.pacienteSel.set(null);
    this.pacientes.set([]);
    this.busqueda.set('');
    this.busquedaHecha.set(false);
  }
}
