import { Component, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TurnoService } from '../../../core/services/turno.service';
import { SedeService } from '../../../core/services/sede.service';
import { HistorialService } from '../../../core/services/historial.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { Turno } from '../../../core/models/turno.model';
import { Sede } from '../../../core/models/sede.model';
import { Cargando } from '../../../shared/ui/cargando';
import { SinDatos } from '../../../shared/ui/sin-datos';
import { ConfirmarService } from '../../../shared/confirmar/confirmar.service';
import { AtenderDialog } from './atender-dialog';
import { mensajeError } from '../../../core/utils/errores';
import { aFechaISO, calcularEdad } from '../../../core/utils/fechas';

/** Turnos programados del medico: por fecha y sede, con atencion y cancelacion. */
@Component({
  selector: 'app-medico-turnos',
  imports: [
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatCardModule,
    MatTooltipModule, Cargando, SinDatos,
  ],
  templateUrl: './turnos.html',
  styleUrl: './turnos.scss',
})
export class MedicoTurnos {
  private readonly turnoService = inject(TurnoService);
  private readonly sedeService = inject(SedeService);
  private readonly historialService = inject(HistorialService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmar = inject(ConfirmarService);
  private readonly snackBar = inject(MatSnackBar);

  readonly turnos = signal<Turno[]>([]);
  readonly cargando = signal(true);
  readonly fecha = signal<Date>(new Date());
  readonly idSede = signal<number | null>(null);
  readonly sedes = signal<Sede[]>([]);
  readonly expandido = signal<number | null>(null);
  readonly columnas = ['hora', 'paciente', 'edad', 'sede', 'estado', 'acciones'];

  constructor() {
    this.sedeService.listar().subscribe((r) => this.sedes.set(r.datos ?? []));
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.turnoService
      .turnosDelMedico({ fecha: aFechaISO(this.fecha()), id_sede: this.idSede() || undefined })
      .subscribe({
        next: (r) => {
          this.turnos.set(r.datos ?? []);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }

  cambiarFecha(fecha: Date | null): void {
    if (fecha) {
      this.fecha.set(fecha);
      this.cargar();
    }
  }

  cambiarSede(id: number | null): void {
    this.idSede.set(id);
    this.cargar();
  }

  toggle(turno: Turno): void {
    this.expandido.update((actual) => (actual === turno.id ? null : turno.id));
  }

  edad(turno: Turno): number | string {
    return turno.paciente_fecha_nacimiento ? calcularEdad(turno.paciente_fecha_nacimiento) : '-';
  }

  atender(turno: Turno, evento: Event): void {
    evento.stopPropagation();
    this.dialog
      .open(AtenderDialog, { data: { turno } })
      .afterClosed()
      .subscribe((datos) => {
        if (!datos) return;
        this.turnoService.atender(turno.id).subscribe({
          next: () => {
            this.historialService
              .registrar({ id_turno: turno.id, ...datos })
              .subscribe({
                next: () => this.finalizar('Turno atendido y historial registrado'),
                error: (err) => this.snackBar.open(mensajeError(err), 'Cerrar', { duration: 5000 }),
              });
          },
          error: (err) => this.snackBar.open(mensajeError(err), 'Cerrar', { duration: 5000 }),
        });
      });
  }

  cancelar(turno: Turno, evento: Event): void {
    evento.stopPropagation();
    this.confirmar
      .confirmar({
        titulo: 'Cancelar turno',
        mensaje: `¿Cancelar el turno de ${turno.paciente_apellido}, ${turno.paciente_nombre} a las ${turno.hora}?`,
        confirmar: 'Cancelar turno',
        cancelar: 'Volver',
        peligro: true,
      })
      .subscribe((ok) => {
        if (!ok) return;
        this.turnoService.cancelar(turno.id).subscribe({
          next: () => this.finalizar('Turno cancelado'),
          error: (err) => this.snackBar.open(mensajeError(err), 'Cerrar', { duration: 5000 }),
        });
      });
  }

  private finalizar(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
    this.notificacionService.refrescarConteo();
    this.cargar();
  }
}
