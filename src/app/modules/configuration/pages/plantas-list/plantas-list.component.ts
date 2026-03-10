import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services e Interfaces
import { CatPlantasService } from '../../services/cat-plantas.service';
import { CatPlantaDTO, ActivarDesactivarPlantaDTO } from '../../interfaces/cat-planta-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

// Component
import { PlantaFormComponent } from '../../components/planta-form/planta-form.component';

@Component({
  selector: 'app-plantas-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToggleButtonModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    PlantaFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './plantas-list.component.html',
  styleUrl: './plantas-list.component.scss'
})
export class PlantasListComponent implements OnInit {
  plantas: CatPlantaDTO[] = [];
  selectedPlanta: CatPlantaDTO | null = null;
  showDialog: boolean = false;
  loading: boolean = false;
  processing: boolean = false;
  isEditMode: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private catPlantasService: CatPlantasService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarPlantas();
  }

  cargarPlantas() {
    this.loading = true;
    this.catPlantasService.obtenerTodasLasPlantas().subscribe({
      next: (response: ApiResponse<CatPlantaDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.plantas = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar las Plantas');
          this.plantas = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError('Error', 'Error al cargar las Plantas');
        this.plantas = [];
        this.loading = false;
      }
    });
  }

  abrirDialogCrear() {
    this.isEditMode = false;
    this.selectedPlanta = null;
    this.showDialog = true;
  }

  abrirDialogEditar(planta: CatPlantaDTO) {
    this.isEditMode = true;
    this.selectedPlanta = { ...planta };
    this.showDialog = true;
  }

  cerrarDialog() {
    this.showDialog = false;
    this.selectedPlanta = null;
  }

  onPlantaGuardada() {
    this.cerrarDialog();
    this.processing = true;
    this.cargarPlantas();
    this.processing = false;
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  cambiarEstado(planta: CatPlantaDTO) {
    const accion = planta.estaActivo ? 'desactivar' : 'activar';
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} la Planta "${planta.nombre}"?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const dto: ActivarDesactivarPlantaDTO = {
          idPlanta: planta.idPlanta,
          estaActivo: !planta.estaActivo
        };

        this.catPlantasService.activarDesactivarPlanta(dto).subscribe({
          next: (response: ApiResponse<CatPlantaDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarPlantas();
            } else {
              this.toastService.showError('Error', response.message || 'Error al cambiar el estado');
            }
            this.processing = false;
          },
          error: (error) => {
            this.toastService.showError('Error', 'Error al cambiar el estado de la Planta');
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
