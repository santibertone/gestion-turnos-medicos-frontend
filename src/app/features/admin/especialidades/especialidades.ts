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

import { EspecialidadService } from '../../../core/services/especialidad.service';
import { Especialidad } from '../../../core/models/especialidad.model';
import { Cargando } from '../../../shared/ui/cargando';
import { SinDatos } from '../../../shared/ui/sin-datos';
import { EntidadFormDialog } from '../../../shared/entidad-form/entidad-form-dialog';
import { ConfirmarService } from '../../../shared/confirmar/confirmar.service';
import { mensajeError } from '../../../core/utils/errores';

/** ABM de especialidades (rol administrador). */
@Component({
  selector: 'app-especialidades',
  imports: [
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatCardModule, MatTooltipModule, Cargando, SinDatos,
  ],
  templateUrl: './especialidades.html',
})
export class Especialidades {
  private readonly especialidadService = inject(EspecialidadService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmar = inject(ConfirmarService);
  private readonly snackBar = inject(MatSnackBar);

  readonly especialidades = signal<Especialidad[]>([]);
  readonly cargando = signal(true);
  readonly filtro = signal('');
  readonly columnas = ['descripcion', 'acciones'];

  readonly filtradas = computed(() => {
    const f = this.filtro().trim().toLowerCase();
    if (!f) return this.especialidades();
    return this.especialidades().filter((e) => e.descripcion.toLowerCase().includes(f));
  });

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.especialidadService.listar().subscribe({
      next: (r) => {
        this.especialidades.set(r.datos ?? []);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirForm(especialidad?: Especialidad): void {
    const edicion = !!especialidad;
    this.dialog
      .open(EntidadFormDialog, {
        data: {
          titulo: edicion ? 'Editar especialidad' : 'Nueva especialidad',
          campos: [{ nombre: 'descripcion', label: 'Descripcion', requerido: true }],
          valores: especialidad,
          guardar: (v: Record<string, unknown>) =>
            edicion
              ? this.especialidadService.modificar(especialidad!.id, v as unknown as Omit<Especialidad, 'id'>)
              : this.especialidadService.crear(v as unknown as Omit<Especialidad, 'id'>),
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.notificar(edicion ? 'Especialidad modificada' : 'Especialidad creada');
          this.cargar();
        }
      });
  }

  eliminar(especialidad: Especialidad): void {
    this.confirmar
      .confirmar({
        titulo: 'Eliminar especialidad',
        mensaje: `¿Estas seguro de eliminar "${especialidad.descripcion}"?`,
        confirmar: 'Eliminar',
        peligro: true,
      })
      .subscribe((ok) => {
        if (!ok) return;
        this.especialidadService.eliminar(especialidad.id).subscribe({
          next: () => {
            this.notificar('Especialidad eliminada');
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
