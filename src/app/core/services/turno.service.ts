import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Turno, TurnoRequest } from '../models/turno.model';

/** Turnos: alta, cancelacion, atencion y los distintos listados por rol. */
@Injectable({ providedIn: 'root' })
export class TurnoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/turnos`;

  crear(turno: TurnoRequest): Observable<ApiResponse<Turno>> {
    return this.http.post<ApiResponse<Turno>>(this.baseUrl, turno);
  }

  cancelar(id: number): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  atender(id: number): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.baseUrl}/${id}/atender`, {});
  }

  /** Turnos del paciente autenticado. */
  misTurnos(): Observable<ApiResponse<Turno[]>> {
    return this.http.get<ApiResponse<Turno[]>>(`${this.baseUrl}/mis-turnos`);
  }

  /** Turnos del medico autenticado (en todas sus sedes, con filtros opcionales). */
  turnosDelMedico(filtros?: { fecha?: string; id_sede?: number }): Observable<ApiResponse<Turno[]>> {
    let params = new HttpParams();
    if (filtros?.fecha) params = params.set('fecha', filtros.fecha);
    if (filtros?.id_sede) params = params.set('id_sede', filtros.id_sede);
    return this.http.get<ApiResponse<Turno[]>>(`${this.baseUrl}/agenda-medico`, { params });
  }

  /** Turnos de la sede del operador autenticado (con filtros opcionales). */
  turnosDeLaSede(filtros?: { fecha?: string; id_medico?: number }): Observable<ApiResponse<Turno[]>> {
    let params = new HttpParams();
    if (filtros?.fecha) params = params.set('fecha', filtros.fecha);
    if (filtros?.id_medico) params = params.set('id_medico', filtros.id_medico);
    return this.http.get<ApiResponse<Turno[]>>(`${this.baseUrl}/sede`, { params });
  }
}
