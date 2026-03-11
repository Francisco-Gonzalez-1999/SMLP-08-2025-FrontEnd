import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ColorPickerModule } from 'primeng/colorpicker';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services e Interfaces
import { CatEstadosParosService } from '../../services/cat-estados-paros.service';
import { CatEstadosParoDTO } from '../../interfaces/cat-estados-paro-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-estado-paro-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    InputSwitchModule,
    ColorPickerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './estado-paro-form.component.html',
  styleUrl: './estado-paro-form.component.scss'
})
export class EstadoParoFormComponent implements OnInit, OnChanges {
  @Input() estadoParo: CatEstadosParoDTO | null = null;
  @Input() isEditMode: boolean = false;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formData: CatEstadosParoDTO = {
    idEstadoParo: 0,
    nombre: '',
    descripcion: null,
    colorHex: null,
    estaActivo: true
  };

  colorValue: string = '#6366f1';

  loading: boolean = false;

  constructor(
    private catEstadosParosService: CatEstadosParosService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['estadoParo'] && !changes['estadoParo'].firstChange) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    if (this.estadoParo && this.isEditMode) {
      this.formData = {
        idEstadoParo: this.estadoParo.idEstadoParo,
        nombre: this.estadoParo.nombre,
        descripcion: this.estadoParo.descripcion,
        colorHex: this.estadoParo.colorHex,
        estaActivo: this.estadoParo.estaActivo
      };
      this.colorValue = this.estadoParo.colorHex && this.estadoParo.colorHex.startsWith('#')
        ? this.estadoParo.colorHex
        : this.estadoParo.colorHex ? '#' + this.estadoParo.colorHex : '#6366f1';
    } else {
      this.formData = {
        idEstadoParo: 0,
        nombre: '',
        descripcion: null,
        colorHex: null,
        estaActivo: true
      };
      this.colorValue = '#6366f1';
    }
  }

  guardar() {
    if (!this.validarFormulario()) {
      return;
    }

    this.formData.colorHex = this.colorValue || null;
    this.loading = true;

    if (this.isEditMode) {
      this.catEstadosParosService.actualizarEstadoParo(this.formData).subscribe({
        next: (response: ApiResponse<CatEstadosParoDTO>) => {
          if (response.statusCode === 200) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al actualizar el Estado de paro');
          }
          this.loading = false;
        },
        error: () => {
          this.toastService.showError('Error', 'Error al actualizar el Estado de paro');
          this.loading = false;
        }
      });
    } else {
      this.catEstadosParosService.crearEstadoParo(this.formData).subscribe({
        next: (response: ApiResponse<CatEstadosParoDTO>) => {
          if (response.statusCode === 201) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al crear el Estado de paro');
          }
          this.loading = false;
        },
        error: () => {
          this.toastService.showError('Error', 'Error al crear el Estado de paro');
          this.loading = false;
        }
      });
    }
  }

  cancelar() {
    this.cancelado.emit();
  }

  validarFormulario(): boolean {
    if (!this.formData.nombre || this.formData.nombre.trim() === '') {
      this.toastService.showWarn('Validación', 'El nombre es requerido');
      return false;
    }
    return true;
  }
}
