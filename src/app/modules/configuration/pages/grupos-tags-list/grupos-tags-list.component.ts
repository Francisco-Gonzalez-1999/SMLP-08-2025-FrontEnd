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
import { CatGruposTagsService } from '../../services/cat-grupos-tags.service';
import { CatPlantasService } from '../../services/cat-plantas.service';
import { CatGruposTagDTO, ActivarDesactivarGrupoTagDTO } from '../../interfaces/cat-grupos-tag-dto.interface';
import { CatPlantaDTO } from '../../interfaces/cat-planta-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

// Component
import { GrupoTagFormComponent } from '../../components/grupo-tag-form/grupo-tag-form.component';

@Component({
  selector: 'app-grupos-tags-list',
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
    GrupoTagFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './grupos-tags-list.component.html',
  styleUrl: './grupos-tags-list.component.scss'
})
export class GruposTagsListComponent implements OnInit {
  gruposTags: CatGruposTagDTO[] = [];
  plantas: CatPlantaDTO[] = [];
  selectedGrupoTag: CatGruposTagDTO | null = null;
  showDialog: boolean = false;
  loading: boolean = false;
  processing: boolean = false;
  isEditMode: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private catGruposTagsService: CatGruposTagsService,
    private catPlantasService: CatPlantasService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarPlantas();
    this.cargarGruposTags();
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

  cargarGruposTags() {
    this.loading = true;
    this.catGruposTagsService.obtenerTodosLosGruposTags().subscribe({
      next: (response: ApiResponse<CatGruposTagDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.gruposTags = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar los Grupos de Tags');
          this.gruposTags = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError('Error', 'Error al cargar los Grupos de Tags');
        this.gruposTags = [];
        this.loading = false;
      }
    });
  }

  abrirDialogCrear() {
    this.isEditMode = false;
    this.selectedGrupoTag = null;
    this.showDialog = true;
  }

  abrirDialogEditar(grupoTag: CatGruposTagDTO) {
    this.isEditMode = true;
    this.selectedGrupoTag = { ...grupoTag };
    this.showDialog = true;
  }

  cerrarDialog() {
    this.showDialog = false;
    this.selectedGrupoTag = null;
  }

  onGrupoTagGuardado() {
    this.cerrarDialog();
    this.processing = true;
    this.cargarGruposTags();
    this.processing = false;
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getNombrePlanta(idPlanta: number | null): string {
    if (!idPlanta) return '-';
    const planta = this.plantas.find(p => p.idPlanta === idPlanta);
    return planta ? planta.nombre : `ID: ${idPlanta}`;
  }

  getUniquePlanta() {
    const plantasIds = new Set<number>();
    this.gruposTags.forEach(g => {
      if (g.idPlanta) plantasIds.add(g.idPlanta);
    });
    return Array.from(plantasIds).map(id => {
      const planta = this.plantas.find(p => p.idPlanta === id);
      return { label: planta ? planta.nombre : `ID: ${id}`, value: id };
    });
  }

  cambiarEstado(grupoTag: CatGruposTagDTO) {
    const accion = grupoTag.estaActivo ? 'desactivar' : 'activar';
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} el Grupo de Tags "${grupoTag.nombre || 'ID: ' + grupoTag.idGrupoTag}"?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const dto: ActivarDesactivarGrupoTagDTO = {
          idGrupoTag: grupoTag.idGrupoTag,
          estaActivo: !grupoTag.estaActivo
        };

        this.catGruposTagsService.activarDesactivarGrupoTag(dto).subscribe({
          next: (response: ApiResponse<CatGruposTagDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarGruposTags();
            } else {
              this.toastService.showError('Error', response.message || 'Error al cambiar el estado');
            }
            this.processing = false;
          },
          error: (error) => {
            this.toastService.showError('Error', 'Error al cambiar el estado del Grupo de Tags');
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
