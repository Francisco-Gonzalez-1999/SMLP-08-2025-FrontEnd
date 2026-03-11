import { Routes } from '@angular/router';
import { EstadosLineasListComponent } from './pages/estados-lineas-list/estados-lineas-list.component';

export const lecturasRoutes: Routes = [
  {
    path: '',
    redirectTo: 'estados-lineas',
    pathMatch: 'full'
  },
  {
    path: 'estados-lineas',
    component: EstadosLineasListComponent
  }
];
