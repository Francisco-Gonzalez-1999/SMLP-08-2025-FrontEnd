import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="acceso-denegado-container">
      <div class="acceso-denegado-card">
        <div class="icon-wrapper">
          <div class="icon-bg">
            <i class="pi pi-lock"></i>
          </div>
        </div>
        <h2>Acceso denegado</h2>
        <p class="mensaje-principal">No tienes permisos para acceder a esta sección.</p>
        <p class="mensaje-detalle">
          Contacta a tu administrador para solicitar los permisos necesarios
          a través del <strong>Ecosistema Central de Sistemas (ECS)</strong>.
        </p>
        @if (rutaDenegada) {
          <div class="ruta-info">
            <i class="pi pi-link"></i>
            <code>{{ rutaDenegada }}</code>
          </div>
        }
        <div class="acciones">
          <p-button
            icon="pi pi-arrow-left"
            label="Volver"
            [outlined]="true"
            (click)="volver()"
            styleClass="p-button-sm">
          </p-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .acceso-denegado-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 70vh;
      padding: 2rem;
    }

    .acceso-denegado-card {
      text-align: center;
      max-width: 480px;
      padding: 2.5rem 2rem;
    }

    .icon-wrapper {
      margin-bottom: 1.5rem;
    }

    .icon-bg {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #fee2e2, #fecaca);
    }

    .icon-bg i {
      font-size: 2.2rem;
      color: #dc2626;
    }

    h2 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }

    .mensaje-principal {
      margin: 0 0 0.75rem;
      font-size: 1rem;
      color: #64748b;
    }

    .mensaje-detalle {
      margin: 0 0 1.25rem;
      font-size: 0.875rem;
      color: #94a3b8;
      line-height: 1.5;
    }

    .ruta-info {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      background: #f1f5f9;
      margin-bottom: 1.5rem;
    }

    .ruta-info i {
      color: #94a3b8;
      font-size: 0.85rem;
    }

    .ruta-info code {
      font-size: 0.8rem;
      color: #475569;
    }

    .acciones {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
    }
  `]
})
export class AccesoDenegadoComponent {
  rutaDenegada: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.rutaDenegada = this.route.snapshot.queryParams['ruta'] || '';
  }

  volver() {
    this.router.navigate(['/']);
  }
}
