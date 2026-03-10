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
import { CatServidoresOpcuaService } from '../../services/cat-servidores-opcua.service';
import { CatServidoresOpcuaDTO, ActivarDesactivarServidorOpcuaDTO } from '../../interfaces/cat-servidores-opcua-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

// Component
import { ServidorOpcuaFormComponent } from '../../components/servidor-opcua-form/servidor-opcua-form.component';

@Component({
  selector: 'app-servidores-opcua-list',
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
    ServidorOpcuaFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './servidores-opcua-list.component.html',
  styleUrl: './servidores-opcua-list.component.scss'
})
export class ServidoresOpcuaListComponent implements OnInit {
  servidores: CatServidoresOpcuaDTO[] = [];
  selectedServidor: CatServidoresOpcuaDTO | null = null;
  showDialog: boolean = false;
  loading: boolean = false;
  processing: boolean = false;
  isEditMode: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private catServidoresOpcuaService: CatServidoresOpcuaService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarServidores();
  }

  cargarServidores() {
    this.loading = true;
    this.catServidoresOpcuaService.obtenerTodosLosServidoresOpcua().subscribe({
      next: (response: ApiResponse<CatServidoresOpcuaDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.servidores = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar los Servidores OPC UA');
          this.servidores = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError('Error', 'Error al cargar los Servidores OPC UA');
        this.servidores = [];
        this.loading = false;
      }
    });
  }

  abrirDialogCrear() {
    this.isEditMode = false;
    this.selectedServidor = null;
    this.showDialog = true;
  }

  abrirDialogEditar(servidor: CatServidoresOpcuaDTO) {
    this.isEditMode = true;
    this.selectedServidor = { ...servidor };
    this.showDialog = true;
  }

  cerrarDialog() {
    this.showDialog = false;
    this.selectedServidor = null;
  }

  onServidorGuardado() {
    this.cerrarDialog();
    this.processing = true;
    this.cargarServidores();
    this.processing = false;
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  cambiarEstado(servidor: CatServidoresOpcuaDTO) {
    const accion = servidor.estaActivo ? 'desactivar' : 'activar';
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} el Servidor OPC UA "${servidor.nombre}"?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const dto: ActivarDesactivarServidorOpcuaDTO = {
          idServidorOpcua: servidor.idServidorOpcua,
          estaActivo: !servidor.estaActivo
        };

        this.catServidoresOpcuaService.activarDesactivarServidorOpcua(dto).subscribe({
          next: (response: ApiResponse<CatServidoresOpcuaDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarServidores();
            } else {
              this.toastService.showError('Error', response.message || 'Error al cambiar el estado');
            }
            this.processing = false;
          },
          error: (error) => {
            this.toastService.showError('Error', 'Error al cambiar el estado del Servidor OPC UA');
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
