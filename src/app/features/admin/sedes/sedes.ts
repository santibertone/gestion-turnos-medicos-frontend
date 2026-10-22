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

import { SedeService } from '../../../core/services/sede.service';
import { Sede } from '../../../core/models/sede.model';
import { Cargando } from '../../../shared/ui/cargando';
import { SinDatos } from '../../../shared/ui/sin-datos';
import { EntidadFormDialog } from '../../../shared/entidad-form/entidad-form-dialog';
import { ConfirmarService } from '../../../shared/confirmar/confirmar.service';
import { mensajeError } from '../../../core/utils/errores';

/** ABM de sedes (rol administrador): tabla, filtro, alta/edicion y baja. */
@Component({
  selector: 'app-sedes',
  imports: [
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatCardModule, MatTooltipModule, Cargando, SinDatos,
  ],
  templateUrl: './sedes.html',
})
export class Sedes {
  private readonly sedeService = inject(SedeService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmar = inject(ConfirmarService);
  private readonly snackBar = inject(MatSnackBar);

  readonly sedes = signal<Sede[]>([]);
  readonly cargando = signal(true);
  readonly filtro = signal('');
  readonly columnas = ['nombre', 'direccion', 'telefono', 'acciones'];

  readonly filtradas = computed(() => {
    const f = this.filtro().trim().toLowerCase();
    if (!f) return this.sedes();
    return this.sedes().filter((s) =>
      `${s.nombre} ${s.direccion} ${s.telefono}`.toLowerCase().includes(f),
    );
  });

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.sedeService.listar().subscribe({
      next: (r) => {
        this.sedes.set(r.datos ?? []);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirForm(sede?: Sede): void {
    const edicion = !!sede;
    this.dialog
      .open(EntidadFormDialog, {
        data: {
          titulo: edicion ? 'Editar sede' : 'Nueva sede',
          campos: [
            { nombre: 'nombre', label: 'Nombre', requerido: true },
            { nombre: 'direccion', label: 'Direccion', requerido: true },
            { nombre: 'telefono', label: 'Telefono', requerido: true },
          ],
          valores: sede,
          guardar: (v: Record<string, unknown>) =>
            edicion
              ? this.sedeService.modificar(sede!.id, v as unknown as Omit<Sede, 'id'>)
              : this.sedeService.crear(v as unknown as Omit<Sede, 'id'>),
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.notificar(edicion ? 'Sede modificada' : 'Sede creada');
          this.cargar();
        }
      });
  }

  eliminar(sede: Sede): void {
    this.confirmar
      .confirmar({
        titulo: 'Eliminar sede',
        mensaje: `¿Estas seguro de eliminar la sede "${sede.nombre}"?`,
        confirmar: 'Eliminar',
        peligro: true,
      })
      .subscribe((ok) => {
        if (!ok) return;
        this.sedeService.eliminar(sede.id).subscribe({
          next: () => {
            this.notificar('Sede eliminada');
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
