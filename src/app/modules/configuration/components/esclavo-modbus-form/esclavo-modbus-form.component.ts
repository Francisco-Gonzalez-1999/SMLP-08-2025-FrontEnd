import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services e Interfaces
import { CatEsclavosModbusService } from '../../services/cat-esclavos-modbus.service';
import { CatEsclavosModbuDTO } from '../../interfaces/cat-esclavos-modbus-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-esclavo-modbus-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    InputSwitchModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './esclavo-modbus-form.component.html',
  styleUrl: './esclavo-modbus-form.component.scss'
})
export class EsclavoModbusFormComponent implements OnInit, OnChanges {
  @Input() esclavo: CatEsclavosModbuDTO | null = null;
  @Input() isEditMode: boolean = false;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formData: CatEsclavosModbuDTO = {
    idEsclavoModbus: 0,
    idServidorModbus: null,
    nombre: null,
    descripcion: null,
    fase: null,
    registroInicio: 0,
    registroFin: 0,
    estaActivo: true,
    fechaCreacion: new Date()
  };

  loading: boolean = false;

  constructor(
    private catEsclavosModbusService: CatEsclavosModbusService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['esclavo'] && !changes['esclavo'].firstChange) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    if (this.esclavo && this.isEditMode) {
      this.formData = {
        idEsclavoModbus: this.esclavo.idEsclavoModbus,
        idServidorModbus: this.esclavo.idServidorModbus,
        nombre: this.esclavo.nombre,
        descripcion: this.esclavo.descripcion,
        fase: this.esclavo.fase,
        registroInicio: this.esclavo.registroInicio,
        registroFin: this.esclavo.registroFin,
        estaActivo: this.esclavo.estaActivo,
        fechaCreacion: this.esclavo.fechaCreacion
      };
    } else {
      this.formData = {
        idEsclavoModbus: 0,
        idServidorModbus: null,
        nombre: null,
        descripcion: null,
        fase: null,
        registroInicio: 0,
        registroFin: 0,
        estaActivo: true,
        fechaCreacion: new Date()
      };
    }
  }

  guardar() {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;

    if (this.isEditMode) {
      this.catEsclavosModbusService.actualizarEsclavoModbus(this.formData).subscribe({
        next: (response: ApiResponse<CatEsclavosModbuDTO>) => {
          if (response.statusCode === 200) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al actualizar el Esclavo Modbus');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al actualizar el Esclavo Modbus');
          this.loading = false;
        }
      });
    } else {
      this.catEsclavosModbusService.crearEsclavoModbus(this.formData).subscribe({
        next: (response: ApiResponse<CatEsclavosModbuDTO>) => {
          if (response.statusCode === 201) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al crear el Esclavo Modbus');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al crear el Esclavo Modbus');
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

    if (this.formData.registroInicio >= this.formData.registroFin) {
      this.toastService.showWarn('Validación', 'El registro de inicio debe ser menor que el registro de fin');
      return false;
    }

    if (this.formData.registroInicio < 0 || this.formData.registroFin < 0) {
      this.toastService.showWarn('Validación', 'Los registros no pueden ser negativos');
      return false;
    }

    return true;
  }
}
