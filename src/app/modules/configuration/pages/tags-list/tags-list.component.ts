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
import { CatTagsService } from '../../services/cat-tags.service';
import { CatTagDTO, ActivarDesactivarTagDTO } from '../../interfaces/cat-tag-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

// Component
import { TagFormComponent } from '../../components/tag-form/tag-form.component';

@Component({
  selector: 'app-tags-list',
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
    TagFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './tags-list.component.html',
  styleUrl: './tags-list.component.scss'
})
export class TagsListComponent implements OnInit {
  tags: CatTagDTO[] = [];
  selectedTag: CatTagDTO | null = null;
  showDialog: boolean = false;
  loading: boolean = false;
  processing: boolean = false;
  isEditMode: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private catTagsService: CatTagsService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarTags();
  }

  cargarTags() {
    this.loading = true;
    this.catTagsService.obtenerTodosLosTags().subscribe({
      next: (response: ApiResponse<CatTagDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.tags = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar los Tags');
          this.tags = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError('Error', 'Error al cargar los Tags');
        this.tags = [];
        this.loading = false;
      }
    });
  }

  abrirDialogCrear() {
    this.isEditMode = false;
    this.selectedTag = null;
    this.showDialog = true;
  }

  abrirDialogEditar(tag: CatTagDTO) {
    this.isEditMode = true;
    this.selectedTag = { ...tag };
    this.showDialog = true;
  }

  cerrarDialog() {
    this.showDialog = false;
    this.selectedTag = null;
  }

  onTagGuardado() {
    this.cerrarDialog();
    this.processing = true;
    this.cargarTags();
    this.processing = false;
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  cambiarEstado(tag: CatTagDTO) {
    const nuevoEstado = !tag.estaActivo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} el Tag "${tag.nombre}"?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const dto: ActivarDesactivarTagDTO = {
          idTag: tag.idTag,
          estaActivo: nuevoEstado
        };

        this.catTagsService.activarDesactivarTag(dto).subscribe({
          next: (response: ApiResponse<CatTagDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarTags();
            } else {
              this.toastService.showError('Error', response.message || 'Error al cambiar el estado');
            }
            this.processing = false;
          },
          error: (error) => {
            this.toastService.showError('Error', 'Error al cambiar el estado del Tag');
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
