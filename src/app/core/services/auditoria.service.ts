import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Auditoria } from '../models/auditoria.model';

/** Consulta de la auditoria de acciones sensibles (rol administrador). */
@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auditoria`;

  listar(filtros: {
    id_usuario?: number;
    entidad?: string;
    desde?: string;
    hasta?: string;
  }): Observable<ApiResponse<Auditoria[]>> {
    let params = new HttpParams();
    if (filtros.id_usuario) params = params.set('id_usuario', filtros.id_usuario);
    if (filtros.entidad) params = params.set('entidad', filtros.entidad);
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    return this.http.get<ApiResponse<Auditoria[]>>(this.baseUrl, { params });
  }
}
