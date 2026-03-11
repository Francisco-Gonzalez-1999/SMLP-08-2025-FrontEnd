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
import { DropdownModule } from 'primeng/dropdown';

// Services e Interfaces
import { CatTagsGruposService } from '../../services/cat-tags-grupos.service';
import { CatTagsService } from '../../services/cat-tags.service';
import { CatGruposTagsService } from '../../services/cat-grupos-tags.service';
import { CatTagsGrupoConRelacionesDTO, CatTagsGrupoDTO, ActivarDesactivarTagGrupoDTO } from '../../interfaces/cat-tags-grupo-dto.interface';
import { CatTagDTO } from '../../interfaces/cat-tag-dto.interface';
import { CatGruposTagDTO } from '../../interfaces/cat-grupos-tag-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

// Component
import { TagGrupoFormComponent } from '../../components/tag-grupo-form/tag-grupo-form.component';

@Component({
  selector: 'app-tags-grupos-list',
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
    DropdownModule,
    TagGrupoFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './tags-grupos-list.component.html',
  styleUrl: './tags-grupos-list.component.scss'
})
export class TagsGruposListComponent implements OnInit {
  tagsGrupos: CatTagsGrupoConRelacionesDTO[] = [];
  tags: CatTagDTO[] = [];
  gruposTags: CatGruposTagDTO[] = [];
  selectedTagGrupo: CatTagsGrupoDTO | null = null;
  showDialog: boolean = false;
  loading: boolean = false;
  processing: boolean = false;
  isEditMode: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private catTagsGruposService: CatTagsGruposService,
    private catTagsService: CatTagsService,
    private catGruposTagsService: CatGruposTagsService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarTags();
    this.cargarGruposTags();
    this.cargarTagsGrupos();
  }

  cargarTags() {
    this.catTagsService.obtenerTodosLosTags().subscribe({
      next: (response: ApiResponse<CatTagDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.tags = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar tags:', error);
      }
    });
  }

  cargarGruposTags() {
    this.catGruposTagsService.obtenerTodosLosGruposTags().subscribe({
      next: (response: ApiResponse<CatGruposTagDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.gruposTags = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar grupos tags:', error);
      }
    });
  }

  cargarTagsGrupos() {
    this.loading = true;
    this.catTagsGruposService.obtenerTodosLosTagsGrupos().subscribe({
      next: (response: ApiResponse<CatTagsGrupoConRelacionesDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.tagsGrupos = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar los Tags-Grupos');
          this.tagsGrupos = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError('Error', 'Error al cargar los Tags-Grupos');
        this.tagsGrupos = [];
        this.loading = false;
      }
    });
  }

  abrirDialogCrear() {
    this.isEditMode = false;
    this.selectedTagGrupo = null;
    this.showDialog = true;
  }

  abrirDialogEditar(tagGrupo: CatTagsGrupoConRelacionesDTO) {
    this.isEditMode = true;
    this.selectedTagGrupo = {
      idTagGrupo: tagGrupo.idTagGrupo,
      idTag: tagGrupo.idTag,
      idGrupoTag: tagGrupo.idGrupoTag,
      estaActivo: tagGrupo.estaActivo,
      fechaCreacion: tagGrupo.fechaCreacion
    };
    this.showDialog = true;
  }

  cerrarDialog() {
    this.showDialog = false;
    this.selectedTagGrupo = null;
  }

  onTagGrupoGuardado() {
    this.cerrarDialog();
    this.processing = true;
    this.cargarTagsGrupos();
    this.processing = false;
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  cambiarEstado(tagGrupo: CatTagsGrupoConRelacionesDTO) {
    const nuevoEstado = !tagGrupo.estaActivo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} la relación Tag-Grupo?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const dto: ActivarDesactivarTagGrupoDTO = {
          idTagGrupo: tagGrupo.idTagGrupo,
          estaActivo: nuevoEstado
        };

        this.catTagsGruposService.activarDesactivarTagGrupo(dto).subscribe({
          next: (response: ApiResponse<CatTagsGrupoDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarTagsGrupos();
            } else {
              this.toastService.showError('Error', response.message || 'Error al cambiar el estado');
            }
            this.processing = false;
          },
          error: (error) => {
            this.toastService.showError('Error', 'Error al cambiar el estado del Tag-Grupo');
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
