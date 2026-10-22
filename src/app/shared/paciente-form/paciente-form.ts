import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { CoberturaService } from '../../core/services/cobertura.service';
import { Cobertura } from '../../core/models/cobertura.model';
import { RegistroRequest } from '../../core/models/auth.model';
import { aFechaISO } from '../../core/utils/fechas';

/**
 * Formulario reutilizable de alta de paciente (registro publico y alta por
 * operador). Expone obtenerDatos() que valida y devuelve los datos, o null.
 */
@Component({
  selector: 'app-paciente-form',
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule,
  ],
  templateUrl: './paciente-form.html',
})
export class PacienteForm {
  private readonly fb = inject(FormBuilder);
  private readonly coberturaService = inject(CoberturaService);

  readonly coberturas = signal<Cobertura[]>([]);
  readonly ocultarPassword = signal(true);
  readonly maxFecha = new Date();

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.maxLength(100)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fechaNacimiento: [null as Date | null, [Validators.required]],
    idCobertura: [null as number | null, [Validators.required]],
    telefono: [''],
  });

  constructor() {
    this.coberturaService.listar().subscribe((r) => this.coberturas.set(r.datos ?? []));
  }

  /** Valida el formulario y devuelve los datos del paciente, o null si es invalido. */
  obtenerDatos(): RegistroRequest | null {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return null;
    }
    const v = this.form.getRawValue();
    return {
      nombre: v.nombre,
      apellido: v.apellido,
      dni: v.dni,
      email: v.email,
      password: v.password,
      fecha_nacimiento: aFechaISO(v.fechaNacimiento!),
      id_cobertura: v.idCobertura!,
      telefono: v.telefono,
    };
  }

  reiniciar(): void {
    this.form.reset();
  }
}
