import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

// Services e Interfaces
import { LecEstadoLineasActualService } from '../../services/lec-estado-lineas-actual.service';
import { LecEstadoLineasActualDTO } from '../../interfaces/lec-estado-lineas-actual-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-estados-lineas-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ToolbarModule,
    TagModule,
    ProgressSpinnerModule
  ],
  templateUrl: './estados-lineas-list.component.html',
  styleUrl: './estados-lineas-list.component.scss'
})
export class EstadosLineasListComponent implements OnInit {
  estadosLineas: LecEstadoLineasActualDTO[] = [];
  loading: boolean = false;
  globalFilter: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(
    private lecEstadoLineasActualService: LecEstadoLineasActualService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarEstadosLineas();
  }

  cargarEstadosLineas() {
    this.loading = true;
    this.lecEstadoLineasActualService.obtenerEstadosLineasActuales().subscribe({
      next: (response: ApiResponse<LecEstadoLineasActualDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.estadosLineas = response.data;
        } else {
          this.toastService.showWarn('Advertencia', response.message || 'No se pudieron cargar los estados de líneas');
          this.estadosLineas = [];
        }
        this.loading = false;
      },
      error: () => {
        this.toastService.showError('Error', 'Error al cargar los estados de líneas actuales');
        this.estadosLineas = [];
        this.loading = false;
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getSeverity(estaDetenida: boolean): 'success' | 'danger' {
    return estaDetenida ? 'danger' : 'success';
  }

  getEstadoTexto(estaDetenida: boolean): string {
    return estaDetenida ? 'Detenida' : 'En marcha';
  }
}
