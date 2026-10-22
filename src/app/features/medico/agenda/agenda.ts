import { Component, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
import { Especialidad } from '../../../core/models/especialidad.model';
import { Cargando } from '../../../shared/ui/cargando';
import { SinDatos } from '../../../shared/ui/sin-datos';
import { AgendaFormDialog } from '../../../shared/agenda-form/agenda-form-dialog';
import { ConfirmarService } from '../../../shared/confirmar/confirmar.service';
import { mensajeError } from '../../../core/utils/errores';
import { aFechaISO } from '../../../core/utils/fechas';

/** Mi agenda (rol medico): ve y gestiona sus rangos horarios por fecha. */
@Component({
  selector: 'app-medico-agenda',
  imports: [
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatDatepickerModule, MatCardModule, MatTooltipModule,
    Cargando, SinDatos,
  ],
  templateUrl: './agenda.html',
})
export class MedicoAgenda {
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
  readonly columnas = ['horario', 'especialidad', 'sede', 'acciones'];

  private readonly sedes = signal<Sede[]>([]);
  private readonly misEspecialidades = signal<Especialidad[]>([]);

  constructor() {
    this.sedeService.listar().subscribe((r) => this.sedes.set(r.datos ?? []));
    this.medicoService.listar().subscribe((r) => {
      const yo = (r.datos ?? []).find((m) => m.id === this.auth.usuario()?.id);
      this.misEspecialidades.set(yo?.especialidades ?? []);
    });
    this.cargar();
  }

  cambiarFecha(fecha: Date | null): void {
    if (fecha) {
      this.fecha.set(fecha);
      this.cargar();
    }
  }

  private cargar(): void {
    this.cargando.set(true);
    this.agendaService.listar({ fecha: aFechaISO(this.fecha()) }).subscribe({
      next: (r) => {
        this.agenda.set(r.datos ?? []);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  nuevo(): void {
    this.abrir();
  }

  editar(agenda: AgendaModel): void {
    this.abrir(agenda);
  }

  private abrir(agenda?: AgendaModel): void {
    this.dialog
      .open(AgendaFormDialog, {
        width: '520px',
        maxWidth: '95vw',
        data: {
          agenda,
          medicoId: this.auth.usuario()?.id,
          especialidadesMedico: this.misEspecialidades(),
          sedes: this.sedes(),
          sedePreseleccionada: this.auth.usuario()?.id_sede ?? undefined,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.snackBar.open(agenda ? 'Agenda modificada' : 'Agenda creada', 'Cerrar', { duration: 4000 });
          this.cargar();
        }
      });
  }

  eliminar(agenda: AgendaModel): void {
    this.confirmar
      .confirmar({
        titulo: 'Eliminar rango horario',
        mensaje: `¿Eliminar el rango de ${agenda.hora_entrada} a ${agenda.hora_salida}?`,
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
