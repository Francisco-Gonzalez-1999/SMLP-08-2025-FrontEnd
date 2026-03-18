import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';

// Services e Interfaces
import { EvtRegistroParosJustificadosService } from '../../services/evt-registro-paros-justificados.service';
import { CatLineasService } from '../../../configuration/services/cat-lineas.service';
import { CatPlantasService } from '../../../configuration/services/cat-plantas.service';
import { CatEstadosParosService } from '../../../configuration/services/cat-estados-paros.service';
import { AuthService } from '../../../admin/services/auth.service';
import {
  EvtRegistroParosJustificadoDTO,
  ActivarDesactivarRegistroParoJustificadoDTO,
  CrearRegistroParoManualDTO
} from '../../interfaces/evt-registro-paros-justificado-dto.interface';
import { CatLineaDTO } from '../../../configuration/interfaces/cat-linea-dto.interface';
import { CatPlantaDTO } from '../../../configuration/interfaces/cat-planta-dto.interface';
import { CatEstadosParoDTO } from '../../../configuration/interfaces/cat-estados-paro-dto.interface';
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
    InputTextareaModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    DropdownModule,
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
  showDialogManual: boolean = false;
  loading: boolean = false;
  loadingManual: boolean = false;
  processing: boolean = false;
  globalFilter: string = '';
  lineas: CatLineaDTO[] = [];
  plantas: CatPlantaDTO[] = [];
  estadosParo: CatEstadosParoDTO[] = [];
  /** Opciones para el dropdown: "Línea X - Planta Y" con idLinea e idPlanta */
  get lineasConPlanta(): { idLinea: number; idPlanta: number; label: string }[] {
    return this.lineas.map(l => ({
      idLinea: l.idLinea,
      idPlanta: l.idPlanta,
      label: `${l.nombre} - Planta ${this.getPlantaNombreById(l.idPlanta) || '...'}`
    }));
  }
  manualForm: {
    lineaPlantaSeleccionada: { idLinea: number; idPlanta: number; label: string } | null;
    fechaRegistro: string;
    horaInicioTime: string;
    horaFinTime: string;
    idEstadoParo: number | null;
    causaRaiz: string;
    subCausa: string;
    comentarios: string;
  } = {
    lineaPlantaSeleccionada: null,
    fechaRegistro: '',
    horaInicioTime: '',
    horaFinTime: '',
    idEstadoParo: null,
    causaRaiz: '',
    subCausa: '',
    comentarios: ''
  };
  @ViewChild('dt') dt!: Table;

  constructor(
    private evtRegistroParosJustificadosService: EvtRegistroParosJustificadosService,
    private catLineasService: CatLineasService,
    private catPlantasService: CatPlantasService,
    private catEstadosParosService: CatEstadosParosService,
    private authService: AuthService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.cargarRegistros();
    this.cargarLineasYEstados();
  }

  cargarLineasYEstados() {
    this.catLineasService.obtenerTodasLasLineas().subscribe({
      next: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.lineas = res.data.filter(l => l.estaActivo);
        }
      }
    });
    this.catPlantasService.obtenerTodasLasPlantas().subscribe({
      next: (res: ApiResponse<CatPlantaDTO[]>) => {
        if (res.statusCode === 200 && res.data) {
          this.plantas = res.data.filter((p: CatPlantaDTO) => p.estaActivo);
        }
      }
    });
    this.catEstadosParosService.obtenerTodosLosEstadosParo().subscribe({
      next: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.estadosParo = res.data.filter(e => e.estaActivo);
        }
      }
    });
  }

  abrirDialogParoManual() {
    const today = new Date();
    this.manualForm = {
      lineaPlantaSeleccionada: null,
      fechaRegistro: today.toISOString().slice(0, 10),
      horaInicioTime: today.toTimeString().slice(0, 5),
      horaFinTime: '',
      idEstadoParo: 1,
      causaRaiz: '',
      subCausa: '',
      comentarios: ''
    };
    this.showDialogManual = true;
  }

  cerrarDialogManual() {
    this.showDialogManual = false;
  }

  getPlantaNombreById(idPlanta: number): string {
    const planta = this.plantas.find(p => p.idPlanta === idPlanta);
    return planta?.nombre ?? '';
  }

  guardarParoManual() {
    if (!this.manualForm.lineaPlantaSeleccionada) {
      this.toastService.showWarn('Validación', 'Seleccione la línea y planta del paro');
      return;
    }
    if (!this.manualForm.fechaRegistro || !this.manualForm.horaInicioTime) {
      this.toastService.showWarn('Validación', 'Fecha y hora de inicio son requeridos');
      return;
    }
    const user = this.authService.getUserData();
    const usuarioRegistra = user?.email || user?.username || 'Sistema';

    const horaInicioStr = this.manualForm.horaInicioTime.length === 5
      ? `${this.manualForm.horaInicioTime}:00`
      : this.manualForm.horaInicioTime;
    const horaFinStr = this.manualForm.horaFinTime
      ? (this.manualForm.horaFinTime.length === 5 ? `${this.manualForm.horaFinTime}:00` : this.manualForm.horaFinTime)
      : null;

    const { idLinea, idPlanta } = this.manualForm.lineaPlantaSeleccionada;
    const dto: CrearRegistroParoManualDTO = {
      idLinea,
      idPlanta,
      fechaRegistro: this.manualForm.fechaRegistro,
      horaInicio: `${this.manualForm.fechaRegistro}T${horaInicioStr}`,
      horaFin: horaFinStr ? `${this.manualForm.fechaRegistro}T${horaFinStr}` : null,
      idEstadoParo: this.manualForm.idEstadoParo ?? 1,
      idEvento: null,
      causaRaiz: this.manualForm.causaRaiz?.trim() || null,
      subCausa: this.manualForm.subCausa?.trim() || null,
      comentarios: this.manualForm.comentarios?.trim() || null,
      usuarioRegistra
    };

    this.loadingManual = true;
    this.evtRegistroParosJustificadosService.crearRegistroParoManual(dto).subscribe({
      next: (response: ApiResponse<EvtRegistroParosJustificadoDTO>) => {
        if (response.statusCode === 200) {
          this.toastService.showSuccess('Éxito', response.message);
          this.cerrarDialogManual();
          this.cargarRegistros();
        } else {
          this.toastService.showError('Error', response.message || 'Error al registrar el paro manual');
        }
        this.loadingManual = false;
      },
      error: () => {
        this.toastService.showError('Error', 'Error al registrar el paro manual');
        this.loadingManual = false;
      }
    });
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
    const nuevoEstado = !registro.estaActivo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    const detalle = `Línea: ${registro.lineaNombre || '-'}`;

    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${accion} este registro?\n${detalle}`,
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
          estaActivo: nuevoEstado,
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
