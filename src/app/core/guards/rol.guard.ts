import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { Rol } from '../models/usuario.model';

/**
 * Protege rutas por rol. Los roles permitidos se declaran en la ruta:
 *   data: { roles: ['admin'] }
 *  - Sin sesion -> login.
 *  - Con sesion pero rol no permitido -> pagina de "Acceso denegado".
 */
export const rolGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { redirigir: state.url },
    });
  }

  const rolesPermitidos = (route.data['roles'] as Rol[] | undefined) ?? [];
  const rolActual = auth.rol();

  if (rolActual && rolesPermitidos.includes(rolActual)) {
    return true;
  }

  return router.createUrlTree(['/acceso-denegado']);
};
