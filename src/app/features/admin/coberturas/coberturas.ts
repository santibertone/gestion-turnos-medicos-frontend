import { Component, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CoberturaService } from '../../../core/services/cobertura.service';
import { Cobertura } from '../../../core/models/cobertura.model';
import { Cargando } from '../../../shared/ui/cargando';
import { SinDatos } from '../../../shared/ui/sin-datos';
import { EntidadFormDialog } from '../../../shared/entidad-form/entidad-form-dialog';
import { ConfirmarService } from '../../../shared/confirmar/confirmar.service';
import { mensajeError } from '../../../core/utils/errores';

/** ABM de coberturas (rol administrador). */
@Component({
  selector: 'app-coberturas',
  imports: [
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatCardModule, MatTooltipModule, Cargando, SinDatos,
  ],
  templateUrl: './coberturas.html',
})
export class Coberturas {
  private readonly coberturaService = inject(CoberturaService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmar = inject(ConfirmarService);
  private readonly snackBar = inject(MatSnackBar);

  readonly coberturas = signal<Cobertura[]>([]);
  readonly cargando = signal(true);
  readonly filtro = signal('');
  readonly columnas = ['nombre', 'acciones'];

  readonly filtradas = computed(() => {
    const f = this.filtro().trim().toLowerCase();
    if (!f) return this.coberturas();
    return this.coberturas().filter((c) => c.nombre.toLowerCase().includes(f));
  });

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.coberturaService.listar().subscribe({
      next: (r) => {
        this.coberturas.set(r.datos ?? []);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirForm(cobertura?: Cobertura): void {
    const edicion = !!cobertura;
    this.dialog
      .open(EntidadFormDialog, {
        data: {
          titulo: edicion ? 'Editar cobertura' : 'Nueva cobertura',
          campos: [{ nombre: 'nombre', label: 'Nombre', requerido: true }],
          valores: cobertura,
          guardar: (v: Record<string, unknown>) =>
            edicion
              ? this.coberturaService.modificar(cobertura!.id, v as unknown as Omit<Cobertura, 'id'>)
              : this.coberturaService.crear(v as unknown as Omit<Cobertura, 'id'>),
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.notificar(edicion ? 'Cobertura modificada' : 'Cobertura creada');
          this.cargar();
        }
      });
  }

  eliminar(cobertura: Cobertura): void {
    this.confirmar
      .confirmar({
        titulo: 'Eliminar cobertura',
        mensaje: `¿Estas seguro de eliminar "${cobertura.nombre}"?`,
        confirmar: 'Eliminar',
        peligro: true,
      })
      .subscribe((ok) => {
        if (!ok) return;
        this.coberturaService.eliminar(cobertura.id).subscribe({
          next: () => {
            this.notificar('Cobertura eliminada');
            this.cargar();
          },
          error: (err) => this.notificar(mensajeError(err)),
        });
      });
  }

  private notificar(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}
