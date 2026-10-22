import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Cobertura } from '../models/cobertura.model';

/** Acceso al listado de coberturas usado en el registro de pacientes. */
@Injectable({ providedIn: 'root' })
export class CoberturaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/coberturas`;

  /** GET /coberturas -> listado publico de coberturas. */
  listar(): Observable<ApiResponse<Cobertura[]>> {
    return this.http.get<ApiResponse<Cobertura[]>>(this.baseUrl);
  }

  crear(cobertura: Omit<Cobertura, 'id'>): Observable<ApiResponse<Cobertura>> {
    return this.http.post<ApiResponse<Cobertura>>(this.baseUrl, cobertura);
  }

  modificar(id: number, cobertura: Omit<Cobertura, 'id'>): Observable<ApiResponse<Cobertura>> {
    return this.http.put<ApiResponse<Cobertura>>(`${this.baseUrl}/${id}`, cobertura);
  }

  eliminar(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }
}
