import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Notificacion } from '../models/notificacion.model';

/**
 * Notificaciones del usuario. Mantiene un signal con la cantidad de no leidas
 * para el contador de la campana del header, que se actualiza al instante tras
 * marcar como leida o al refrescar luego de una accion sobre un turno.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notificaciones`;

  /** Cantidad de notificaciones no leidas (consumido por el header). */
  readonly noLeidas = signal(0);

  listar(): Observable<ApiResponse<Notificacion[]>> {
    return this.http.get<ApiResponse<Notificacion[]>>(this.baseUrl);
  }

  /** Refresca el contador de no leidas desde el backend. */
  refrescarConteo(): void {
    this.http
      .get<ApiResponse<{ cantidad: number }>>(`${this.baseUrl}/no-leidas`)
      .subscribe({
        next: (r) => this.noLeidas.set(r.datos?.cantidad ?? 0),
        error: () => this.noLeidas.set(0),
      });
  }

  marcarLeida(id: number): Observable<ApiResponse<unknown>> {
    return this.http
      .put<ApiResponse<unknown>>(`${this.baseUrl}/${id}/leer`, {})
      .pipe(tap(() => this.noLeidas.update((n) => Math.max(0, n - 1))));
  }

  /** Reinicia el contador al cerrar sesion. */
  limpiar(): void {
    this.noLeidas.set(0);
  }
}
