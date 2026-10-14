import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';

import { AuthService } from '../../../core/services/auth.service';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { Cobertura } from '../../../core/models/cobertura.model';
import { mensajeError } from '../../../core/utils/errores';

/** Formulario de registro de pacientes. */
@Component({
  selector: 'app-registro',
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly coberturaService = inject(CoberturaService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly cargando = signal(false);
  readonly errorBackend = signal<string | null>(null);
  readonly ocultarPassword = signal(true);
  readonly coberturas = signal<Cobertura[]>([]);
  readonly maxFecha = new Date();

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.maxLength(100)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fechaNacimiento: [null as Date | null, [Validators.required]],
    idCobertura: [null as number | null, [Validators.required]],
  });

  constructor() {
    this.cargarCoberturas();
  }

  private cargarCoberturas(): void {
    this.coberturaService.listar().subscribe({
      next: (respuesta) => this.coberturas.set(respuesta.datos ?? []),
      error: (err) => this.errorBackend.set(mensajeError(err)),
    });
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorBackend.set(null);

    const v = this.form.getRawValue();
    this.auth
      .registro({
        nombre: v.nombre,
        apellido: v.apellido,
        dni: v.dni,
        email: v.email,
        password: v.password,
        fecha_nacimiento: this.formatearFecha(v.fechaNacimiento!),
        id_cobertura: v.idCobertura!,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Registro exitoso. Ya podes iniciar sesion.', 'Cerrar', {
            duration: 5000,
          });
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.errorBackend.set(mensajeError(err));
          this.cargando.set(false);
        },
      });
  }

  /** Convierte una fecha a formato YYYY-MM-DD (sin desfase por zona horaria). */
  private formatearFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
