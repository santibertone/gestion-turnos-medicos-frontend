import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Especialidad } from '../models/especialidad.model';

/** Especialidades: listado (cualquier sesion) y ABM (solo administrador). */
@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/especialidades`;

  listar(): Observable<ApiResponse<Especialidad[]>> {
    return this.http.get<ApiResponse<Especialidad[]>>(this.baseUrl);
  }

  crear(especialidad: Omit<Especialidad, 'id'>): Observable<ApiResponse<Especialidad>> {
    return this.http.post<ApiResponse<Especialidad>>(this.baseUrl, especialidad);
  }

  modificar(id: number, especialidad: Omit<Especialidad, 'id'>): Observable<ApiResponse<Especialidad>> {
    return this.http.put<ApiResponse<Especialidad>>(`${this.baseUrl}/${id}`, especialidad);
  }

  eliminar(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }
}
