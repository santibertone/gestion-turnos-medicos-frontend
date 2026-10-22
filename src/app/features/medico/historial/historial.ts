import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

import { PacienteService } from '../../../core/services/paciente.service';
import { HistorialService } from '../../../core/services/historial.service';
import { Paciente } from '../../../core/models/paciente.model';
import { Historial } from '../../../core/models/historial.model';
import { Cargando } from '../../../shared/ui/cargando';
import { SinDatos } from '../../../shared/ui/sin-datos';

/** Historial clinico (rol medico): busca paciente y ve lo que el atendio. */
@Component({
  selector: 'app-medico-historial',
  imports: [
    DatePipe, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatListModule, MatCardModule, Cargando, SinDatos,
  ],
  templateUrl: './historial.html',
})
export class MedicoHistorial {
  private readonly pacienteService = inject(PacienteService);
  private readonly historialService = inject(HistorialService);

  readonly busqueda = signal('');
  readonly pacientes = signal<Paciente[]>([]);
  readonly buscando = signal(false);
  readonly busquedaHecha = signal(false);

  readonly pacienteSel = signal<Paciente | null>(null);
  readonly historial = signal<Historial[]>([]);
  readonly cargandoHistorial = signal(false);

  buscar(): void {
    const texto = this.busqueda().trim();
    if (!texto) return;
    this.buscando.set(true);
    this.busquedaHecha.set(true);
    this.pacienteSel.set(null);
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
    this.cargandoHistorial.set(true);
    this.historialService.consultarPorPaciente(paciente.id).subscribe({
      next: (r) => {
        this.historial.set(r.datos ?? []);
        this.cargandoHistorial.set(false);
      },
      error: () => this.cargandoHistorial.set(false),
    });
  }
}
