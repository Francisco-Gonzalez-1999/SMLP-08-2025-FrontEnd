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
import { CatEventosService } from '../../services/cat-eventos.service';
import { CatEventoDTO, ActivarDesactivarEventoDTO } from '../../interfaces/cat-evento-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

// Component
import { EventoFormComponent } from '../../components/evento-form/evento-form.component';

@Component({
  selector: 'app-eventos-list',
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
    EventoFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './eventos-list.component.html',
  styleUrl: './eventos-list.component.scss'
})
export class EventosListComponent implements OnInit {
  eventos: CatEventoDTO[] = [];
  selectedEvento: CatEventoDTO | null = null;
  showDialog: boolean = false;
  loading: boolean = false;
  processing: boolean = false;
  isEditMode: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private catEventosService: CatEventosService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarEventos();
  }

  cargarEventos() {
    this.loading = true;
    this.catEventosService.obtenerTodosLosEventos().subscribe({
      next: (response: ApiResponse<CatEventoDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.eventos = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar los Eventos');
          this.eventos = [];
        }
        this.loading = false;
      },
      error: () => {
        this.toastService.showError('Error', 'Error al cargar los Eventos');
        this.eventos = [];
        this.loading = false;
      }
    });
  }

  abrirDialogCrear() {
    this.isEditMode = false;
    this.selectedEvento = null;
    this.showDialog = true;
  }

  abrirDialogEditar(evento: CatEventoDTO) {
    this.isEditMode = true;
    this.selectedEvento = { ...evento };
    this.showDialog = true;
  }

  cerrarDialog() {
    this.showDialog = false;
    this.selectedEvento = null;
  }

  onEventoGuardado() {
    this.cerrarDialog();
    this.processing = true;
    this.cargarEventos();
    this.processing = false;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  cambiarEstado(evento: CatEventoDTO) {
    const nombre = evento.nombre || 'Sin nombre';
    const nuevoEstado = !evento.estaActivo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} el Evento "${nombre}"?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const dto: ActivarDesactivarEventoDTO = {
          idEvento: evento.idEvento,
          estaActivo: nuevoEstado
        };

        this.catEventosService.activarDesactivarEvento(dto).subscribe({
          next: (response: ApiResponse<CatEventoDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarEventos();
            } else {
              this.toastService.showError('Error', response.message || 'Error al cambiar el estado');
            }
            this.processing = false;
          },
          error: () => {
            this.toastService.showError('Error', 'Error al cambiar el estado del Evento');
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
