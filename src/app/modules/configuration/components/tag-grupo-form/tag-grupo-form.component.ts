import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services e Interfaces
import { CatTagsGruposService } from '../../services/cat-tags-grupos.service';
import { CatTagsService } from '../../services/cat-tags.service';
import { CatGruposTagsService } from '../../services/cat-grupos-tags.service';
import { CatTagsGrupoDTO } from '../../interfaces/cat-tags-grupo-dto.interface';
import { CatTagDTO } from '../../interfaces/cat-tag-dto.interface';
import { CatGruposTagDTO } from '../../interfaces/cat-grupos-tag-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-tag-grupo-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    InputSwitchModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './tag-grupo-form.component.html',
  styleUrl: './tag-grupo-form.component.scss'
})
export class TagGrupoFormComponent implements OnInit, OnChanges {
  @Input() tagGrupo: CatTagsGrupoDTO | null = null;
  @Input() isEditMode: boolean = false;
  @Input() tags: CatTagDTO[] = [];
  @Input() gruposTags: CatGruposTagDTO[] = [];
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formData: CatTagsGrupoDTO = {
    idTagGrupo: 0,
    idTag: null,
    idGrupoTag: null,
    estaActivo: true,
    fechaCreacion: new Date()
  };

  tagsOptions: any[] = [];
  gruposTagsOptions: any[] = [];
  loading: boolean = false;

  constructor(
    private catTagsGruposService: CatTagsGruposService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarOpciones();
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tagGrupo'] && !changes['tagGrupo'].firstChange) {
      this.cargarDatos();
    }
    if (changes['tags'] || changes['gruposTags']) {
      this.cargarOpciones();
    }
  }

  cargarOpciones() {
    this.tagsOptions = this.tags.map(t => ({
      label: `${t.nombre} (${t.nodeId})`,
      value: t.idTag
    }));

    this.gruposTagsOptions = this.gruposTags.map(g => ({
      label: g.nombre || `ID: ${g.idGrupoTag}`,
      value: g.idGrupoTag
    }));
  }

  cargarDatos() {
    if (this.tagGrupo && this.isEditMode) {
      this.formData = {
        idTagGrupo: this.tagGrupo.idTagGrupo,
        idTag: this.tagGrupo.idTag,
        idGrupoTag: this.tagGrupo.idGrupoTag,
        estaActivo: this.tagGrupo.estaActivo,
        fechaCreacion: this.tagGrupo.fechaCreacion
      };
    } else {
      this.formData = {
        idTagGrupo: 0,
        idTag: null,
        idGrupoTag: null,
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
      this.catTagsGruposService.actualizarTagGrupo(this.formData).subscribe({
        next: (response: ApiResponse<CatTagsGrupoDTO>) => {
          if (response.statusCode === 200) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al actualizar el Tag-Grupo');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al actualizar el Tag-Grupo');
          this.loading = false;
        }
      });
    } else {
      this.catTagsGruposService.crearTagGrupo(this.formData).subscribe({
        next: (response: ApiResponse<CatTagsGrupoDTO>) => {
          if (response.statusCode === 201) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al crear el Tag-Grupo');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al crear el Tag-Grupo');
          this.loading = false;
        }
      });
    }
  }

  cancelar() {
    this.cancelado.emit();
  }

  validarFormulario(): boolean {
    if (!this.formData.idTag || this.formData.idTag <= 0) {
      this.toastService.showWarn('Validación', 'Debe seleccionar un Tag');
      return false;
    }

    if (!this.formData.idGrupoTag || this.formData.idGrupoTag <= 0) {
      this.toastService.showWarn('Validación', 'Debe seleccionar un Grupo de Tags');
      return false;
    }

    return true;
  }
}
