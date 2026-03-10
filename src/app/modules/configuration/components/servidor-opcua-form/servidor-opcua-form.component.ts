import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PasswordModule } from 'primeng/password';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services e Interfaces
import { CatServidoresOpcuaService } from '../../services/cat-servidores-opcua.service';
import { CatServidoresOpcuaDTO } from '../../interfaces/cat-servidores-opcua-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-servidor-opcua-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    PasswordModule,
    InputSwitchModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './servidor-opcua-form.component.html',
  styleUrl: './servidor-opcua-form.component.scss'
})
export class ServidorOpcuaFormComponent implements OnInit, OnChanges {
  @Input() servidor: CatServidoresOpcuaDTO | null = null;
  @Input() isEditMode: boolean = false;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formData: CatServidoresOpcuaDTO = {
    idServidorOpcua: 0,
    nombre: '',
    descripcion: null,
    direccionUrl: '',
    usuario: null,
    contrasena: null,
    timeoutValueMilisegundos: null,
    estaActivo: true,
    fechaCreacion: new Date()
  };

  loading: boolean = false;

  constructor(
    private catServidoresOpcuaService: CatServidoresOpcuaService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['servidor'] && !changes['servidor'].firstChange) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    if (this.servidor && this.isEditMode) {
      this.formData = {
        idServidorOpcua: this.servidor.idServidorOpcua,
        nombre: this.servidor.nombre,
        descripcion: this.servidor.descripcion,
        direccionUrl: this.servidor.direccionUrl,
        usuario: this.servidor.usuario,
        contrasena: this.servidor.contrasena,
        timeoutValueMilisegundos: this.servidor.timeoutValueMilisegundos,
        estaActivo: this.servidor.estaActivo,
        fechaCreacion: this.servidor.fechaCreacion
      };
    } else {
      this.formData = {
        idServidorOpcua: 0,
        nombre: '',
        descripcion: null,
        direccionUrl: '',
        usuario: null,
        contrasena: null,
        timeoutValueMilisegundos: null,
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
      this.catServidoresOpcuaService.actualizarServidorOpcua(this.formData).subscribe({
        next: (response: ApiResponse<CatServidoresOpcuaDTO>) => {
          if (response.statusCode === 200) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al actualizar el Servidor OPC UA');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al actualizar el Servidor OPC UA');
          this.loading = false;
        }
      });
    } else {
      this.catServidoresOpcuaService.crearServidorOpcua(this.formData).subscribe({
        next: (response: ApiResponse<CatServidoresOpcuaDTO>) => {
          if (response.statusCode === 201) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al crear el Servidor OPC UA');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al crear el Servidor OPC UA');
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

    if (!this.formData.direccionUrl || this.formData.direccionUrl.trim() === '') {
      this.toastService.showWarn('Validación', 'La dirección URL es requerida');
      return false;
    }

    if (this.formData.timeoutValueMilisegundos !== null && this.formData.timeoutValueMilisegundos < 0) {
      this.toastService.showWarn('Validación', 'El valor de timeout no puede ser negativo');
      return false;
    }

    return true;
  }
}
