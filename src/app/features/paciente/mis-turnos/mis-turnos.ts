import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { TurnoService } from '../../../core/services/turno.service';
import { HistorialService } from '../../../core/services/historial.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { Turno } from '../../../core/models/turno.model';
import { Historial } from '../../../core/models/historial.model';
import { Cargando } from '../../../shared/ui/cargando';
import { SinDatos } from '../../../shared/ui/sin-datos';
import { ConfirmarService } from '../../../shared/confirmar/confirmar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../../core/utils/errores';

/** Mis turnos (rol paciente): listado con estado, cancelacion e historial. */
@Component({
  selector: 'app-mis-turnos',
  imports: [
    DatePipe, MatExpansionModule, MatButtonModule, MatIconModule, MatCardModule,
    Cargando, SinDatos,
  ],
  templateUrl: './mis-turnos.html',
})
export class MisTurnos {
  private readonly turnoService = inject(TurnoService);
  private readonly historialService = inject(HistorialService);
  private readonly auth = inject(AuthService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly confirmar = inject(ConfirmarService);
  private readonly snackBar = inject(MatSnackBar);

  readonly turnos = signal<Turno[]>([]);
  readonly cargando = signal(true);
  private readonly historial = signal<Record<number, Historial>>({});

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    const id = this.auth.usuario()?.id;
    forkJoin({
      turnos: this.turnoService.misTurnos(),
      historial: this.historialService.consultarPorPaciente(id!),
    }).subscribe({
      next: (r) => {
        this.turnos.set(r.turnos.datos ?? []);
        const mapa: Record<number, Historial> = {};
        for (const h of r.historial.datos ?? []) mapa[h.id_turno] = h;
        this.historial.set(mapa);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  historialDe(turno: Turno): Historial | null {
    return this.historial()[turno.id] ?? null;
  }

  cancelar(turno: Turno): void {
    this.confirmar
      .confirmar({
        titulo: 'Cancelar turno',
        mensaje: `¿Cancelar tu turno del ${turno.fecha} a las ${turno.hora}?`,
        confirmar: 'Cancelar turno',
        cancelar: 'Volver',
        peligro: true,
      })
      .subscribe((ok) => {
        if (!ok) return;
        this.turnoService.cancelar(turno.id).subscribe({
          next: () => {
            this.snackBar.open('Turno cancelado', 'Cerrar', { duration: 4000 });
            this.notificacionService.refrescarConteo();
            this.cargar();
          },
          error: (err) => this.snackBar.open(mensajeError(err), 'Cerrar', { duration: 5000 }),
        });
      });
  }
}
