// Importaciones para uso del componente
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { toSignal } from '@angular/core/rxjs-interop';

// ImportacionesParaPrimeNg
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';

// Servicios
import { LayoutService } from '../layout/service/app.layout.service';
import { AuthService } from '../../../admin/services/auth.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    MenuModule,
    ButtonModule,
    TieredMenuModule,
    CommonModule
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent implements OnInit {


  userMenuItems!: MenuItem[];
  userData: any = null;

  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
  @ViewChild('topbarmenu') menu!: ElementRef;

  constructor(
    public layoutService: LayoutService,
    public AuthService: AuthService,
  ) { }

  ngOnInit(): void {
    this.loadUserData();

    this.AuthService.userData$.subscribe(user => {
      this.userData = user;
    });

    this.userMenuItems = [
      {
        label: 'Perfil',
        items: [
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => {
              this.AuthService.logout();
            }
          }
        ]
      }
    ];
  }

  private loadUserData() {
    const userData = this.AuthService.getUserData();
    if (userData) {
      this.userData = userData;
    }
  }


}

