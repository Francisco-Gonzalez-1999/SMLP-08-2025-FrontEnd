import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from '../layout/service/app.layout.service';
import { AppMenuitemComponent } from './app.menuitem.component';
import { CommonModule } from '@angular/common';

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
export class MenuComponent implements OnInit {

  model: any[] = [];

  constructor(public layoutService: LayoutService) { }

  ngOnInit() {
    this.model = [
        {
          label: 'Lecturas',
          icon: 'pi pi-fw pi-chart-line',
          items: [
            { label: 'Estado de Líneas', icon: 'pi pi-fw pi-list', routerLink: ['/lecturas/estados-lineas'] }
          ]
        },
        {
          label: 'Eventos',
          icon: 'pi pi-fw pi-calendar-plus',
          items: [
            { label: 'Paros Justificados', icon: 'pi pi-fw pi-book', routerLink: ['/eventos/paros-justificados'] }
          ]
        },
        {
          label: 'Configuración',
          icon: 'pi pi-fw pi-cog',
          items: [
            { label: 'PLCs', icon: 'pi pi-fw pi-server', routerLink: ['/configuration/plcs'] },
            { label: 'Plantas', icon: 'pi pi-fw pi-building', routerLink: ['/configuration/plantas'] },
            { label: 'Líneas', icon: 'pi pi-fw pi-sitemap', routerLink: ['/configuration/lineas'] },
            { label: 'Esclavos Modbus', icon: 'pi pi-fw pi-microchip', routerLink: ['/configuration/esclavos-modbus'] },
            { label: 'Servidores Modbus', icon: 'pi pi-fw pi-microchip', routerLink: ['/configuration/servidores-modbus'] },
            { label: 'Servidores OPC UA', icon: 'pi pi-fw pi-cloud', routerLink: ['/configuration/servidores-opcua'] },
            { label: 'Grupos de Tags', icon: 'pi pi-fw pi-tags', routerLink: ['/configuration/grupos-tags'] },
            { label: 'Tags', icon: 'pi pi-fw pi-tag', routerLink: ['/configuration/tags'] },
            { label: 'Tags-Grupos', icon: 'pi pi-fw pi-link', routerLink: ['/configuration/tags-grupos'] },
            { label: 'Config. Correos', icon: 'pi pi-fw pi-envelope', routerLink: ['/configuration/configuracion-correos'] },
            { label: 'Eventos', icon: 'pi pi-fw pi-calendar', routerLink: ['/configuration/eventos'] },
            { label: 'Estados de Paro', icon: 'pi pi-fw pi-stop-circle', routerLink: ['/configuration/estados-paro'] }
          ]
        }


    ];
  }

}
