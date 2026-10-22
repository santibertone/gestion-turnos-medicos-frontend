import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UsuarioService } from '../../../core/services/usuario.service';
import { SedeService } from '../../../core/services/sede.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { Sede } from '../../../core/models/sede.model';
import { Especialidad } from '../../../core/models/especialidad.model';
import { Cobertura } from '../../../core/models/cobertura.model';
import { Rol, UsuarioAdmin } from '../../../core/models/usuario.model';
import { mensajeError } from '../../../core/utils/errores';
import { aFechaISO } from '../../../core/utils/fechas';

/** Alta y edicion de usuarios (rol administrador), con campos segun el rol. */
@Component({
  selector: 'app-usuario-form-dialog',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './usuario-form-dialog.html',
})
export class UsuarioFormDialog {
  private readonly data = inject<{ usuario?: UsuarioAdmin }>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<UsuarioFormDialog>);
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly sedeService = inject(SedeService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly coberturaService = inject(CoberturaService);

  readonly edicion = !!this.data.usuario;
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly ocultarPass = signal(true);
  readonly maxFecha = new Date();

  readonly sedes = signal<Sede[]>([]);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly coberturas = signal<Cobertura[]>([]);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    fechaNacimiento: [null as Date | null, [Validators.required]],
    telefono: [''],
    rol: ['operador' as Rol, [Validators.required]],
    password: [''],
    idSede: [null as number | null],
    idCobertura: [null as number | null],
    especialidades: [[] as number[]],
  });

  readonly rolActual = signal<Rol>('operador');

  constructor() {
    // Datos de referencia para los selects.
    forkJoin({
      sedes: this.sedeService.listar(),
      especialidades: this.especialidadService.listar(),
      coberturas: this.coberturaService.listar(),
    }).subscribe((r) => {
      this.sedes.set(r.sedes.datos ?? []);
      this.especialidades.set(r.especialidades.datos ?? []);
      this.coberturas.set(r.coberturas.datos ?? []);
    });

    this.form.controls.rol.valueChanges.subscribe((rol) => this.rolActual.set(rol));

    if (this.data.usuario) {
      const u = this.data.usuario;
      this.form.patchValue({
        nombre: u.nombre,
        apellido: u.apellido,
        dni: u.dni,
        email: u.email,
        fechaNacimiento: new Date(`${String(u.fecha_nacimiento).slice(0, 10)}T00:00:00`),
        telefono: u.telefono ?? '',
        rol: u.rol,
        idSede: u.id_sede,
        idCobertura: u.id_cobertura,
        especialidades: u.especialidades?.map((e) => e.id) ?? [],
      });
      this.rolActual.set(u.rol);
      // El rol no se cambia en la edicion.
      this.form.controls.rol.disable();
    }
  }

  readonly esAdmin = computed(() => this.rolActual() === 'admin');
  readonly esMedico = computed(() => this.rolActual() === 'medico');
  readonly esPaciente = computed(() => this.rolActual() === 'paciente');
  readonly necesitaSede = computed(() => this.rolActual() === 'operador' || this.rolActual() === 'medico');

  guardar(): void {
    this.error.set(null);
    const v = this.form.getRawValue();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.edicion && (!v.password || v.password.length < 6)) {
      this.error.set('La contrasena es obligatoria (minimo 6 caracteres).');
      return;
    }
    if (this.necesitaSede() && !v.idSede) {
      this.error.set('La sede es obligatoria para operador y medico.');
      return;
    }
    if (this.esMedico() && (!v.especialidades || v.especialidades.length === 0)) {
      this.error.set('El medico debe tener al menos una especialidad.');
      return;
    }

    this.cargando.set(true);
    const fecha = aFechaISO(v.fechaNacimiento!);

    const peticion = this.edicion
      ? this.usuarioService.modificar(this.data.usuario!.id, {
          nombre: v.nombre,
          apellido: v.apellido,
          dni: v.dni,
          email: v.email,
          fecha_nacimiento: fecha,
          telefono: v.telefono,
          id_sede: this.esAdmin() ? null : v.idSede,
          id_cobertura: this.esPaciente() ? v.idCobertura : null,
          password: v.password || undefined,
          especialidades: this.esMedico() ? v.especialidades : undefined,
        })
      : this.usuarioService.crear({
          nombre: v.nombre,
          apellido: v.apellido,
          dni: v.dni,
          email: v.email,
          password: v.password,
          fecha_nacimiento: fecha,
          rol: v.rol,
          telefono: v.telefono,
          id_sede: this.esAdmin() ? null : v.idSede,
          especialidades: this.esMedico() ? v.especialidades : undefined,
        });

    peticion.subscribe({
      next: () => this.ref.close(true),
      error: (err) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }
}
