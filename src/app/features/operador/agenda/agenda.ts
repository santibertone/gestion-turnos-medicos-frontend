import { Component, computed, inject, signal } from '@angular/core';
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

import { AgendaService } from '../../../core/services/agenda.service';
import { SedeService } from '../../../core/services/sede.service';
import { MedicoService } from '../../../core/services/medico.service';
import { AuthService } from '../../../core/services/auth.service';
import { Agenda as AgendaModel } from '../../../core/models/agenda.model';
import { Sede } from '../../../core/models/sede.model';
import { Medico } from '../../../core/models/medico.model';
import { Cargando } from '../../../shared/ui/cargando';
import { SinDatos } from '../../../shared/ui/sin-datos';
import { AgendaFormDialog } from '../../../shared/agenda-form/agenda-form-dialog';
import { ConfirmarService } from '../../../shared/confirmar/confirmar.service';
import { VerTurnosDialog } from './ver-turnos-dialog';
import { mensajeError } from '../../../core/utils/errores';
import { aFechaISO } from '../../../core/utils/fechas';

/** Agenda y turnos (rol operador): consulta por fecha/sede y gestion en su sede. */
@Component({
  selector: 'app-operador-agenda',
  imports: [
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatCardModule,
    MatTooltipModule, Cargando, SinDatos,
  ],
  templateUrl: './agenda.html',
})
export class OperadorAgenda {
  private readonly agendaService = inject(AgendaService);
  private readonly sedeService = inject(SedeService);
  private readonly medicoService = inject(MedicoService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmar = inject(ConfirmarService);
  private readonly snackBar = inject(MatSnackBar);

  readonly agenda = signal<AgendaModel[]>([]);
  readonly cargando = signal(true);
  readonly fecha = signal<Date>(new Date());
  readonly miSede = this.auth.usuario()?.id_sede ?? null;
  readonly idSede = signal<number | null>(this.miSede);
  readonly sedes = signal<Sede[]>([]);
  readonly medicos = signal<Medico[]>([]);

  readonly esSuSede = computed(() => this.idSede() === this.miSede);
  readonly columnas = computed(() =>
    this.esSuSede()
      ? ['medico', 'especialidad', 'horario', 'acciones']
      : ['medico', 'especialidad', 'horario'],
  );

  constructor() {
    this.sedeService.listar().subscribe((r) => this.sedes.set(r.datos ?? []));
    this.medicoService.listar().subscribe((r) => this.medicos.set(r.datos ?? []));
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.agendaService
      .listar({ fecha: aFechaISO(this.fecha()), id_sede: this.idSede() || undefined })
      .subscribe({
        next: (r) => {
          this.agenda.set(r.datos ?? []);
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

  nuevaAgenda(): void {
    this.abrirForm();
  }

  editar(agenda: AgendaModel): void {
    this.abrirForm(agenda);
  }

  private abrirForm(agenda?: AgendaModel): void {
    this.dialog
      .open(AgendaFormDialog, {
        width: '520px',
        maxWidth: '95vw',
        data: { agenda, medicos: this.medicos(), sedeFija: this.miSede },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.snackBar.open(agenda ? 'Agenda modificada' : 'Agenda creada', 'Cerrar', { duration: 4000 });
          this.cargar();
        }
      });
  }

  verTurnos(agenda: AgendaModel): void {
    this.dialog.open(VerTurnosDialog, {
      width: '480px',
      maxWidth: '95vw',
      data: {
        idMedico: agenda.id_medico,
        fecha: aFechaISO(this.fecha()),
        medico: `${agenda.medico_apellido}, ${agenda.medico_nombre}`,
      },
    });
  }

  eliminar(agenda: AgendaModel): void {
    this.confirmar
      .confirmar({
        titulo: 'Eliminar rango horario',
        mensaje: `¿Eliminar el rango de ${agenda.medico_apellido} (${agenda.hora_entrada} - ${agenda.hora_salida})?`,
        confirmar: 'Eliminar',
        peligro: true,
      })
      .subscribe((ok) => {
        if (!ok) return;
        this.agendaService.eliminar(agenda.id).subscribe({
          next: () => {
            this.snackBar.open('Rango eliminado', 'Cerrar', { duration: 4000 });
            this.cargar();
          },
          error: (err) => this.snackBar.open(mensajeError(err), 'Cerrar', { duration: 5000 }),
        });
      });
  }
}
