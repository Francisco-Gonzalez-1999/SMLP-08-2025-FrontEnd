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
import { CatGruposTagsService } from '../../services/cat-grupos-tags.service';
import { CatGruposTagDTO } from '../../interfaces/cat-grupos-tag-dto.interface';
import { CatPlantaDTO } from '../../interfaces/cat-planta-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-grupo-tag-form',
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
  templateUrl: './grupo-tag-form.component.html',
  styleUrl: './grupo-tag-form.component.scss'
})
export class GrupoTagFormComponent implements OnInit, OnChanges {
  @Input() grupoTag: CatGruposTagDTO | null = null;
  @Input() isEditMode: boolean = false;
  @Input() plantas: CatPlantaDTO[] = [];
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formData: CatGruposTagDTO = {
    idGrupoTag: 0,
    idPlanta: null,
    nombre: null,
    descripcion: null,
    estaActivo: true,
    fechaCreacion: new Date()
  };

  plantasOptions: any[] = [];
  loading: boolean = false;

  constructor(
    private catGruposTagsService: CatGruposTagsService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarOpcionesPlantas();
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['grupoTag'] && !changes['grupoTag'].firstChange) {
      this.cargarDatos();
    }
    if (changes['plantas']) {
      this.cargarOpcionesPlantas();
    }
  }

  cargarOpcionesPlantas() {
    this.plantasOptions = [
      { label: 'Ninguna', value: null },
      ...this.plantas.map(p => ({
        label: p.nombre,
        value: p.idPlanta
      }))
    ];
  }

  cargarDatos() {
    if (this.grupoTag && this.isEditMode) {
      this.formData = {
        idGrupoTag: this.grupoTag.idGrupoTag,
        idPlanta: this.grupoTag.idPlanta,
        nombre: this.grupoTag.nombre,
        descripcion: this.grupoTag.descripcion,
        estaActivo: this.grupoTag.estaActivo,
        fechaCreacion: this.grupoTag.fechaCreacion
      };
    } else {
      this.formData = {
        idGrupoTag: 0,
        idPlanta: null,
        nombre: null,
        descripcion: null,
        estaActivo: true,
        fechaCreacion: new Date()
      };
    }
  }

  guardar() {
    this.loading = true;

    if (this.isEditMode) {
      this.catGruposTagsService.actualizarGrupoTag(this.formData).subscribe({
        next: (response: ApiResponse<CatGruposTagDTO>) => {
          if (response.statusCode === 200) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al actualizar el Grupo de Tags');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al actualizar el Grupo de Tags');
          this.loading = false;
        }
      });
    } else {
      this.catGruposTagsService.crearGrupoTag(this.formData).subscribe({
        next: (response: ApiResponse<CatGruposTagDTO>) => {
          if (response.statusCode === 201) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al crear el Grupo de Tags');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al crear el Grupo de Tags');
          this.loading = false;
        }
      });
    }
  }

  cancelar() {
    this.cancelado.emit();
  }
}
