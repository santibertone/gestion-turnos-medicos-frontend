import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { UsuarioCrear, UsuarioEditar, UsuariosPagina } from '../models/usuario.model';

/** Gestion de usuarios (rol administrador). */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  listar(filtros: {
    nombre?: string;
    apellido?: string;
    rol?: string;
    id_sede?: number;
    pagina?: number;
    limite?: number;
  }): Observable<ApiResponse<UsuariosPagina>> {
    let params = new HttpParams();
    if (filtros.nombre) params = params.set('nombre', filtros.nombre);
    if (filtros.apellido) params = params.set('apellido', filtros.apellido);
    if (filtros.rol) params = params.set('rol', filtros.rol);
    if (filtros.id_sede) params = params.set('id_sede', filtros.id_sede);
    if (filtros.pagina) params = params.set('pagina', filtros.pagina);
    if (filtros.limite) params = params.set('limite', filtros.limite);
    return this.http.get<ApiResponse<UsuariosPagina>>(this.baseUrl, { params });
  }

  crear(usuario: UsuarioCrear): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(this.baseUrl, usuario);
  }

  modificar(id: number, usuario: UsuarioEditar): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.baseUrl}/${id}`, usuario);
  }
}
