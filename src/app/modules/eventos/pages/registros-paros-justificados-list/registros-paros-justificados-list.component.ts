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
import { EvtRegistroParosJustificadosService } from '../../services/evt-registro-paros-justificados.service';
import { AuthService } from '../../../admin/services/auth.service';
import {
  EvtRegistroParosJustificadoDTO,
  ActivarDesactivarRegistroParoJustificadoDTO
} from '../../interfaces/evt-registro-paros-justificado-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

// Component
import { RegistroParoJustificadoFormComponent } from '../../components/registro-paro-justificado-form/registro-paro-justificado-form.component';

@Component({
  selector: 'app-registros-paros-justificados-list',
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
    RegistroParoJustificadoFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './registros-paros-justificados-list.component.html',
  styleUrl: './registros-paros-justificados-list.component.scss'
})
export class RegistrosParosJustificadosListComponent implements OnInit {
  registros: EvtRegistroParosJustificadoDTO[] = [];
  selectedRegistro: EvtRegistroParosJustificadoDTO | null = null;
  showDialog: boolean = false;
  loading: boolean = false;
  processing: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private evtRegistroParosJustificadosService: EvtRegistroParosJustificadosService,
    private authService: AuthService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarRegistros();
  }

  cargarRegistros() {
    this.loading = true;
    this.evtRegistroParosJustificadosService.obtenerRegistrosParosJustificados().subscribe({
      next: (response: ApiResponse<EvtRegistroParosJustificadoDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.registros = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar los registros');
          this.registros = [];
        }
        this.loading = false;
      },
      error: () => {
        this.toastService.showError('Error', 'Error al cargar los registros de paros justificados');
        this.registros = [];
        this.loading = false;
      }
    });
  }

  abrirDialogEditar(registro: EvtRegistroParosJustificadoDTO) {
    this.selectedRegistro = { ...registro };
    this.showDialog = true;
  }

  cerrarDialog() {
    this.showDialog = false;
    this.selectedRegistro = null;
  }

  onRegistroGuardado() {
    this.cerrarDialog();
    this.processing = true;
    this.cargarRegistros();
    this.processing = false;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  cambiarEstado(registro: EvtRegistroParosJustificadoDTO) {
    const accion = registro.estaActivo ? 'desactivar' : 'activar';
    const detalle = `Línea: ${registro.lineaNombre || '-'} | Evento: ${registro.eventoNombre || '-'}`;
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} este registro? ${detalle}`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const user = this.authService.getUserData();
        const usuarioUltimaMod = user?.email || user?.username || 'Sistema';

        const dto: ActivarDesactivarRegistroParoJustificadoDTO = {
          idRegistroParo: registro.idRegistroParo,
          estaActivo: !registro.estaActivo,
          usuarioUltimaMod
        };

        this.evtRegistroParosJustificadosService.activarDesactivarRegistroParoJustificado(dto).subscribe({
          next: (response: ApiResponse<EvtRegistroParosJustificadoDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarRegistros();
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
