import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services e Interfaces
import { CatConfiguracionCorreosService } from '../../services/cat-configuracion-correos.service';
import {
  CatConfiguracionCorreoDTO,
  ActivarDesactivarConfiguracionCorreoDTO
} from '../../interfaces/cat-configuracion-correo-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

// Component
import { ConfiguracionCorreoFormComponent } from '../../components/configuracion-correo-form/configuracion-correo-form.component';

@Component({
  selector: 'app-configuracion-correos-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    ConfiguracionCorreoFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './configuracion-correos-list.component.html',
  styleUrl: './configuracion-correos-list.component.scss'
})
export class ConfiguracionCorreosListComponent implements OnInit {
  configuraciones: CatConfiguracionCorreoDTO[] = [];
  selectedConfiguracion: CatConfiguracionCorreoDTO | null = null;
  showDialog: boolean = false;
  loading: boolean = false;
  processing: boolean = false;
  isEditMode: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private catConfiguracionCorreosService: CatConfiguracionCorreosService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarConfiguraciones();
  }

  cargarConfiguraciones() {
    this.loading = true;
    this.catConfiguracionCorreosService.obtenerTodasLasConfiguracionesCorreo().subscribe({
      next: (response: ApiResponse<CatConfiguracionCorreoDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.configuraciones = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar las configuraciones de correo');
          this.configuraciones = [];
        }
        this.loading = false;
      },
      error: () => {
        this.toastService.showError('Error', 'Error al cargar las configuraciones de correo');
        this.configuraciones = [];
        this.loading = false;
      }
    });
  }

  abrirDialogCrear() {
    this.isEditMode = false;
    this.selectedConfiguracion = null;
    this.showDialog = true;
  }

  abrirDialogEditar(config: CatConfiguracionCorreoDTO) {
    this.isEditMode = true;
    this.selectedConfiguracion = { ...config };
    this.showDialog = true;
  }

  cerrarDialog() {
    this.showDialog = false;
    this.selectedConfiguracion = null;
  }

  onConfiguracionGuardada() {
    this.cerrarDialog();
    this.processing = true;
    this.cargarConfiguraciones();
    this.processing = false;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  cambiarEstado(config: CatConfiguracionCorreoDTO) {
    const nuevoEstado = !config.estaActivo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} la configuración "${config.tipoConfiguracion}"?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const dto: ActivarDesactivarConfiguracionCorreoDTO = {
          idConfiguracionCorreo: config.idConfiguracionCorreo,
          estaActivo: nuevoEstado
        };

        this.catConfiguracionCorreosService.activarDesactivarConfiguracionCorreo(dto).subscribe({
          next: (response: ApiResponse<CatConfiguracionCorreoDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarConfiguraciones();
            } else {
              this.toastService.showError('Error', response.message || 'Error al cambiar el estado');
            }
            this.processing = false;
          },
          error: () => {
            this.toastService.showError('Error', 'Error al cambiar el estado');
            this.processing = false;
          }
        });
      }
    });
  }

  getSeverity(estaActivo: boolean): 'success' | 'danger' {
    return estaActivo ? 'success' : 'danger';
  }

  getEstadoTexto(estaActivo: boolean): string {
    return estaActivo ? 'Activo' : 'Inactivo';
  }
}
