import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services e Interfaces
import { CatServidoresModbusService } from '../../services/cat-servidores-modbus.service';
import { CatServidoresModbusDTO } from '../../interfaces/cat-servidores-modbus-dto.interface';
import { CatLineaDTO } from '../../interfaces/cat-linea-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-servidor-modbus-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    DropdownModule,
    InputSwitchModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './servidor-modbus-form.component.html',
  styleUrl: './servidor-modbus-form.component.scss'
})
export class ServidorModbusFormComponent implements OnInit, OnChanges {
  @Input() servidor: CatServidoresModbusDTO | null = null;
  @Input() isEditMode: boolean = false;
  @Input() lineas: CatLineaDTO[] = [];
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formData: CatServidoresModbusDTO = {
    idServidorModbus: 0,
    idLinea: null,
    nombre: null,
    descripcion: null,
    ip: '',
    puerto: 502,
    estacionId: null,
    umbralCorriente: null,
    estaActivo: true,
    fechaCreacion: new Date()
  };

  lineasOptions: any[] = [];
  loading: boolean = false;

  constructor(
    private catServidoresModbusService: CatServidoresModbusService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarOpcionesLineas();
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['servidor'] && !changes['servidor'].firstChange) {
      this.cargarDatos();
    }
    if (changes['lineas']) {
      this.cargarOpcionesLineas();
    }
  }

  cargarOpcionesLineas() {
    this.lineasOptions = [
      { label: 'Ninguna', value: null },
      ...this.lineas.map(l => ({
        label: l.nombre,
        value: l.idLinea
      }))
    ];
  }

  cargarDatos() {
    if (this.servidor && this.isEditMode) {
      this.formData = {
        idServidorModbus: this.servidor.idServidorModbus,
        idLinea: this.servidor.idLinea,
        nombre: this.servidor.nombre,
        descripcion: this.servidor.descripcion,
        ip: this.servidor.ip,
        puerto: this.servidor.puerto,
        estacionId: this.servidor.estacionId,
        umbralCorriente: this.servidor.umbralCorriente,
        estaActivo: this.servidor.estaActivo,
        fechaCreacion: this.servidor.fechaCreacion
      };
    } else {
      this.formData = {
        idServidorModbus: 0,
        idLinea: null,
        nombre: null,
        descripcion: null,
        ip: '',
        puerto: 502,
        estacionId: null,
        umbralCorriente: null,
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
      this.catServidoresModbusService.actualizarServidorModbus(this.formData).subscribe({
        next: (response: ApiResponse<CatServidoresModbusDTO>) => {
          if (response.statusCode === 200) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al actualizar el Servidor Modbus');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al actualizar el Servidor Modbus');
          this.loading = false;
        }
      });
    } else {
      this.catServidoresModbusService.crearServidorModbus(this.formData).subscribe({
        next: (response: ApiResponse<CatServidoresModbusDTO>) => {
          if (response.statusCode === 201) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al crear el Servidor Modbus');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al crear el Servidor Modbus');
          this.loading = false;
        }
      });
    }
  }

  cancelar() {
    this.cancelado.emit();
  }

  validarFormulario(): boolean {
    if (!this.formData.ip || this.formData.ip.trim() === '') {
      this.toastService.showWarn('Validación', 'La dirección IP es requerida');
      return false;
    }

    if (!this.formData.puerto || this.formData.puerto < 1 || this.formData.puerto > 65535) {
      this.toastService.showWarn('Validación', 'El puerto debe estar entre 1 y 65535');
      return false;
    }

    return true;
  }
}
