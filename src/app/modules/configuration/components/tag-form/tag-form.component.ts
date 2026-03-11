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
import { CatTagsService } from '../../services/cat-tags.service';
import { CatPlcsService } from '../../services/cat-plcs.service';
import { CatLineasService } from '../../services/cat-lineas.service';
import { CatPlantasService } from '../../services/cat-plantas.service';
import { CatServidoresOpcuaService } from '../../services/cat-servidores-opcua.service';
import { CatTagDTO } from '../../interfaces/cat-tag-dto.interface';
import { CatPlcDTO } from '../../interfaces/cat-plc-dto.interface';
import { CatLineaDTO } from '../../interfaces/cat-linea-dto.interface';
import { CatPlantaDTO } from '../../interfaces/cat-planta-dto.interface';
import { CatServidoresOpcuaDTO } from '../../interfaces/cat-servidores-opcua-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-tag-form',
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
  templateUrl: './tag-form.component.html',
  styleUrl: './tag-form.component.scss'
})
export class TagFormComponent implements OnInit, OnChanges {
  @Input() tag: CatTagDTO | null = null;
  @Input() isEditMode: boolean = false;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formData: CatTagDTO = {
    idTag: 0,
    idPlc: 0,
    idLinea: 0,
    idServidorOpcua: 0,
    nodeId: '',
    nombre: '',
    descripcion: null,
    tipoDato: '',
    unidadMedida: null,
    valorMin: null,
    valorMax: null,
    estaActivo: true,
    fechaCreacion: new Date()
  };

  plcs: CatPlcDTO[] = [];
  lineas: CatLineaDTO[] = [];
  plantas: CatPlantaDTO[] = [];
  servidoresOpcua: CatServidoresOpcuaDTO[] = [];

  plcsOptions: any[] = [];
  lineasOptions: { label: string; value: number; plantaNombre: string }[] = [];
  servidoresOpcuaOptions: any[] = [];
  tiposDatoOptions = [
    { label: 'Boolean', value: 'Boolean' },
    { label: 'Byte', value: 'Byte' },
    { label: 'SByte', value: 'SByte' },
    { label: 'Int16', value: 'Int16' },
    { label: 'UInt16', value: 'UInt16' },
    { label: 'Int32', value: 'Int32' },
    { label: 'UInt32', value: 'UInt32' },
    { label: 'Int64', value: 'Int64' },
    { label: 'UInt64', value: 'UInt64' },
    { label: 'Float', value: 'Float' },
    { label: 'Double', value: 'Double' },
    { label: 'String', value: 'String' }
  ];

  loading: boolean = false;

  constructor(
    private catTagsService: CatTagsService,
    private catPlcsService: CatPlcsService,
    private catLineasService: CatLineasService,
    private catPlantasService: CatPlantasService,
    private catServidoresOpcuaService: CatServidoresOpcuaService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarDatosRelacionados();
    this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tag'] && !changes['tag'].firstChange) {
      this.cargarDatos();
    }
  }

  actualizarLineasOptions() {
    if (this.lineas.length === 0) {
      this.lineasOptions = [];
      return;
    }
    this.lineasOptions = this.lineas.map(l => {
      const planta = this.plantas.find(p => p.idPlanta === l.idPlanta);
      return {
        label: l.nombre,
        value: l.idLinea,
        plantaNombre: planta?.nombre ?? `Planta #${l.idPlanta}`
      };
    });
  }

  cargarDatosRelacionados() {
    // Cargar PLCs
    this.catPlcsService.obtenerTodosLosPLCs().subscribe({
      next: (response: ApiResponse<CatPlcDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.plcs = response.data;
          this.plcsOptions = this.plcs.map(p => ({
            label: p.nombre || `ID: ${p.idPlc}`,
            value: p.idPlc
          }));
        }
      }
    });

    // Cargar Plantas (para mostrar junto a cada línea)
    this.catPlantasService.obtenerTodasLasPlantas().subscribe({
      next: (response: ApiResponse<CatPlantaDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.plantas = response.data;
          this.actualizarLineasOptions();
        }
      }
    });

    // Cargar Líneas
    this.catLineasService.obtenerTodasLasLineas().subscribe({
      next: (response: ApiResponse<CatLineaDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.lineas = response.data;
          this.actualizarLineasOptions();
        }
      }
    });

    // Cargar Servidores OPC UA
    this.catServidoresOpcuaService.obtenerTodosLosServidoresOpcua().subscribe({
      next: (response: ApiResponse<CatServidoresOpcuaDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.servidoresOpcua = response.data;
          this.servidoresOpcuaOptions = this.servidoresOpcua.map(s => ({
            label: s.nombre,
            value: s.idServidorOpcua
          }));
        }
      }
    });
  }

  cargarDatos() {
    if (this.tag && this.isEditMode) {
      this.formData = {
        idTag: this.tag.idTag,
        idPlc: this.tag.idPlc,
        idLinea: this.tag.idLinea,
        idServidorOpcua: this.tag.idServidorOpcua,
        nodeId: this.tag.nodeId,
        nombre: this.tag.nombre,
        descripcion: this.tag.descripcion,
        tipoDato: this.tag.tipoDato,
        unidadMedida: this.tag.unidadMedida,
        valorMin: this.tag.valorMin,
        valorMax: this.tag.valorMax,
        estaActivo: this.tag.estaActivo,
        fechaCreacion: this.tag.fechaCreacion
      };
    } else {
      this.formData = {
        idTag: 0,
        idPlc: 0,
        idLinea: 0,
        idServidorOpcua: 0,
        nodeId: '',
        nombre: '',
        descripcion: null,
        tipoDato: '',
        unidadMedida: null,
        valorMin: null,
        valorMax: null,
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
      this.catTagsService.actualizarTag(this.formData).subscribe({
          next: (response: ApiResponse<CatTagDTO>) => {
          if (response.statusCode === 200) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al actualizar el Tag');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al actualizar el Tag');
          this.loading = false;
        }
      });
    } else {
      this.catTagsService.crearTag(this.formData).subscribe({
          next: (response: ApiResponse<CatTagDTO>) => {
          if (response.statusCode === 201) {
            this.toastService.showSuccess('Éxito', response.message);
            this.guardado.emit();
          } else {
            this.toastService.showError('Error', response.message || 'Error al crear el Tag');
          }
          this.loading = false;
        },
        error: (error) => {
          this.toastService.showError('Error', 'Error al crear el Tag');
          this.loading = false;
        }
      });
    }
  }

  cancelar() {
    this.cancelado.emit();
  }

  validarFormulario(): boolean {
    if (!this.formData.nodeId || this.formData.nodeId.trim() === '') {
      this.toastService.showWarn('Validación', 'El NodeId es requerido');
      return false;
    }

    if (!this.formData.nombre || this.formData.nombre.trim() === '') {
      this.toastService.showWarn('Validación', 'El nombre es requerido');
      return false;
    }

    if (!this.formData.tipoDato || this.formData.tipoDato.trim() === '') {
      this.toastService.showWarn('Validación', 'El tipo de dato es requerido');
      return false;
    }

    if (!this.formData.idPlc || this.formData.idPlc <= 0) {
      this.toastService.showWarn('Validación', 'Debe seleccionar un PLC');
      return false;
    }

    if (!this.formData.idLinea || this.formData.idLinea <= 0) {
      this.toastService.showWarn('Validación', 'Debe seleccionar una Línea');
      return false;
    }

    if (!this.formData.idServidorOpcua || this.formData.idServidorOpcua <= 0) {
      this.toastService.showWarn('Validación', 'Debe seleccionar un Servidor OPC UA');
      return false;
    }

    if (this.formData.valorMin !== null && this.formData.valorMax !== null && this.formData.valorMin >= this.formData.valorMax) {
      this.toastService.showWarn('Validación', 'El ValorMin debe ser menor que el ValorMax');
      return false;
    }

    return true;
  }
}
