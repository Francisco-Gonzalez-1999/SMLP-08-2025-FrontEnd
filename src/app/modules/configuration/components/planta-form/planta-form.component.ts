import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services e Interfaces
import { CatPlantasService } from '../../services/cat-plantas.service';
import { CatPlantaDTO } from '../../interfaces/cat-planta-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-planta-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    InputSwitchModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './planta-form.component.html',
  styleUrl: './planta-form.component.scss'
})
export class PlantaFormComponent implements OnInit, OnChanges {
  @Input() planta: CatPlantaDTO | null = null;
  @Input() isEditMode: boolean = false;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formData: CatPlantaDTO = {
    idPlanta: 0,
    nombre: '',
    descripcion: null,
    estaActivo: true,
    fechaCreacion: new Date()
  };

  loading: boolean = false;

  constructor(
    private catPlantasService: CatPlantasService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['planta'] && !changes['planta'].firstChange) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    if (this.planta && this.isEditMode) {
      this.formData = {
        idPlanta: this.planta.idPlanta,
        nombre: this.planta.nombre,
        descripcion: this.planta.descripcion,
        estaActivo: this.planta.estaActivo,
        fechaCreacion: this.planta.fechaCreacion
      };
    } else {
      this.formData = {
        idPlanta: 0,
        nombre: '',
        descripcion: null,
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
      this.catPlantasService.actualizarPlanta(this.formData).subscribe({
        next: (response: ApiResponse<CatPlantaDTO>) => {
          if (response.statusCode === 200) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al actualizar la Planta');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al actualizar la Planta');
          this.loading = false;
        }
      });
    } else {
      this.catPlantasService.crearPlanta(this.formData).subscribe({
        next: (response: ApiResponse<CatPlantaDTO>) => {
          if (response.statusCode === 201) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al crear la Planta');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al crear la Planta');
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
