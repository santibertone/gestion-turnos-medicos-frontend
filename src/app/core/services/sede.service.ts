import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Sede } from '../models/sede.model';

/** Sedes: listado (cualquier sesion) y ABM (solo administrador). */
@Injectable({ providedIn: 'root' })
export class SedeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/sedes`;

  listar(): Observable<ApiResponse<Sede[]>> {
    return this.http.get<ApiResponse<Sede[]>>(this.baseUrl);
  }

  crear(sede: Omit<Sede, 'id'>): Observable<ApiResponse<Sede>> {
    return this.http.post<ApiResponse<Sede>>(this.baseUrl, sede);
  }

  modificar(id: number, sede: Omit<Sede, 'id'>): Observable<ApiResponse<Sede>> {
    return this.http.put<ApiResponse<Sede>>(`${this.baseUrl}/${id}`, sede);
  }

  eliminar(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }
}
