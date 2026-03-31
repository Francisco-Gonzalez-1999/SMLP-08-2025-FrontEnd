import { OnInit, OnDestroy } from '@angular/core';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from '../layout/service/app.layout.service';
import { AppMenuitemComponent } from './app.menuitem.component';
import { CommonModule } from '@angular/common';
import { PermisosService } from '../../../../shared/services/permisos.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    AppMenuitemComponent,
    CommonModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit, OnDestroy {

  model: any[] = [];
  private permisosSub?: Subscription;

  constructor(
    public layoutService: LayoutService,
    private permisosService: PermisosService
  ) { }

  ngOnInit() {
    this.permisosService.cargarPermisos();
    this.construirMenu();

    this.permisosSub = this.permisosService.permisos$.subscribe(() => {
      this.construirMenu();
    });
  }

  private construirMenu() {
    const p = this.permisosService;

    this.model = [
        {
          label: 'Lecturas',
          icon: 'pi pi-fw pi-chart-line',
          visible: p.tienePermisoEnModulo('MOD_MONITOR_TIEMPO_REAL'),
          items: [
            { label: 'Estado de Líneas', icon: 'pi pi-fw pi-list', routerLink: ['/lecturas/estados-lineas'], visible: p.tienePermiso('MOD_MONITOR_TIEMPO_REAL', 'VER') }
          ]
        },
        {
          label: 'Eventos',
          icon: 'pi pi-fw pi-calendar-plus',
          visible: p.tienePermisoEnModulo('MOD_BITACORA_PAROS'),
          items: [
            { label: 'Paros Justificados', icon: 'pi pi-fw pi-book', routerLink: ['/eventos/paros-justificados'], visible: p.tienePermiso('MOD_BITACORA_PAROS', 'VER') },
            { label: 'Bitácora de Paros', icon: 'pi pi-fw pi-clipboard', routerLink: ['/eventos/bitacora-paros'], visible: p.tienePermiso('MOD_BITACORA_PAROS', 'VER') }
          ]
        },
        {
          label: 'Configuración',
          icon: 'pi pi-fw pi-cog',
          visible: p.tienePermisoEnModulo('MOD_CONFIG'),
          items: [
            { label: 'PLCs', icon: 'pi pi-fw pi-server', routerLink: ['/configuration/plcs'], visible: p.tienePermiso('MOD_CONFIG', 'VER') },
            { label: 'Plantas', icon: 'pi pi-fw pi-building', routerLink: ['/configuration/plantas'], visible: p.tienePermiso('MOD_CONFIG', 'VER') },
            { label: 'Líneas', icon: 'pi pi-fw pi-sitemap', routerLink: ['/configuration/lineas'], visible: p.tienePermiso('MOD_CONFIG', 'VER') },
            { label: 'Esclavos Modbus', icon: 'pi pi-fw pi-microchip', routerLink: ['/configuration/esclavos-modbus'], visible: p.tienePermiso('MOD_CONFIG', 'VER') },
            { label: 'Servidores Modbus', icon: 'pi pi-fw pi-microchip', routerLink: ['/configuration/servidores-modbus'], visible: p.tienePermiso('MOD_CONFIG', 'VER') },
            { label: 'Servidores OPC UA', icon: 'pi pi-fw pi-cloud', routerLink: ['/configuration/servidores-opcua'], visible: p.tienePermiso('MOD_CONFIG', 'VER') },
            { label: 'Grupos de Tags', icon: 'pi pi-fw pi-tags', routerLink: ['/configuration/grupos-tags'], visible: p.tienePermiso('MOD_CONFIG', 'VER') },
            { label: 'Tags', icon: 'pi pi-fw pi-tag', routerLink: ['/configuration/tags'], visible: p.tienePermiso('MOD_CONFIG', 'VER') },
            { label: 'Tags-Grupos', icon: 'pi pi-fw pi-link', routerLink: ['/configuration/tags-grupos'], visible: p.tienePermiso('MOD_CONFIG', 'VER') },
            { label: 'Config. Correos', icon: 'pi pi-fw pi-envelope', routerLink: ['/configuration/configuracion-correos'], visible: p.tienePermiso('MOD_CONFIG', 'VER') },
            { label: 'Eventos', icon: 'pi pi-fw pi-calendar', routerLink: ['/configuration/eventos'], visible: p.tienePermiso('MOD_CONFIG', 'VER') },
            { label: 'Estados de Paro', icon: 'pi pi-fw pi-stop-circle', routerLink: ['/configuration/estados-paro'], visible: p.tienePermiso('MOD_CONFIG', 'VER') }
          ]
        }
    ];
  }

  ngOnDestroy() {
    this.permisosSub?.unsubscribe();
  }
}
