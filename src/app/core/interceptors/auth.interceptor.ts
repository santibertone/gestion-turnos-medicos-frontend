import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

/**
 * Agrega el header Authorization: Bearer <token> a cada peticion saliente
 * cuando hay sesion iniciada, para acceder a los endpoints protegidos.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).obtenerToken();

  if (!token) {
    return next(req);
  }

  const conToken = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(conToken);
};
