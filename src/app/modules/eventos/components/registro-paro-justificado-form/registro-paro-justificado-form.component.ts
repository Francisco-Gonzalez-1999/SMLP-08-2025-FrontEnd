import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

// Services e Interfaces
import { EvtRegistroParosJustificadosService } from '../../services/evt-registro-paros-justificados.service';
import { AuthService } from '../../../admin/services/auth.service';
import { EvtRegistroParosJustificadoDTO } from '../../interfaces/evt-registro-paros-justificado-dto.interface';
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
    InputTextareaModule
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

  loading: boolean = false;

  constructor(
    private evtRegistroParosJustificadosService: EvtRegistroParosJustificadosService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['registro'] && !changes['registro'].firstChange) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    if (this.registro) {
      this.causaRaiz = this.registro.causaRaiz || '';
      this.subCausa = this.registro.subCausa || '';
      this.comentarios = this.registro.comentarios || '';
    } else {
      this.causaRaiz = '';
      this.subCausa = '';
      this.comentarios = '';
    }
  }

  guardar() {
    if (!this.registro) {
      this.toastService.showError('Error', 'No hay registro seleccionado');
      return;
    }

    const user = this.authService.getUserData();
    const usuarioUltimaMod = user?.email || user?.username || 'Sistema';

    this.loading = true;

    this.evtRegistroParosJustificadosService.actualizarRegistroParoJustificado({
      idRegistroParo: this.registro.idRegistroParo,
      causaRaiz: this.causaRaiz.trim() || null,
      subCausa: this.subCausa.trim() || null,
      comentarios: this.comentarios.trim() || null,
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
