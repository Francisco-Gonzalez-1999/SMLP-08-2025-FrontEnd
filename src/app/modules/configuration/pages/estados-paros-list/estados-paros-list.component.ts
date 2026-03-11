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
import { CatEstadosParosService } from '../../services/cat-estados-paros.service';
import { CatEstadosParoDTO, ActivarDesactivarEstadoParoDTO } from '../../interfaces/cat-estados-paro-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

// Component
import { EstadoParoFormComponent } from '../../components/estado-paro-form/estado-paro-form.component';

@Component({
  selector: 'app-estados-paros-list',
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
    EstadoParoFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './estados-paros-list.component.html',
  styleUrl: './estados-paros-list.component.scss'
})
export class EstadosParosListComponent implements OnInit {
  estadosParo: CatEstadosParoDTO[] = [];
  selectedEstadoParo: CatEstadosParoDTO | null = null;
  showDialog: boolean = false;
  loading: boolean = false;
  processing: boolean = false;
  isEditMode: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private catEstadosParosService: CatEstadosParosService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarEstadosParo();
  }

  cargarEstadosParo() {
    this.loading = true;
    this.catEstadosParosService.obtenerTodosLosEstadosParo().subscribe({
      next: (response: ApiResponse<CatEstadosParoDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.estadosParo = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar los estados de paro');
          this.estadosParo = [];
        }
        this.loading = false;
      },
      error: () => {
        this.toastService.showError('Error', 'Error al cargar los estados de paro');
        this.estadosParo = [];
        this.loading = false;
      }
    });
  }

  abrirDialogCrear() {
    this.isEditMode = false;
    this.selectedEstadoParo = null;
    this.showDialog = true;
  }

  abrirDialogEditar(estado: CatEstadosParoDTO) {
    this.isEditMode = true;
    this.selectedEstadoParo = { ...estado };
    this.showDialog = true;
  }

  cerrarDialog() {
    this.showDialog = false;
    this.selectedEstadoParo = null;
  }

  onEstadoParoGuardado() {
    this.cerrarDialog();
    this.processing = true;
    this.cargarEstadosParo();
    this.processing = false;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  cambiarEstado(estado: CatEstadosParoDTO) {
    const nuevoEstado = !estado.estaActivo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} el estado de paro "${estado.nombre}"?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const dto: ActivarDesactivarEstadoParoDTO = {
          idEstadoParo: estado.idEstadoParo,
          estaActivo: nuevoEstado
        };

        this.catEstadosParosService.activarDesactivarEstadoParo(dto).subscribe({
          next: (response: ApiResponse<CatEstadosParoDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarEstadosParo();
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

  getColorStyle(colorHex: string | null): object {
    if (!colorHex) return { backgroundColor: '#e5e7eb' };
    const hex = colorHex.startsWith('#') ? colorHex : '#' + colorHex;
    return { backgroundColor: hex };
  }
}
