import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { PermisosService } from '../services/permisos.service';
import { AuthService } from '../../modules/admin/services/auth.service';

export const permisosGuard: CanActivateFn = (route, state) => {
  const permisosService = inject(PermisosService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn) {
    return router.createUrlTree(['/auth/login']);
  }

  const modulo = route.data['modulo'] as string;
  const accion = route.data['accion'] as string | undefined;

  if (!modulo) return true;

  return permisosService.esperarCarga().pipe(
    map(() => {
      const tieneAcceso = accion
        ? permisosService.tienePermiso(modulo, accion)
        : permisosService.tienePermisoEnModulo(modulo);

      if (tieneAcceso) return true;

      return router.createUrlTree(['/acceso-denegado'], {
        queryParams: { ruta: state.url }
      });
    })
  );
};
