import { Routes } from '@angular/router';
import { RegistrosParosJustificadosListComponent } from './pages/registros-paros-justificados-list/registros-paros-justificados-list.component';

export const eventosRoutes: Routes = [
  {
    path: '',
    redirectTo: 'paros-justificados',
    pathMatch: 'full'
  },
  {
    path: 'paros-justificados',
    component: RegistrosParosJustificadosListComponent
  }
];
