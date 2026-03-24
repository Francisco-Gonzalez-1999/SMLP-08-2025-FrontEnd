import { Routes } from '@angular/router';
import { LayoutComponent } from './modules/layout/components/layout/layout.component';
import { isLoggedIn, isNotLoggedIn } from './shared/guards/auth.guard';
import { permisosGuard } from './shared/guards/permisos.guard';
import { AccesoDenegadoComponent } from './shared/components/acceso-denegado/acceso-denegado.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'lecturas',
        pathMatch: 'full'
      },
      {
        path: 'configuration',
        loadChildren: () => import('./modules/configuration/configuration.routing').then(m => m.configurationRoutes),
        canActivate: [permisosGuard],
        data: { modulo: 'MOD_CONFIG', accion: 'VER' }
      },
      {
        path: 'lecturas',
        loadChildren: () => import('./modules/lecturas/lecturas.routing').then(m => m.lecturasRoutes),
        canActivate: [permisosGuard],
        data: { modulo: 'MOD_MONITOR_TIEMPO_REAL', accion: 'VER' }
      },
      {
        path: 'eventos',
        loadChildren: () => import('./modules/eventos/eventos.routing').then(m => m.eventosRoutes),
        canActivate: [permisosGuard],
        data: { modulo: 'MOD_BITACORA_PAROS', accion: 'VER' }
      },
      {
        path: 'acceso-denegado',
        component: AccesoDenegadoComponent
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/admin/auth.routing').then(m => m.authRoutes),
    canActivate: [isNotLoggedIn]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
