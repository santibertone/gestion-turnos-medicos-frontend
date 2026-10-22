import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiResponse } from '../../core/models/api-response.model';
import { mensajeError } from '../../core/utils/errores';

/** Definicion de un campo del formulario generico. */
export interface CampoConfig {
  nombre: string;
  label: string;
  tipo?: 'text' | 'number' | 'textarea';
  requerido?: boolean;
}

/** Datos de entrada del dialogo generico de alta/edicion. */
export interface EntidadFormData {
  titulo: string;
  campos: CampoConfig[];
  valores?: Record<string, unknown>;
  // El padre define como guardar (alta o edicion); el dialogo muestra el error.
  guardar: (valores: Record<string, unknown>) => Observable<ApiResponse<unknown>>;
}

/**
 * Dialogo reutilizable para el alta/edicion de entidades simples (sedes,
 * especialidades, coberturas). Arma el formulario a partir de `campos`,
 * valida antes de enviar y muestra los errores del backend sin cerrarse.
 */
@Component({
  selector: 'app-entidad-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './entidad-form-dialog.html',
  styleUrl: './entidad-form-dialog.scss',
})
export class EntidadFormDialog {
  readonly data = inject<EntidadFormData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<EntidadFormDialog>);
  private readonly fb = inject(FormBuilder);

  readonly cargando = signal(false);
  readonly errorBackend = signal<string | null>(null);

  readonly form = this.fb.group(
    this.data.campos.reduce((grupo, campo) => {
      const valor = this.data.valores?.[campo.nombre] ?? '';
      grupo[campo.nombre] = [valor, campo.requerido ? [Validators.required] : []];
      return grupo;
    }, {} as Record<string, unknown>),
  );

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.errorBackend.set(null);
    this.data.guardar(this.form.getRawValue()).subscribe({
      next: () => this.ref.close(true),
      error: (err) => {
        this.errorBackend.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }
}
