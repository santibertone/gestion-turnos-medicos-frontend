import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** Opciones del dialogo de confirmacion. */
export interface ConfirmarData {
  titulo: string;
  mensaje: string;
  confirmar?: string;
  cancelar?: string;
  peligro?: boolean;
}

/** Dialogo generico de confirmacion (usado antes de bajas y acciones sensibles). */
@Component({
  selector: 'app-confirmar-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>
      <p>{{ data.mensaje }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cerrar(false)">{{ data.cancelar || 'Cancelar' }}</button>
      <button
        mat-flat-button
        [color]="data.peligro ? 'warn' : 'primary'"
        (click)="cerrar(true)"
      >
        {{ data.confirmar || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmarDialog {
  readonly data = inject<ConfirmarData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ConfirmarDialog>);

  cerrar(ok: boolean): void {
    this.ref.close(ok);
  }
}
