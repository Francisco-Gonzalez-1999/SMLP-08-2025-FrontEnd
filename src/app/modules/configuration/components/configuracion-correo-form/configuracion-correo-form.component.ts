import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services e Interfaces
import { CatConfiguracionCorreosService } from '../../services/cat-configuracion-correos.service';
import { CatConfiguracionCorreoDTO } from '../../interfaces/cat-configuracion-correo-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-configuracion-correo-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputSwitchModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './configuracion-correo-form.component.html',
  styleUrl: './configuracion-correo-form.component.scss'
})
export class ConfiguracionCorreoFormComponent implements OnInit, OnChanges {
  @Input() configuracion: CatConfiguracionCorreoDTO | null = null;
  @Input() isEditMode: boolean = false;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formData: Partial<CatConfiguracionCorreoDTO> = {
    idConfiguracionCorreo: 0,
    tipoConfiguracion: '',
    nombre: null,
    email: '',
    estaActivo: true
  };

  loading: boolean = false;

  constructor(
    private catConfiguracionCorreosService: CatConfiguracionCorreosService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['configuracion'] && !changes['configuracion'].firstChange) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    if (this.configuracion && this.isEditMode) {
      this.formData = {
        idConfiguracionCorreo: this.configuracion.idConfiguracionCorreo,
        tipoConfiguracion: this.configuracion.tipoConfiguracion,
        nombre: this.configuracion.nombre,
        email: this.configuracion.email,
        estaActivo: this.configuracion.estaActivo
      };
    } else {
      this.formData = {
        idConfiguracionCorreo: 0,
        tipoConfiguracion: '',
        nombre: null,
        email: '',
        estaActivo: true
      };
    }
  }

  guardar() {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    const dto: CatConfiguracionCorreoDTO = {
      idConfiguracionCorreo: this.formData.idConfiguracionCorreo!,
      tipoConfiguracion: this.formData.tipoConfiguracion!,
      nombre: this.formData.nombre ?? null,
      email: this.formData.email!,
      estaActivo: this.formData.estaActivo ?? true
    };

    if (this.isEditMode) {
      this.catConfiguracionCorreosService.actualizarConfiguracionCorreo(dto).subscribe({
        next: (response: ApiResponse<CatConfiguracionCorreoDTO>) => {
          if (response.statusCode === 200) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al actualizar la configuración de correo');
          }
          this.loading = false;
        },
        error: () => {
          this.toastService.showError('Error', 'Error al actualizar la configuración de correo');
          this.loading = false;
        }
      });
    } else {
      this.catConfiguracionCorreosService.crearConfiguracionCorreo(dto).subscribe({
        next: (response: ApiResponse<CatConfiguracionCorreoDTO>) => {
          if (response.statusCode === 201) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al crear la configuración de correo');
          }
          this.loading = false;
        },
        error: () => {
          this.toastService.showError('Error', 'Error al crear la configuración de correo');
          this.loading = false;
        }
      });
    }
  }

  cancelar() {
    this.cancelado.emit();
  }

  validarFormulario(): boolean {
    if (!this.formData.tipoConfiguracion || this.formData.tipoConfiguracion.trim() === '') {
      this.toastService.showWarn('Validación', 'El tipo de configuración es requerido');
      return false;
    }
    if (!this.formData.email || this.formData.email.trim() === '') {
      this.toastService.showWarn('Validación', 'El email es requerido');
      return false;
    }
    return true;
  }
}
