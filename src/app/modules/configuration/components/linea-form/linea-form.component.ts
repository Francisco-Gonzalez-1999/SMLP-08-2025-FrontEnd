import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services e Interfaces
import { CatLineasService } from '../../services/cat-lineas.service';
import { CatLineaDTO } from '../../interfaces/cat-linea-dto.interface';
import { CatPlantaDTO } from '../../interfaces/cat-planta-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-linea-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    InputSwitchModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './linea-form.component.html',
  styleUrl: './linea-form.component.scss'
})
export class LineaFormComponent implements OnInit, OnChanges {
  @Input() linea: CatLineaDTO | null = null;
  @Input() isEditMode: boolean = false;
  @Input() plantas: CatPlantaDTO[] = [];
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formData: CatLineaDTO = {
    idLinea: 0,
    idPlanta: 0,
    nombre: '',
    descripcion: null,
    estaActivo: true,
    fechaCreacion: new Date()
  };

  plantasOptions: any[] = [];
  loading: boolean = false;

  constructor(
    private catLineasService: CatLineasService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarOpcionesPlantas();
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['linea'] && !changes['linea'].firstChange) {
      this.cargarDatos();
    }
    if (changes['plantas']) {
      this.cargarOpcionesPlantas();
    }
  }

  cargarOpcionesPlantas() {
    this.plantasOptions = this.plantas.map(p => ({
      label: p.nombre,
      value: p.idPlanta
    }));
  }

  cargarDatos() {
    if (this.linea && this.isEditMode) {
      this.formData = {
        idLinea: this.linea.idLinea,
        idPlanta: this.linea.idPlanta,
        nombre: this.linea.nombre,
        descripcion: this.linea.descripcion,
        estaActivo: this.linea.estaActivo,
        fechaCreacion: this.linea.fechaCreacion
      };
    } else {
      this.formData = {
        idLinea: 0,
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
      this.catLineasService.actualizarLinea(this.formData).subscribe({
        next: (response: ApiResponse<CatLineaDTO>) => {
          if (response.statusCode === 200) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al actualizar la Línea');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al actualizar la Línea');
          this.loading = false;
        }
      });
    } else {
      this.catLineasService.crearLinea(this.formData).subscribe({
        next: (response: ApiResponse<CatLineaDTO>) => {
          if (response.statusCode === 201) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al crear la Línea');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al crear la Línea');
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

    if (!this.formData.idPlanta || this.formData.idPlanta <= 0) {
      this.toastService.showWarn('Validación', 'Debe seleccionar una Planta');
      return false;
    }

    return true;
  }
}
