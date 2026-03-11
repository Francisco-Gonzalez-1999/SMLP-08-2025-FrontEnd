import { Routes } from '@angular/router';
import { LayoutComponent } from './modules/layout/components/layout/layout.component';
import { isLoggedIn, isNotLoggedIn } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'configuration',
        pathMatch: 'full'
      },
      {
        path: 'configuration',
        loadChildren: () => import('./modules/configuration/configuration.routing').then(m => m.configurationRoutes)
      },
      {
        path: 'lecturas',
        loadChildren: () => import('./modules/lecturas/lecturas.routing').then(m => m.lecturasRoutes)
      },
      {
        path: 'eventos',
        loadChildren: () => import('./modules/eventos/eventos.routing').then(m => m.eventosRoutes)
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
