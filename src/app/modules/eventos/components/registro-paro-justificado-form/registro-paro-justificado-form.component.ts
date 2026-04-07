import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';

// Services e Interfaces
import { EvtRegistroParosJustificadosService } from '../../services/evt-registro-paros-justificados.service';
import { CatEstadosParosService } from '../../../configuration/services/cat-estados-paros.service';
import { AuthService } from '../../../admin/services/auth.service';
import { EvtRegistroParosJustificadoDTO } from '../../interfaces/evt-registro-paros-justificado-dto.interface';
import { CatEstadosParoDTO } from '../../../configuration/interfaces/cat-estados-paro-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-registro-paro-justificado-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DividerModule,
    TagModule,
    DropdownModule
  ],
  templateUrl: './registro-paro-justificado-form.component.html',
  styleUrl: './registro-paro-justificado-form.component.scss'
})
export class RegistroParoJustificadoFormComponent implements OnInit, OnChanges {
  @Input() registro: EvtRegistroParosJustificadoDTO | null = null;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  causaRaiz: string = '';
  subCausa: string = '';
  comentarios: string = '';
  idEstadoParo: number | null = null;

  estadosParo: CatEstadosParoDTO[] = [];
  loading: boolean = false;

  constructor(
    private evtRegistroParosJustificadosService: EvtRegistroParosJustificadosService,
    private catEstadosParosService: CatEstadosParosService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarEstadosParo();
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['registro'] && !changes['registro'].firstChange) {
      this.cargarDatos();
    }
  }

  cargarEstadosParo() {
    this.catEstadosParosService.obtenerTodosLosEstadosParo().subscribe({
      next: (response) => {
        if (response.statusCode === 200 && response.data) {
          this.estadosParo = response.data.filter(e => e.estaActivo);
        }
      },
      error: () => {
        this.toastService.showWarn('Advertencia', 'No se pudieron cargar los estados de paro');
      }
    });
  }

  cargarDatos() {
    if (this.registro) {
      this.causaRaiz = this.registro.causaRaiz || '';
      this.subCausa = this.registro.subCausa || '';
      this.comentarios = this.registro.comentarios || '';
      this.idEstadoParo = this.registro.idEstadoParo ?? null;
    } else {
      this.causaRaiz = '';
      this.subCausa = '';
      this.comentarios = '';
      this.idEstadoParo = null;
    }
  }

  getEstadoParoNombre(idEstadoParo: number): string {
    const estado = this.estadosParo.find(e => e.idEstadoParo === idEstadoParo);
    return estado?.nombre ?? '';
  }

  getEstadoParoDescripcion(idEstadoParo: number): string | null {
    const estado = this.estadosParo.find(e => e.idEstadoParo === idEstadoParo);
    return estado?.descripcion ?? null;
  }

  guardar() {
    if (!this.registro) {
      this.toastService.showError('Error', 'No hay registro seleccionado');
      return;
    }

    const user = this.authService.getUserData();
    const usuarioUltimaMod = user?.email || user?.username || 'Sistema';

    const causaRaizTrim = this.causaRaiz.trim();
    const idEstadoParoToSend = this.idEstadoParo ?? (causaRaizTrim ? 3 : null);

    this.loading = true;

    this.evtRegistroParosJustificadosService.actualizarRegistroParoJustificado({
      idRegistroParo: this.registro.idRegistroParo,
      causaRaiz: causaRaizTrim || null,
      subCausa: this.subCausa.trim() || null,
      comentarios: (this.registro.comentarios ?? '').trim() || null,
      idEstadoParo: idEstadoParoToSend,
      usuarioUltimaMod
    }).subscribe({
      next: (response: ApiResponse<EvtRegistroParosJustificadoDTO>) => {
        if (response.statusCode === 200) {
          this.toastService.showSuccess('Éxito', response.message);
          this.guardado.emit();
        } else {
          this.toastService.showError('Error', response.message || 'Error al actualizar la justificación');
        }
        this.loading = false;
      },
      error: () => {
        this.toastService.showError('Error', 'Error al actualizar la justificación');
        this.loading = false;
      }
    });
  }

  cancelar() {
    this.cancelado.emit();
  }
}
