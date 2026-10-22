import { Component, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EspecialidadService } from '../../core/services/especialidad.service';
import { SedeService } from '../../core/services/sede.service';
import { MedicoService } from '../../core/services/medico.service';
import { DisponibilidadService } from '../../core/services/disponibilidad.service';
import { TurnoService } from '../../core/services/turno.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Especialidad } from '../../core/models/especialidad.model';
import { Sede } from '../../core/models/sede.model';
import { Medico } from '../../core/models/medico.model';
import { Cargando } from '../ui/cargando';
import { SinDatos } from '../ui/sin-datos';
import { mensajeError } from '../../core/utils/errores';

/**
 * Wizard de solicitud de turno paso a paso: especialidad -> sede -> medico ->
 * fecha -> horario -> nota y confirmacion. Cada paso filtra el siguiente.
 * Reutilizado por el paciente (para si mismo) y el operador (para un paciente
 * buscado, con la sede fija en la suya).
 */
@Component({
  selector: 'app-turno-wizard',
  imports: [
    DatePipe, MatStepperModule, MatButtonToggleModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatCardModule,
    MatProgressSpinnerModule, Cargando, SinDatos,
  ],
  templateUrl: './turno-wizard.html',
  styleUrl: './turno-wizard.scss',
})
export class TurnoWizard {
  private readonly especialidadService = inject(EspecialidadService);
  private readonly sedeService = inject(SedeService);
  private readonly medicoService = inject(MedicoService);
  private readonly disponibilidadService = inject(DisponibilidadService);
  private readonly turnoService = inject(TurnoService);
  private readonly notificacionService = inject(NotificacionService);

  /** Si viene, el turno se saca para ese paciente (operador). Si no, para uno mismo. */
  readonly idPaciente = input<number | undefined>(undefined);
  /** Si viene, la sede queda fija (operador). */
  readonly sedeFija = input<number | undefined>(undefined);
  /** Cobertura a mostrar en el resumen. */
  readonly coberturaNombre = input<string | undefined>(undefined);

  readonly creado = output<void>();

  readonly especialidades = signal<Especialidad[]>([]);
  readonly sedes = signal<Sede[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly fechas = signal<string[]>([]);
  readonly horarios = signal<string[]>([]);

  readonly idEspecialidad = signal<number | null>(null);
  readonly idSede = signal<number | null>(null);
  readonly idMedico = signal<number | null>(null);
  readonly fecha = signal<string | null>(null);
  readonly hora = signal<string | null>(null);
  readonly nota = signal('');

  readonly cargandoMedicos = signal(false);
  readonly cargandoFechas = signal(false);
  readonly cargandoHorarios = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly exito = signal(false);

  constructor() {
    this.especialidadService.listar().subscribe((r) => this.especialidades.set(r.datos ?? []));
    this.sedeService.listar().subscribe((r) => {
      this.sedes.set(r.datos ?? []);
      if (this.sedeFija()) this.idSede.set(this.sedeFija()!);
    });
  }

  // --- Navegacion entre pasos (cada seleccion resetea lo de abajo) -----------

  elegirEspecialidad(id: number): void {
    this.idEspecialidad.set(id);
    if (!this.sedeFija()) this.idSede.set(null);
    this.resetDesdeMedico();
  }

  elegirSede(id: number): void {
    this.idSede.set(id);
    this.resetDesdeMedico();
  }

  cargarMedicos(): void {
    if (!this.idEspecialidad() || !this.idSede()) return;
    this.cargandoMedicos.set(true);
    this.medicoService
      .listar({ id_especialidad: this.idEspecialidad()!, id_sede: this.idSede()! })
      .subscribe({
        next: (r) => {
          this.medicos.set(r.datos ?? []);
          this.cargandoMedicos.set(false);
        },
        error: () => this.cargandoMedicos.set(false),
      });
  }

  elegirMedico(id: number): void {
    this.idMedico.set(id);
    this.fecha.set(null);
    this.hora.set(null);
    this.horarios.set([]);
    this.cargarFechas();
  }

  private cargarFechas(): void {
    this.cargandoFechas.set(true);
    this.disponibilidadService
      .fechas({
        id_medico: this.idMedico()!,
        id_especialidad: this.idEspecialidad()!,
        id_sede: this.idSede()!,
      })
      .subscribe({
        next: (r) => {
          this.fechas.set(r.datos ?? []);
          this.cargandoFechas.set(false);
        },
        error: () => this.cargandoFechas.set(false),
      });
  }

  elegirFecha(fecha: string): void {
    this.fecha.set(fecha);
    this.hora.set(null);
    this.cargandoHorarios.set(true);
    this.disponibilidadService
      .horarios({
        id_medico: this.idMedico()!,
        fecha,
        id_especialidad: this.idEspecialidad()!,
        id_sede: this.idSede()!,
      })
      .subscribe({
        next: (r) => {
          this.horarios.set(r.datos ?? []);
          this.cargandoHorarios.set(false);
        },
        error: () => this.cargandoHorarios.set(false),
      });
  }

  private resetDesdeMedico(): void {
    this.idMedico.set(null);
    this.fecha.set(null);
    this.hora.set(null);
    this.medicos.set([]);
    this.fechas.set([]);
    this.horarios.set([]);
  }

  nombreEspecialidad(): string {
    return this.especialidades().find((e) => e.id === this.idEspecialidad())?.descripcion ?? '';
  }
  nombreSede(): string {
    return this.sedes().find((s) => s.id === this.idSede())?.nombre ?? '';
  }
  nombreMedico(): string {
    const m = this.medicos().find((x) => x.id === this.idMedico());
    return m ? `${m.apellido}, ${m.nombre}` : '';
  }

  confirmar(): void {
    if (!this.nota().trim()) {
      this.error.set('La nota es obligatoria.');
      return;
    }
    this.error.set(null);
    this.guardando.set(true);
    this.turnoService
      .crear({
        id_especialidad: this.idEspecialidad()!,
        id_sede: this.idSede()!,
        id_medico: this.idMedico()!,
        fecha: this.fecha()!,
        hora: this.hora()!,
        nota: this.nota().trim(),
        id_paciente: this.idPaciente(),
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.exito.set(true);
          this.notificacionService.refrescarConteo();
          this.creado.emit();
        },
        error: (err) => {
          this.guardando.set(false);
          this.error.set(mensajeError(err));
          // El horario pudo ocuparse: refrescamos los horarios libres.
          if (this.fecha()) this.elegirFecha(this.fecha()!);
        },
      });
  }
}
