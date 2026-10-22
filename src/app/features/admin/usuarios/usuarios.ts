import { Component, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UsuarioService } from '../../../core/services/usuario.service';
import { SedeService } from '../../../core/services/sede.service';
import { ROL_LABEL, Rol, UsuarioAdmin } from '../../../core/models/usuario.model';
import { Sede } from '../../../core/models/sede.model';
import { Cargando } from '../../../shared/ui/cargando';
import { SinDatos } from '../../../shared/ui/sin-datos';
import { UsuarioFormDialog } from './usuario-form-dialog';

/** Gestion de usuarios (rol administrador): listado paginado + filtros + ABM. */
@Component({
  selector: 'app-usuarios',
  imports: [
    MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule,
    MatTooltipModule, Cargando, SinDatos,
  ],
  templateUrl: './usuarios.html',
})
export class Usuarios {
  private readonly usuarioService = inject(UsuarioService);
  private readonly sedeService = inject(SedeService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly usuarios = signal<UsuarioAdmin[]>([]);
  readonly total = signal(0);
  readonly cargando = signal(true);
  readonly sedes = signal<Sede[]>([]);
  readonly rolLabel = ROL_LABEL;
  readonly roles: Rol[] = ['admin', 'medico', 'operador', 'paciente'];

  /** Etiqueta legible del rol (acepta el valor crudo de la fila). */
  etiquetaRol(rol: string): string {
    return this.rolLabel[rol as Rol] ?? rol;
  }
  readonly columnas = ['nombre', 'dni', 'rol', 'sede', 'acciones'];

  // Filtros y paginacion (server-side).
  readonly fNombre = signal('');
  readonly fApellido = signal('');
  readonly fRol = signal<Rol | ''>('');
  readonly fSede = signal<number | null>(null);
  readonly pagina = signal(0);
  readonly tamano = signal(10);

  constructor() {
    this.sedeService.listar().subscribe((r) => this.sedes.set(r.datos ?? []));
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.usuarioService
      .listar({
        nombre: this.fNombre() || undefined,
        apellido: this.fApellido() || undefined,
        rol: this.fRol() || undefined,
        id_sede: this.fSede() || undefined,
        pagina: this.pagina() + 1,
        limite: this.tamano(),
      })
      .subscribe({
        next: (r) => {
          this.usuarios.set(r.datos?.usuarios ?? []);
          this.total.set(r.datos?.total ?? 0);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }

  filtrar(): void {
    this.pagina.set(0);
    this.cargar();
  }

  limpiar(): void {
    this.fNombre.set('');
    this.fApellido.set('');
    this.fRol.set('');
    this.fSede.set(null);
    this.filtrar();
  }

  paginar(e: PageEvent): void {
    this.pagina.set(e.pageIndex);
    this.tamano.set(e.pageSize);
    this.cargar();
  }

  nuevo(): void {
    this.abrir();
  }

  editar(usuario: UsuarioAdmin): void {
    this.abrir(usuario);
  }

  private abrir(usuario?: UsuarioAdmin): void {
    this.dialog
      .open(UsuarioFormDialog, { data: { usuario }, width: '620px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.snackBar.open(usuario ? 'Usuario modificado' : 'Usuario creado', 'Cerrar', { duration: 4000 });
          this.cargar();
        }
      });
  }
}
