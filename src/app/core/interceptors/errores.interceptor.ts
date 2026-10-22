import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Si el token vence o queda invalido durante el uso, el backend responde 401.
 * En ese caso cerramos la sesion y llevamos al usuario al login.
 * El 401 de credenciales invalidas del propio login no entra aca porque en ese
 * momento todavia no hay token (lo maneja la pantalla de login).
 */
export const erroresInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const esSesionIniciada = !!auth.obtenerToken();
      const esLogin = req.url.includes('/auth/login');
      if (error.status === 401 && esSesionIniciada && !esLogin) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { vencida: 1 } });
      }
      return throwError(() => error);
    }),
  );
};
