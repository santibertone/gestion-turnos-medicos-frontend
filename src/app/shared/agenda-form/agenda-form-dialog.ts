import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AgendaService } from '../../core/services/agenda.service';
import { Agenda } from '../../core/models/agenda.model';
import { Especialidad } from '../../core/models/especialidad.model';
import { Sede } from '../../core/models/sede.model';
import { Medico } from '../../core/models/medico.model';
import { mensajeError } from '../../core/utils/errores';
import { aFechaISO } from '../../core/utils/fechas';

/**
 * Datos del dialogo de agenda. Soporta dos contextos:
 *  - medico:   id fijo (medicoId) + sus especialidades; elige la sede.
 *  - operador: elige el medico (medicos) y la sede queda fija a la suya (sedeFija).
 */
export interface AgendaFormData {
  agenda?: Agenda;
  medicoId?: number;
  especialidadesMedico?: Especialidad[];
  sedes?: Sede[];
  sedePreseleccionada?: number;
  medicos?: Medico[];
  sedeFija?: number;
}

/** Alta/edicion de un rango horario de agenda (medico u operador). */
@Component({
  selector: 'app-agenda-form-dialog',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './agenda-form-dialog.html',
})
export class AgendaFormDialog {
  readonly data = inject<AgendaFormData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<AgendaFormDialog>);
  private readonly fb = inject(FormBuilder);
  private readonly agendaService = inject(AgendaService);

  readonly edicion = !!this.data.agenda;
  readonly esOperador = !!this.data.medicos;
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly sedes = this.data.sedes ?? [];
  readonly medicos = this.data.medicos ?? [];

  readonly form = this.fb.nonNullable.group({
    fecha: [new Date() as Date | null, [Validators.required]],
    horaEntrada: ['', [Validators.required]],
    horaSalida: ['', [Validators.required]],
    idEspecialidad: [null as number | null, [Validators.required]],
    idSede: [null as number | null, [Validators.required]],
    idMedico: [null as number | null],
  });

  readonly medicoSeleccionado = signal<number | null>(this.data.medicoId ?? null);

  /** Especialidades disponibles segun el contexto (medico fijo o medico elegido). */
  readonly especialidades = computed<Especialidad[]>(() => {
    if (!this.esOperador) {
      return this.data.especialidadesMedico ?? [];
    }
    const id = this.medicoSeleccionado();
    return this.medicos.find((m) => m.id === id)?.especialidades ?? [];
  });

  constructor() {
    const a = this.data.agenda;
    if (a) {
      this.form.patchValue({
        fecha: new Date(`${String(a.fecha).slice(0, 10)}T00:00:00`),
        horaEntrada: a.hora_entrada,
        horaSalida: a.hora_salida,
        idEspecialidad: a.id_especialidad,
        idSede: a.id_sede,
        idMedico: a.id_medico,
      });
      this.medicoSeleccionado.set(a.id_medico);
    } else {
      // Valores por defecto segun contexto.
      this.form.patchValue({
        idSede: this.esOperador ? (this.data.sedeFija ?? null) : (this.data.sedePreseleccionada ?? null),
        idMedico: this.data.medicoId ?? null,
      });
    }

    // El operador elige el medico; al cambiarlo se recalculan las especialidades.
    this.form.controls.idMedico.valueChanges.subscribe((id) => {
      this.medicoSeleccionado.set(id);
      this.form.controls.idEspecialidad.setValue(null);
    });
  }

  guardar(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (v.horaSalida <= v.horaEntrada) {
      this.error.set('La hora de salida debe ser posterior a la de entrada.');
      return;
    }

    const idMedico = this.esOperador ? v.idMedico! : this.data.medicoId!;
    const idSede = this.esOperador ? this.data.sedeFija! : v.idSede!;

    const payload = {
      hora_entrada: v.horaEntrada,
      hora_salida: v.horaSalida,
      fecha: aFechaISO(v.fecha!),
      id_medico: idMedico,
      id_especialidad: v.idEspecialidad!,
      id_sede: idSede,
    };

    this.cargando.set(true);
    const peticion = this.edicion
      ? this.agendaService.modificar(this.data.agenda!.id, payload)
      : this.agendaService.crear(payload);

    peticion.subscribe({
      next: () => this.ref.close(true),
      error: (err) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }
}
