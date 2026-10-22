import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Turno } from '../../../core/models/turno.model';

/** Carga del historial clinico al marcar un turno como atendido. */
@Component({
  selector: 'app-atender-dialog',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Marcar como atendido</h2>
    <mat-dialog-content>
      <p class="atender__paciente">
        Paciente: <strong>{{ data.turno.paciente_apellido }}, {{ data.turno.paciente_nombre }}</strong>
      </p>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Diagnostico</mat-label>
          <textarea matInput formControlName="diagnostico" rows="2"></textarea>
          @if (form.controls.diagnostico.hasError('required')) {
            <mat-error>El diagnostico es obligatorio.</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Tratamiento</mat-label>
          <textarea matInput formControlName="tratamiento" rows="2"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button (click)="guardar()">Confirmar atencion</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .atender__paciente { margin: 0 0 1rem; }
    .form-grid mat-form-field { width: 100%; }
    mat-dialog-content { min-width: 360px; }
  `],
})
export class AtenderDialog {
  readonly data = inject<{ turno: Turno }>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<AtenderDialog>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    diagnostico: ['', [Validators.required]],
    tratamiento: [''],
    observaciones: [''],
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.ref.close(this.form.getRawValue());
  }
}
