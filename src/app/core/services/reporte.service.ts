import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  RankingMedico,
  TasaCancelacion,
  TurnosPorEspecialidad,
  TurnosPorSede,
} from '../models/reporte.model';

/** Rango de fechas opcional para filtrar los reportes. */
export interface RangoFechas {
  desde?: string;
  hasta?: string;
}

/** Reportes y estadisticas (rol administrador). */
@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reportes`;

  private params(rango?: RangoFechas): HttpParams {
    let params = new HttpParams();
    if (rango?.desde) params = params.set('desde', rango.desde);
    if (rango?.hasta) params = params.set('hasta', rango.hasta);
    return params;
  }

  turnosPorEspecialidad(rango?: RangoFechas): Observable<ApiResponse<TurnosPorEspecialidad[]>> {
    return this.http.get<ApiResponse<TurnosPorEspecialidad[]>>(
      `${this.baseUrl}/turnos-por-especialidad`,
      { params: this.params(rango) },
    );
  }

  turnosPorSede(rango?: RangoFechas): Observable<ApiResponse<TurnosPorSede[]>> {
    return this.http.get<ApiResponse<TurnosPorSede[]>>(`${this.baseUrl}/turnos-por-sede`, {
      params: this.params(rango),
    });
  }

  rankingMedicos(rango?: RangoFechas): Observable<ApiResponse<RankingMedico[]>> {
    return this.http.get<ApiResponse<RankingMedico[]>>(`${this.baseUrl}/ranking-medicos`, {
      params: this.params(rango),
    });
  }

  tasaCancelacion(rango?: RangoFechas): Observable<ApiResponse<TasaCancelacion>> {
    return this.http.get<ApiResponse<TasaCancelacion>>(`${this.baseUrl}/tasa-cancelacion`, {
      params: this.params(rango),
    });
  }
}
