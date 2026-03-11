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
import { CatServidoresModbusService } from '../../services/cat-servidores-modbus.service';
import { CatLineasService } from '../../services/cat-lineas.service';
import { CatServidoresModbusDTO, ActivarDesactivarServidorModbusDTO } from '../../interfaces/cat-servidores-modbus-dto.interface';
import { CatLineaDTO } from '../../interfaces/cat-linea-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

// Component
import { ServidorModbusFormComponent } from '../../components/servidor-modbus-form/servidor-modbus-form.component';

@Component({
  selector: 'app-servidores-modbus-list',
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
    ServidorModbusFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './servidores-modbus-list.component.html',
  styleUrl: './servidores-modbus-list.component.scss'
})
export class ServidoresModbusListComponent implements OnInit {
  servidores: CatServidoresModbusDTO[] = [];
  lineas: CatLineaDTO[] = [];
  selectedServidor: CatServidoresModbusDTO | null = null;
  showDialog: boolean = false;
  loading: boolean = false;
  processing: boolean = false;
  isEditMode: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private catServidoresModbusService: CatServidoresModbusService,
    private catLineasService: CatLineasService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarLineas();
    this.cargarServidores();
  }

  cargarLineas() {
    this.catLineasService.obtenerTodasLasLineas().subscribe({
      next: (response: ApiResponse<CatLineaDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.lineas = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar líneas:', error);
      }
    });
  }

  cargarServidores() {
    this.loading = true;
    this.catServidoresModbusService.obtenerTodosLosServidoresModbus().subscribe({
      next: (response: ApiResponse<CatServidoresModbusDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.servidores = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar los Servidores Modbus');
          this.servidores = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError('Error', 'Error al cargar los Servidores Modbus');
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

  abrirDialogEditar(servidor: CatServidoresModbusDTO) {
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

  getNombreLinea(idLinea: number | null): string {
    if (!idLinea) return '-';
    const linea = this.lineas.find(l => l.idLinea === idLinea);
    return linea ? linea.nombre : `ID: ${idLinea}`;
  }

  getUniqueLinea() {
    const lineasIds = new Set<number>();
    this.servidores.forEach(s => {
      if (s.idLinea) lineasIds.add(s.idLinea);
    });
    return Array.from(lineasIds).map(id => {
      const linea = this.lineas.find(l => l.idLinea === id);
      return { label: linea ? linea.nombre : `ID: ${id}`, value: id };
    });
  }

  cambiarEstado(servidor: CatServidoresModbusDTO) {
    const nuevoEstado = !servidor.estaActivo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} el Servidor Modbus "${servidor.nombre || 'ID: ' + servidor.idServidorModbus}"?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const dto: ActivarDesactivarServidorModbusDTO = {
          idServidorModbus: servidor.idServidorModbus,
          estaActivo: nuevoEstado
        };

        this.catServidoresModbusService.activarDesactivarServidorModbus(dto).subscribe({
          next: (response: ApiResponse<CatServidoresModbusDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarServidores();
            } else {
              this.toastService.showError('Error', response.message || 'Error al cambiar el estado');
            }
            this.processing = false;
          },
          error: (error) => {
            this.toastService.showError('Error', 'Error al cambiar el estado del Servidor Modbus');
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
