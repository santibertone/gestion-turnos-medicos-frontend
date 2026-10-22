import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CoberturaService } from '../../../core/services/cobertura.service';
import { AuthService } from '../../../core/services/auth.service';
import { TurnoWizard } from '../../../shared/turno-wizard/turno-wizard';

/** Nuevo turno (rol paciente): usa el wizard para si mismo. */
@Component({
  selector: 'app-nuevo-turno',
  imports: [MatIconModule, TurnoWizard],
  templateUrl: './nuevo-turno.html',
})
export class NuevoTurno {
  private readonly coberturaService = inject(CoberturaService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly coberturaNombre = signal<string | undefined>(undefined);

  constructor() {
    this.coberturaService.listar().subscribe((r) => {
      const id = this.auth.usuario()?.id_cobertura;
      this.coberturaNombre.set((r.datos ?? []).find((c) => c.id === id)?.nombre);
    });
  }

  onCreado(): void {
    this.snackBar.open('Turno confirmado correctamente', 'Cerrar', { duration: 4000 });
    this.router.navigate(['/paciente/turnos']);
  }
}
