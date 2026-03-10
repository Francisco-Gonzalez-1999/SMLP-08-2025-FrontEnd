import { Routes } from '@angular/router';
import { PlcsListComponent } from './pages/plcs-list/plcs-list.component';
import { PlantasListComponent } from './pages/plantas-list/plantas-list.component';
import { LineasListComponent } from './pages/lineas-list/lineas-list.component';
import { EsclavosModbusListComponent } from './pages/esclavos-modbus-list/esclavos-modbus-list.component';
import { ServidoresModbusListComponent } from './pages/servidores-modbus-list/servidores-modbus-list.component';
import { ServidoresOpcuaListComponent } from './pages/servidores-opcua-list/servidores-opcua-list.component';
import { GruposTagsListComponent } from './pages/grupos-tags-list/grupos-tags-list.component';
import { TagsListComponent } from './pages/tags-list/tags-list.component';
import { TagsGruposListComponent } from './pages/tags-grupos-list/tags-grupos-list.component';

export const configurationRoutes: Routes = [
  {
    path: '',
    redirectTo: 'plcs',
    pathMatch: 'full'
  },
  {
    path: 'plcs',
    component: PlcsListComponent
  },
  {
    path: 'plantas',
    component: PlantasListComponent
  },
  {
    path: 'lineas',
    component: LineasListComponent
  },
  {
    path: 'esclavos-modbus',
    component: EsclavosModbusListComponent
  },
  {
    path: 'servidores-modbus',
    component: ServidoresModbusListComponent
  },
  {
    path: 'servidores-opcua',
    component: ServidoresOpcuaListComponent
  },
  {
    path: 'grupos-tags',
    component: GruposTagsListComponent
  },
  {
    path: 'tags',
    component: TagsListComponent
  },
  {
    path: 'tags-grupos',
    component: TagsGruposListComponent
  }
];
