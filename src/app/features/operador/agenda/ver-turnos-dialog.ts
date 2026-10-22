import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TurnoService } from '../../../core/services/turno.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { Turno } from '../../../core/models/turno.model';
import { Cargando } from '../../../shared/ui/cargando';
import { SinDatos } from '../../../shared/ui/sin-datos';
import { ConfirmarService } from '../../../shared/confirmar/confirmar.service';
import { mensajeError } from '../../../core/utils/errores';

/** Turnos confirmados de un medico para una fecha (en la sede del operador), con cancelacion. */
@Component({
  selector: 'app-ver-turnos-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatListModule, Cargando, SinDatos],
  template: `
    <h2 mat-dialog-title>Turnos de {{ data.medico }}</h2>
    <mat-dialog-content style="min-width: 380px;">
      @if (cargando()) {
        <app-cargando />
      } @else if (turnos().length === 0) {
        <app-sin-datos mensaje="No hay turnos confirmados para esta fecha." icono="event_busy" />
      } @else {
        <mat-list>
          @for (t of turnos(); track t.id) {
            <mat-list-item>
              <mat-icon matListItemIcon>schedule</mat-icon>
              <span matListItemTitle>{{ t.hora }} - {{ t.paciente_apellido }}, {{ t.paciente_nombre }}</span>
              <span matListItemLine>{{ t.especialidad }}</span>
              <button mat-icon-button matListItemMeta matTooltip="Cancelar turno" (click)="cancelar(t)">
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-list-item>
          }
        </mat-list>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
})
export class VerTurnosDialog {
  readonly data = inject<{ idMedico: number; fecha: string; medico: string }>(MAT_DIALOG_DATA);
  private readonly turnoService = inject(TurnoService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly confirmar = inject(ConfirmarService);
  private readonly snackBar = inject(MatSnackBar);

  readonly turnos = signal<Turno[]>([]);
  readonly cargando = signal(true);

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.turnoService
      .turnosDeLaSede({ fecha: this.data.fecha, id_medico: this.data.idMedico })
      .subscribe({
        next: (r) => {
          this.turnos.set((r.datos ?? []).filter((t) => t.estado === 'confirmado'));
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }

  cancelar(turno: Turno): void {
    this.confirmar
      .confirmar({
        titulo: 'Cancelar turno',
        mensaje: `¿Cancelar el turno de ${turno.paciente_apellido} a las ${turno.hora}?`,
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
