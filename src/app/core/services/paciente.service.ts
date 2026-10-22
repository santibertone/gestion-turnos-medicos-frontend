import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { MisDatosRequest, Paciente } from '../models/paciente.model';

/** Pacientes: busqueda (operador/medico/admin) y auto-edicion del paciente. */
@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pacientes`;

  buscar(busqueda: string): Observable<ApiResponse<Paciente[]>> {
    const params = new HttpParams().set('busqueda', busqueda);
    return this.http.get<ApiResponse<Paciente[]>>(this.baseUrl, { params });
  }

  actualizarMisDatos(datos: MisDatosRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.baseUrl}/mis-datos`, datos);
  }
}
