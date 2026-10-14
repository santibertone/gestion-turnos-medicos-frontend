import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Rol, Usuario } from '../models/usuario.model';
import {
  LoginRequest,
  LoginResponse,
  RegistroRequest,
  RegistroResponse,
} from '../models/auth.model';

const TOKEN_KEY = 'turnos_token';

/** Payload que viaja dentro del JWT emitido por el backend. */
interface TokenPayload {
  id: number;
  rol: Rol;
  id_sede: number | null;
  exp: number;
  iat: number;
}

/**
 * Servicio central de autenticacion.
 *  - Guarda el token en localStorage para mantener la sesion al recargar.
 *  - Expone signals reactivas (token, rol, usuario, isAuthenticated) que el
 *    resto de la app consume para mostrar/ocultar opciones y proteger rutas.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  /** Token actual (se inicializa desde localStorage para persistir la sesion). */
  private readonly token = signal<string | null>(this.leerTokenGuardado());

  /** Perfil completo del usuario logueado (nombre, email, etc.). */
  private readonly usuarioActual = signal<Usuario | null>(null);

  /** Datos publicos de solo lectura para los componentes. */
  readonly usuario = this.usuarioActual.asReadonly();
  readonly rol = computed<Rol | null>(() => this.decodificar(this.token())?.rol ?? null);
  readonly isAuthenticated = computed<boolean>(() => !this.tokenVencido(this.token()));

  constructor() {
    // Si al iniciar la app hay un token valido, recuperamos el perfil para
    // tener el nombre del usuario disponible en el header.
    if (this.isAuthenticated()) {
      this.refrescarPerfil();
    } else {
      this.limpiarSesion();
    }
  }

  /** POST /auth/login -> guarda el token y carga el perfil. */
  login(credenciales: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.baseUrl}/login`, credenciales)
      .pipe(
        tap((respuesta) => {
          this.guardarToken(respuesta.datos.token);
          this.refrescarPerfil();
        }),
      );
  }

  /** POST /auth/registro -> alta de paciente (no inicia sesion). */
  registro(datos: RegistroRequest): Observable<ApiResponse<RegistroResponse>> {
    return this.http.post<ApiResponse<RegistroResponse>>(`${this.baseUrl}/registro`, datos);
  }

  /** GET /auth/perfil -> datos del usuario logueado. */
  perfil(): Observable<ApiResponse<Usuario>> {
    return this.http
      .get<ApiResponse<Usuario>>(`${this.baseUrl}/perfil`)
      .pipe(tap((respuesta) => this.usuarioActual.set(respuesta.datos)));
  }

  /** Cierra la sesion: borra el token y los datos del usuario. */
  logout(): void {
    this.limpiarSesion();
  }

  /** Token crudo para que lo use el interceptor HTTP. */
  obtenerToken(): string | null {
    return this.token();
  }

  // --- Helpers privados -----------------------------------------------------

  private refrescarPerfil(): void {
    this.perfil().subscribe({
      // Si el token quedo invalido en el servidor, cerramos la sesion.
      error: () => this.limpiarSesion(),
    });
  }

  private guardarToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.token.set(token);
  }

  private limpiarSesion(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.usuarioActual.set(null);
  }

  private leerTokenGuardado(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private tokenVencido(token: string | null): boolean {
    const payload = this.decodificar(token);
    if (!payload) {
      return true;
    }
    // exp viaja en segundos; Date.now() en milisegundos.
    return payload.exp * 1000 <= Date.now();
  }

  /** Decodifica el payload del JWT sin librerias externas. */
  private decodificar(token: string | null): TokenPayload | null {
    if (!token) {
      return null;
    }
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json) as TokenPayload;
    } catch {
      return null;
    }
  }
}
