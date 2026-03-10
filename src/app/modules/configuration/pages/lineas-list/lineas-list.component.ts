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
import { DropdownModule } from 'primeng/dropdown';

// Services e Interfaces
import { CatLineasService } from '../../services/cat-lineas.service';
import { CatPlantasService } from '../../services/cat-plantas.service';
import { CatLineaDTO, ActivarDesactivarLineaDTO } from '../../interfaces/cat-linea-dto.interface';
import { CatPlantaDTO } from '../../interfaces/cat-planta-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

// Component
import { LineaFormComponent } from '../../components/linea-form/linea-form.component';

@Component({
  selector: 'app-lineas-list',
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
    DropdownModule,
    LineaFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './lineas-list.component.html',
  styleUrl: './lineas-list.component.scss'
})
export class LineasListComponent implements OnInit {
  lineas: CatLineaDTO[] = [];
  plantas: CatPlantaDTO[] = [];
  selectedLinea: CatLineaDTO | null = null;
  showDialog: boolean = false;
  loading: boolean = false;
  processing: boolean = false;
  isEditMode: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private catLineasService: CatLineasService,
    private catPlantasService: CatPlantasService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarPlantas();
    this.cargarLineas();
  }

  cargarPlantas() {
    this.catPlantasService.obtenerTodasLasPlantas().subscribe({
      next: (response: ApiResponse<CatPlantaDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.plantas = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar plantas:', error);
      }
    });
  }

  cargarLineas() {
    this.loading = true;
    this.catLineasService.obtenerTodasLasLineas().subscribe({
      next: (response: ApiResponse<CatLineaDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.lineas = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar las Líneas');
          this.lineas = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError('Error', 'Error al cargar las Líneas');
        this.lineas = [];
        this.loading = false;
      }
    });
  }

  abrirDialogCrear() {
    this.isEditMode = false;
    this.selectedLinea = null;
    this.showDialog = true;
  }

  abrirDialogEditar(linea: CatLineaDTO) {
    this.isEditMode = true;
    this.selectedLinea = { ...linea };
    this.showDialog = true;
  }

  cerrarDialog() {
    this.showDialog = false;
    this.selectedLinea = null;
  }

  onLineaGuardada() {
    this.cerrarDialog();
    this.processing = true;
    this.cargarLineas();
    this.processing = false;
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getNombrePlanta(idPlanta: number): string {
    const planta = this.plantas.find(p => p.idPlanta === idPlanta);
    return planta ? planta.nombre : `ID: ${idPlanta}`;
  }

  getUniquePlanta() {
    const plantasIds = new Set<number>();
    this.lineas.forEach(l => {
      if (l.idPlanta) plantasIds.add(l.idPlanta);
    });
    return Array.from(plantasIds).map(id => {
      const planta = this.plantas.find(p => p.idPlanta === id);
      return { label: planta?.nombre || `ID: ${id}`, value: id };
    });
  }

  cambiarEstado(linea: CatLineaDTO) {
    const accion = linea.estaActivo ? 'desactivar' : 'activar';
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} la Línea "${linea.nombre}"?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const dto: ActivarDesactivarLineaDTO = {
          idLinea: linea.idLinea,
          estaActivo: !linea.estaActivo
        };

        this.catLineasService.activarDesactivarLinea(dto).subscribe({
          next: (response: ApiResponse<CatLineaDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarLineas();
            } else {
              this.toastService.showError('Error', response.message || 'Error al cambiar el estado');
            }
            this.processing = false;
          },
          error: (error) => {
            this.toastService.showError('Error', 'Error al cambiar el estado de la Línea');
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
