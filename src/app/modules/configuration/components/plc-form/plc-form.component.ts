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
import { CatPlcsService } from '../../services/cat-plcs.service';
import { CatPlcDTO } from '../../interfaces/cat-plc-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';

@Component({
  selector: 'app-plc-form',
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
  templateUrl: './plc-form.component.html',
  styleUrl: './plc-form.component.scss'
})
export class PlcFormComponent implements OnInit, OnChanges {
  @Input() plc: CatPlcDTO | null = null;
  @Input() isEditMode: boolean = false;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formData: CatPlcDTO = {
    idPlc: 0,
    nombre: null,
    descripcion: null,
    direccionIp: null,
    puerto: null,
    tipoComunicacion: null,
    estaActivo: true,
    fechaCreacion: new Date()
  };

  tiposComunicacion = [
    { label: 'Modbus TCP', value: 'Modbus TCP' },
    { label: 'Modbus RTU', value: 'Modbus RTU' },
    { label: 'Ethernet/IP', value: 'Ethernet/IP' },
    { label: 'OPC UA', value: 'OPC UA' },
    { label: 'Otro', value: 'Otro' }
  ];

  loading: boolean = false;

  constructor(
    private catPlcsService: CatPlcsService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['plc'] && !changes['plc'].firstChange) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    if (this.plc && this.isEditMode) {
      this.formData = {
        idPlc: this.plc.idPlc,
        nombre: this.plc.nombre,
        descripcion: this.plc.descripcion,
        direccionIp: this.plc.direccionIp,
        puerto: this.plc.puerto,
        tipoComunicacion: this.plc.tipoComunicacion,
        estaActivo: this.plc.estaActivo,
        fechaCreacion: this.plc.fechaCreacion
      };
    } else {
      // Resetear formulario para modo creación
      this.formData = {
        idPlc: 0,
        nombre: null,
        descripcion: null,
        direccionIp: null,
        puerto: null,
        tipoComunicacion: null,
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
      this.catPlcsService.actualizarPLC(this.formData).subscribe({
        next: (response: ApiResponse<CatPlcDTO>) => {
          if (response.statusCode === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: response.message
            });
            this.guardado.emit();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Error al actualizar el PLC'
            });
          }
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el PLC'
          });
          this.loading = false;
        }
      });
    } else {
      this.catPlcsService.crearPLC(this.formData).subscribe({
        next: (response: ApiResponse<CatPlcDTO>) => {
          if (response.statusCode === 201) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: response.message
            });
            this.guardado.emit();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Error al crear el PLC'
            });
          }
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el PLC'
          });
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
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El nombre es requerido'
      });
      return false;
    }

    // Validar IP si se proporciona
    if (this.formData.direccionIp && this.formData.direccionIp.trim() !== '') {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(this.formData.direccionIp)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validación',
          detail: 'La dirección IP no tiene un formato válido'
        });
        return false;
      }
    }

    // Validar puerto si se proporciona
    if (this.formData.puerto !== null && (this.formData.puerto < 1 || this.formData.puerto > 65535)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El puerto debe estar entre 1 y 65535'
      });
      return false;
    }

    return true;
  }
}
