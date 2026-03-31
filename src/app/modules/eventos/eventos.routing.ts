import { Routes } from '@angular/router';
import { RegistrosParosJustificadosListComponent } from './pages/registros-paros-justificados-list/registros-paros-justificados-list.component';
import { BitacoraParosComponent } from './pages/bitacora-paros/bitacora-paros.component';

export const eventosRoutes: Routes = [
  {
    path: '',
    redirectTo: 'paros-justificados',
    pathMatch: 'full'
  },
  {
    path: 'paros-justificados',
    component: RegistrosParosJustificadosListComponent
  },
  {
    path: 'bitacora-paros',
    component: BitacoraParosComponent
  }
];
