import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Agenda, AgendaRequest } from '../models/agenda.model';

/** Agenda medica: la usan medico (la propia) y operador (por sede). */
@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/agenda`;

  listar(filtros?: { id_medico?: number; id_sede?: number; fecha?: string }): Observable<ApiResponse<Agenda[]>> {
    let params = new HttpParams();
    if (filtros?.id_medico) params = params.set('id_medico', filtros.id_medico);
    if (filtros?.id_sede) params = params.set('id_sede', filtros.id_sede);
    if (filtros?.fecha) params = params.set('fecha', filtros.fecha);
    return this.http.get<ApiResponse<Agenda[]>>(this.baseUrl, { params });
  }

  crear(agenda: AgendaRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(this.baseUrl, agenda);
  }

  modificar(id: number, agenda: AgendaRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.baseUrl}/${id}`, agenda);
  }

  eliminar(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }
}
