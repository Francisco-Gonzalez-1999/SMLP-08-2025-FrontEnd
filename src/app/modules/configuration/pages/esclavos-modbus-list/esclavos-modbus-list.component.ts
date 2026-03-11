import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';

// Services e Interfaces
import { CatEsclavosModbusService } from '../../services/cat-esclavos-modbus.service';
import { CatEsclavosModbuDTO, ActivarDesactivarEsclavoModbusDTO } from '../../interfaces/cat-esclavos-modbus-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

// Component
import { EsclavoModbusFormComponent } from '../../components/esclavo-modbus-form/esclavo-modbus-form.component';

@Component({
  selector: 'app-esclavos-modbus-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    DropdownModule,
    EsclavoModbusFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './esclavos-modbus-list.component.html',
  styleUrl: './esclavos-modbus-list.component.scss'
})
export class EsclavosModbusListComponent implements OnInit {
  esclavos: CatEsclavosModbuDTO[] = [];
  selectedEsclavo: CatEsclavosModbuDTO | null = null;
  showDialog: boolean = false;
  loading: boolean = false;
  processing: boolean = false;
  isEditMode: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private catEsclavosModbusService: CatEsclavosModbusService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarEsclavos();
  }

  cargarEsclavos() {
    this.loading = true;
    this.catEsclavosModbusService.obtenerTodosLosEsclavosModbus().subscribe({
      next: (response: ApiResponse<CatEsclavosModbuDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.esclavos = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar los Esclavos Modbus');
          this.esclavos = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError('Error', 'Error al cargar los Esclavos Modbus');
        this.esclavos = [];
        this.loading = false;
      }
    });
  }

  abrirDialogCrear() {
    this.isEditMode = false;
    this.selectedEsclavo = null;
    this.showDialog = true;
  }

  abrirDialogEditar(esclavo: CatEsclavosModbuDTO) {
    this.isEditMode = true;
    this.selectedEsclavo = { ...esclavo };
    this.showDialog = true;
  }

  cerrarDialog() {
    this.showDialog = false;
    this.selectedEsclavo = null;
  }

  onEsclavoGuardado() {
    this.cerrarDialog();
    this.processing = true;
    this.cargarEsclavos();
    this.processing = false;
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getUniqueFase() {
    const fases = new Set<string>();
    this.esclavos.forEach(e => {
      if (e.fase) fases.add(e.fase);
    });
    return Array.from(fases);
  }

  cambiarEstado(esclavo: CatEsclavosModbuDTO) {
    const nuevoEstado = !esclavo.estaActivo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} el Esclavo Modbus "${esclavo.nombre}"?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const dto: ActivarDesactivarEsclavoModbusDTO = {
          idEsclavoModbus: esclavo.idEsclavoModbus,
          estaActivo: nuevoEstado
        };

        this.catEsclavosModbusService.activarDesactivarEsclavoModbus(dto).subscribe({
          next: (response: ApiResponse<CatEsclavosModbuDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarEsclavos();
            } else {
              this.toastService.showError('Error', response.message || 'Error al cambiar el estado');
            }
            this.processing = false;
          },
          error: (error) => {
            this.toastService.showError('Error', 'Error al cambiar el estado del Esclavo Modbus');
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
