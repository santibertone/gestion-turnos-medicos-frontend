import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { Usuario } from '../../../core/models/usuario.model';
import { Cobertura } from '../../../core/models/cobertura.model';
import { Cargando } from '../../../shared/ui/cargando';
import { mensajeError } from '../../../core/utils/errores';

/** Validador: la contrasena y su repeticion deben coincidir. */
function passwordsCoinciden(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const rep = group.get('passwordRepetir')?.value;
  return pass && pass !== rep ? { noCoincide: true } : null;
}

/** Mis datos personales (rol paciente): lectura + edicion de campos permitidos. */
@Component({
  selector: 'app-mis-datos',
  imports: [
    DatePipe, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, Cargando,
  ],
  templateUrl: './mis-datos.html',
})
export class MisDatos {
  private readonly auth = inject(AuthService);
  private readonly pacienteService = inject(PacienteService);
  private readonly coberturaService = inject(CoberturaService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly usuario = signal<Usuario | null>(null);
  readonly coberturas = signal<Cobertura[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly ocultarPass = signal(true);

  readonly form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      idCobertura: [null as number | null, [Validators.required]],
      password: [''],
      passwordRepetir: [''],
    },
    { validators: passwordsCoinciden },
  );

  constructor() {
    this.coberturaService.listar().subscribe((r) => this.coberturas.set(r.datos ?? []));
    this.auth.perfil().subscribe({
      next: (r) => {
        const u = r.datos;
        this.usuario.set(u);
        this.form.patchValue({
          email: u.email,
          telefono: u.telefono ?? '',
          idCobertura: u.id_cobertura,
        });
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  guardar(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.hasError('noCoincide')) {
        this.error.set('Las contrasenas no coinciden.');
      }
      return;
    }
    const v = this.form.getRawValue();
    if (v.password && v.password.length < 6) {
      this.error.set('La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    this.guardando.set(true);
    this.pacienteService
      .actualizarMisDatos({
        email: v.email,
        telefono: v.telefono,
        id_cobertura: v.idCobertura!,
        password: v.password || undefined,
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.snackBar.open('Datos actualizados correctamente', 'Cerrar', { duration: 4000 });
          this.form.patchValue({ password: '', passwordRepetir: '' });
          this.auth.perfil().subscribe();
        },
        error: (err) => {
          this.guardando.set(false);
          this.error.set(mensajeError(err));
        },
      });
  }
}
