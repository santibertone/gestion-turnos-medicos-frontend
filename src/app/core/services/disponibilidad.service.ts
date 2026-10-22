import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

/** Disponibilidad para solicitar turnos (paciente / operador). */
@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/disponibilidad`;

  /** Fechas en las que el medico tiene agenda para esa especialidad y sede. */
  fechas(p: { id_medico: number; id_especialidad: number; id_sede: number }): Observable<ApiResponse<string[]>> {
    const params = new HttpParams()
      .set('id_medico', p.id_medico)
      .set('id_especialidad', p.id_especialidad)
      .set('id_sede', p.id_sede);
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/fechas`, { params });
  }

  /** Horarios libres del medico en esa fecha, especialidad y sede. */
  horarios(p: {
    id_medico: number;
    fecha: string;
    id_especialidad: number;
    id_sede: number;
  }): Observable<ApiResponse<string[]>> {
    const params = new HttpParams()
      .set('id_medico', p.id_medico)
      .set('fecha', p.fecha)
      .set('id_especialidad', p.id_especialidad)
      .set('id_sede', p.id_sede);
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/horarios`, { params });
  }
}
