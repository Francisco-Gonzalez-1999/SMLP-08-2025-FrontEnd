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
import { CatEventosService } from '../../services/cat-eventos.service';
import { CatEventoDTO } from '../../interfaces/cat-evento-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-evento-form',
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
  templateUrl: './evento-form.component.html',
  styleUrl: './evento-form.component.scss'
})
export class EventoFormComponent implements OnInit, OnChanges {
  @Input() evento: CatEventoDTO | null = null;
  @Input() isEditMode: boolean = false;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formData: CatEventoDTO = {
    idEvento: 0,
    nombre: null,
    descripcion: null,
    estaActivo: true
  };

  loading: boolean = false;

  constructor(
    private catEventosService: CatEventosService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['evento'] && !changes['evento'].firstChange) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    if (this.evento && this.isEditMode) {
      this.formData = {
        idEvento: this.evento.idEvento,
        nombre: this.evento.nombre,
        descripcion: this.evento.descripcion,
        estaActivo: this.evento.estaActivo
      };
    } else {
      this.formData = {
        idEvento: 0,
        nombre: null,
        descripcion: null,
        estaActivo: true
      };
    }
  }

  guardar() {
    this.loading = true;

    if (this.isEditMode) {
      this.catEventosService.actualizarEvento(this.formData).subscribe({
        next: (response: ApiResponse<CatEventoDTO>) => {
          if (response.statusCode === 200) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al actualizar el Evento');
          }
          this.loading = false;
        },
        error: () => {
          this.toastService.showError('Error', 'Error al actualizar el Evento');
          this.loading = false;
        }
      });
    } else {
      this.catEventosService.crearEvento(this.formData).subscribe({
        next: (response: ApiResponse<CatEventoDTO>) => {
          if (response.statusCode === 201) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al crear el Evento');
          }
          this.loading = false;
        },
        error: () => {
          this.toastService.showError('Error', 'Error al crear el Evento');
          this.loading = false;
        }
      });
    }
  }

  cancelar() {
    this.cancelado.emit();
  }
}
