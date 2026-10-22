import { Component, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';

import { AuditoriaService } from '../../../core/services/auditoria.service';
import { Auditoria as AuditoriaModel } from '../../../core/models/auditoria.model';
import { Cargando } from '../../../shared/ui/cargando';
import { SinDatos } from '../../../shared/ui/sin-datos';
import { aFechaISO } from '../../../core/utils/fechas';

/** Pantalla de auditoria de acciones sensibles (solo lectura, rol admin). */
@Component({
  selector: 'app-auditoria',
  imports: [
    MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule,
    MatCardModule, Cargando, SinDatos,
  ],
  templateUrl: './auditoria.html',
})
export class Auditoria {
  private readonly auditoriaService = inject(AuditoriaService);

  readonly registros = signal<AuditoriaModel[]>([]);
  readonly cargando = signal(true);
  readonly columnas = ['fecha', 'usuario', 'accion', 'entidad', 'detalle'];
  readonly entidades = ['usuario', 'sede', 'especialidad', 'cobertura'];

  // Filtros.
  readonly entidad = signal('');
  readonly desde = signal<Date | null>(null);
  readonly hasta = signal<Date | null>(null);
  readonly texto = signal('');

  // Paginacion (cliente).
  readonly pagina = signal(0);
  readonly tamano = signal(10);

  readonly filtrados = computed(() => {
    const t = this.texto().trim().toLowerCase();
    if (!t) return this.registros();
    return this.registros().filter((r) => r.usuario.toLowerCase().includes(t));
  });

  readonly pagados = computed(() => {
    const inicio = this.pagina() * this.tamano();
    return this.filtrados().slice(inicio, inicio + this.tamano());
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.pagina.set(0);
    this.auditoriaService
      .listar({
        entidad: this.entidad() || undefined,
        desde: this.desde() ? aFechaISO(this.desde()!) : undefined,
        hasta: this.hasta() ? aFechaISO(this.hasta()!) : undefined,
      })
      .subscribe({
        next: (r) => {
          this.registros.set(r.datos ?? []);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }

  limpiar(): void {
    this.entidad.set('');
    this.desde.set(null);
    this.hasta.set(null);
    this.texto.set('');
    this.cargar();
  }

  paginar(e: PageEvent): void {
    this.pagina.set(e.pageIndex);
    this.tamano.set(e.pageSize);
  }
}
