import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Manejo global de errores HTTP:
 *  - 401 con sesion iniciada (token vencido): cierra sesion y lleva al login.
 *    (El 401 de credenciales del login no entra aca porque aun no hay token.)
 *  - status 0 (backend caido / sin respuesta): muestra un aviso para que la
 *    app no quede "en blanco" sin explicacion.
 */
export const erroresInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const esLogin = req.url.includes('/auth/login');

      if (error.status === 401 && !!auth.obtenerToken() && !esLogin) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { vencida: 1 } });
      } else if (error.status === 0 && !esLogin) {
        snackBar.open(
          'No se pudo conectar con el servidor. Verifica que el backend este encendido.',
          'Cerrar',
          { duration: 6000 },
        );
      }

      return throwError(() => error);
    }),
  );
};
