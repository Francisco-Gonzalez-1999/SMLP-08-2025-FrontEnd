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
import { CatPlcsService } from '../../services/cat-plcs.service';
import { CatPlcDTO, ActivarDesactivarPlcDTO } from '../../interfaces/cat-plc-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

// Component
import { PlcFormComponent } from '../../components/plc-form/plc-form.component';

@Component({
  selector: 'app-plcs-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ToggleButtonModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    DropdownModule,
    PlcFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './plcs-list.component.html',
  styleUrl: './plcs-list.component.scss'
})
export class PlcsListComponent implements OnInit {
  plcs: CatPlcDTO[] = [];
  selectedPlc: CatPlcDTO | null = null;
  showDialog: boolean = false;
  loading: boolean = false;
  processing: boolean = false; // Para overlay-spinner en operaciones
  isEditMode: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private catPlcsService: CatPlcsService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarPLCs();
  }

  cargarPLCs() {
    this.loading = true;
    this.catPlcsService.obtenerTodosLosPLCs().subscribe({
      next: (response: ApiResponse<CatPlcDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.plcs = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar los PLCs');
          this.plcs = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError('Error', 'Error al cargar los PLCs');
        this.plcs = [];
        this.loading = false;
      }
    });
  }

  abrirDialogCrear() {
    this.isEditMode = false;
    this.selectedPlc = null;
    this.showDialog = true;
  }

  abrirDialogEditar(plc: CatPlcDTO) {
    this.isEditMode = true;
    this.selectedPlc = { ...plc };
    this.showDialog = true;
  }

  cerrarDialog() {
    this.showDialog = false;
    this.selectedPlc = null;
  }

  onPlcGuardado() {
    this.cerrarDialog();
    this.processing = true;
    this.cargarPLCs();
    this.processing = false;
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getUniqueTipoComunicacion() {
    const tipos = new Set<string>();
    this.plcs.forEach(p => {
      if (p.tipoComunicacion) tipos.add(p.tipoComunicacion);
    });
    return Array.from(tipos);
  }


  cambiarEstado(plc: CatPlcDTO) {
    const accion = plc.estaActivo ? 'desactivar' : 'activar';
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} el PLC "${plc.nombre}"?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const dto: ActivarDesactivarPlcDTO = {
          idPlc: plc.idPlc,
          estaActivo: !plc.estaActivo
        };

        this.catPlcsService.activarDesactivarPLC(dto).subscribe({
          next: (response: ApiResponse<CatPlcDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarPLCs();
            } else {
              this.toastService.showError('Error', response.message || 'Error al cambiar el estado');
            }
            this.processing = false;
          },
          error: (error) => {
            this.toastService.showError('Error', 'Error al cambiar el estado del PLC');
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
