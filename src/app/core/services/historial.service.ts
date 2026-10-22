import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Historial, HistorialRequest } from '../models/historial.model';

/** Historial clinico: registro (medico) y consulta por paciente. */
@Injectable({ providedIn: 'root' })
export class HistorialService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/historial`;

  registrar(historial: HistorialRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(this.baseUrl, historial);
  }

  consultarPorPaciente(idPaciente: number): Observable<ApiResponse<Historial[]>> {
    return this.http.get<ApiResponse<Historial[]>>(`${this.baseUrl}/paciente/${idPaciente}`);
  }
}
