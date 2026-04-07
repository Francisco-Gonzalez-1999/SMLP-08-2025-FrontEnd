import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

import { EvtRegistroParosJustificadosService } from '../../services/evt-registro-paros-justificados.service';
import { TurnosEcsService } from '../../services/turnos-ecs.service';
import { CatLineasService } from '../../../configuration/services/cat-lineas.service';
import { CatPlantasService } from '../../../configuration/services/cat-plantas.service';
import { CatEstadosParosService } from '../../../configuration/services/cat-estados-paros.service';
import { AuthService } from '../../../admin/services/auth.service';
import { PermisosService } from '../../../../shared/services/permisos.service';
import { ToastService } from '../../../../shared/services/toast.service';

import {
  EvtRegistroParosJustificadoDTO,
  ActivarDesactivarRegistroParoJustificadoDTO,
  CrearRegistroParoManualDTO
} from '../../interfaces/evt-registro-paros-justificado-dto.interface';
import { CatLineaDTO } from '../../../configuration/interfaces/cat-linea-dto.interface';
import { CatPlantaDTO } from '../../../configuration/interfaces/cat-planta-dto.interface';
import { CatEstadosParoDTO } from '../../../configuration/interfaces/cat-estados-paro-dto.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { DividirRegistroParoDTO, DivisionDetalleDTO } from '../../interfaces/division-paro.interface';
import { CatTurnoDTO } from '../../interfaces/turno.interface';

import { RegistroParoJustificadoFormComponent } from '../../components/registro-paro-justificado-form/registro-paro-justificado-form.component';

@Component({
  selector: 'app-bitacora-paros',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    DropdownModule,
    CalendarModule,
    RegistroParoJustificadoFormComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './bitacora-paros.component.html',
  styleUrl: './bitacora-paros.component.scss'
})
export class BitacoraParosComponent implements OnInit, OnDestroy {
  todosLosRegistros: EvtRegistroParosJustificadoDTO[] = [];
  registrosFiltrados: EvtRegistroParosJustificadoDTO[] = [];

  fechaSeleccionada: string = '';
  plantaSeleccionada: number | null = null;
  turnoSeleccionado: string = '';
  private todosLosTurnosEcs: CatTurnoDTO[] = [];
  turnosData: CatTurnoDTO[] = [];
  private turnoIdsDelUsuario: number[] = [];
  sinTurnosAsignados: boolean = false;

  horasJustificadas: number = 0;
  horasInjustificadas: number = 0;
  resumenPorLinea: {
    linea: string;
    horas: number;
    horasJustificadas: number;
    horasInjustificadas: number;
    /** Duración del turno − paro de la línea (~horas no en paro en la ventana del turno). */
    turnoEfectivoHoras: number;
  }[] = [];
  /** Duración del turno seleccionado (config ECS; por defecto 12 h), referencia para la columna por línea. */
  duracionTurnoHorasResumen: number = 12;

  turnoBlockeado: boolean = false;
  tiempoRestante: string = '';
  private lockInterval: any;

  showDivisionDialog: boolean = false;
  registroParaDividir: EvtRegistroParosJustificadoDTO | null = null;
  divisiones: DivisionDetalleDTO[] = [];
  loadingDivision: boolean = false;

  get minutosAsignados(): number {
    return this.divisiones.reduce((sum, d) => sum + (d.duracionMinutos || 0), 0);
  }

  get minutosDisponibles(): number {
    return (this.registroParaDividir?.duracionMinutos || 0) - this.minutosAsignados;
  }

  showEditDialog: boolean = false;
  selectedRegistro: EvtRegistroParosJustificadoDTO | null = null;

  showDialogManual: boolean = false;
  loadingManual: boolean = false;
  lineas: CatLineaDTO[] = [];
  plantas: CatPlantaDTO[] = [];
  estadosParo: CatEstadosParoDTO[] = [];

  get lineasConPlanta(): { idLinea: number; idPlanta: number; label: string }[] {
    return this.lineas
      .filter(l => !this.plantaSeleccionada || l.idPlanta === this.plantaSeleccionada)
      .map(l => ({
        idLinea: l.idLinea,
        idPlanta: l.idPlanta,
        label: `${l.nombre} - Planta ${this.getPlantaNombreById(l.idPlanta) || '...'}`
      }));
  }

  manualForm = {
    lineaPlantaSeleccionada: null as { idLinea: number; idPlanta: number; label: string } | null,
    fechaRegistro: '',
    horaInicioTime: '',
    horaFinTime: '',
    idEstadoParo: null as number | null,
    causaRaiz: '',
    subCausa: '',
    comentarios: ''
  };

  loading: boolean = false;
  processing: boolean = false;
  globalFilter: string = '';

  @ViewChild('dt') dt!: Table;

  get puedeCrear(): boolean {
    return this.permisosService.tienePermiso('MOD_BITACORA_PAROS', 'CREAR');
  }

  get puedeEditar(): boolean {
    return this.permisosService.tienePermiso('MOD_BITACORA_PAROS', 'EDITAR');
  }

  get puedeDividir(): boolean {
    return this.permisosService.tienePermiso('MOD_BITACORA_PAROS', 'DIVIDIR');
  }

  get puedeActivarDesactivar(): boolean {
    return this.permisosService.tienePermiso('MOD_BITACORA_PAROS', 'ELIMINAR');
  }

  get aplicaBloqueoTemporal(): boolean {
    const roles = this.permisosService.getRolesUnicos();
    if (!roles.length) return true;
    return roles.length === 1 && roles[0].toUpperCase() === 'OPERADOR DE LÍNEA';
  }

  /**
   * Unique plants derived from the loaded turno catalog.
   * Used for the plant selector dropdown.
   */
  get plantasDisponibles(): { label: string; value: number }[] {
    const seen = new Map<number, string>();
    for (const t of this.turnosData) {
      if (t.idPlanta != null && t.nombrePlanta && !seen.has(t.idPlanta)) {
        seen.set(t.idPlanta, t.nombrePlanta);
      }
    }
    return Array.from(seen.entries()).map(([id, nombre]) => ({
      label: nombre,
      value: id
    }));
  }

  /**
   * Turnos filtered to the currently selected plant.
   */
  get turnosDisponibles(): { label: string; value: string }[] {
    const filtrados = this.plantaSeleccionada
      ? this.turnosData.filter(t => t.idPlanta === this.plantaSeleccionada)
      : this.turnosData;
    return filtrados.map(t => ({ label: t.nombre, value: t.nombre }));
  }

  constructor(
    private evtRegistroParosJustificadosService: EvtRegistroParosJustificadosService,
    private turnosEcsService: TurnosEcsService,
    private catLineasService: CatLineasService,
    private catPlantasService: CatPlantasService,
    private catEstadosParosService: CatEstadosParosService,
    private authService: AuthService,
    private permisosService: PermisosService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.fechaSeleccionada = this.getFechaLocalMonterrey();
    this.cargarTurnos();
    this.cargarLineasYEstados();
  }

  ngOnDestroy() {
    if (this.lockInterval) {
      clearInterval(this.lockInterval);
    }
  }

  // ── Monterrey timezone helpers ────────────────────────

  private getNowMonterrey(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Monterrey' }));
  }

  private getFechaLocalMonterrey(): string {
    const mty = this.getNowMonterrey();
    const y = mty.getFullYear();
    const m = String(mty.getMonth() + 1).padStart(2, '0');
    const d = String(mty.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private getHoraLocalMonterrey(): number {
    return this.getNowMonterrey().getHours();
  }

  // ── Turno parsing helpers ─────────────────────────────

  private parseHora(horaStr: string): number {
    if (!horaStr) return 0;
    return parseInt(horaStr.split(':')[0], 10);
  }

  private esTurnoNocturno(turno: CatTurnoDTO): boolean {
    return this.parseHora(turno.horaInicio) > this.parseHora(turno.horaFin);
  }

  private getDuracionTurnoHoras(turno: CatTurnoDTO): number {
    const inicio = this.parseHora(turno.horaInicio);
    const fin = this.parseHora(turno.horaFin);
    if (inicio > fin) {
      return (24 - inicio) + fin;
    }
    return fin - inicio;
  }

  /**
   * Calculates the shift start and end DateTimes for a given
   * date + turno config, using the chronological definition:
   *   "Turno X del día Y" starts at Y + horaInicio
   *   and ends at Y + horaFin (or Y+1 if overnight).
   */
  private getShiftRange(fechaStr: string, turnoConfig: CatTurnoDTO): { start: Date; end: Date } {
    const [year, month, day] = fechaStr.split('-').map(Number);
    const horaInicio = this.parseHora(turnoConfig.horaInicio);
    const horaFin = this.parseHora(turnoConfig.horaFin);
    const nocturno = horaInicio > horaFin;

    const start = new Date(year, month - 1, day, horaInicio, 0, 0);
    const end = nocturno
      ? new Date(year, month - 1, day + 1, horaFin, 0, 0)
      : new Date(year, month - 1, day, horaFin, 0, 0);

    return { start, end };
  }

  // ── Load turnos from ECS API ──────────────────────────

  private cargarTurnos() {
    this.turnosEcsService.getTurnosActivos().subscribe({
      next: (response) => {
        if (response.statusCode === 200 && response.data) {
          this.todosLosTurnosEcs = response.data;
          this.cargarTurnosDelUsuario();
        }
      },
      error: () => {
        this.toastService.showWarn('Advertencia', 'No se pudieron cargar los turnos desde ECS');
        this.cargarRegistros();
      }
    });
  }

  private cargarTurnosDelUsuario() {
    const user = this.authService.getUserData();
    const correo = user?.email || user?.username;

    if (!correo) {
      this.turnosData = [...this.todosLosTurnosEcs];
      this.inicializarVista();
      return;
    }

    this.turnosEcsService.getTurnosDelUsuario(correo).subscribe({
      next: (response) => {
        if (response.statusCode === 200 && response.data && response.data.length > 0) {
          this.turnoIdsDelUsuario = response.data.map((ut: any) => ut.idTurno);
          this.turnosData = this.todosLosTurnosEcs.filter(t =>
            this.turnoIdsDelUsuario.includes(t.idTurno)
          );
          this.sinTurnosAsignados = false;
        } else {
          this.sinTurnosAsignados = true;
          this.turnosData = [];
        }
        this.inicializarVista();
      },
      error: () => {
        this.sinTurnosAsignados = true;
        this.turnosData = [];
        this.inicializarVista();
      }
    });
  }

  private inicializarVista() {
    this.detectarPlantaYTurnoActual();
    this.cargarRegistros();
    this.iniciarVerificacionBloqueo();
  }

  // ── Shift detection ───────────────────────────────────

  private detectarPlantaYTurnoActual() {
    if (this.plantasDisponibles.length > 0) {
      this.plantaSeleccionada = this.plantasDisponibles[0].value;
    }
    this.detectarTurnoActual();
  }

  private detectarTurnoActual() {
    const hora = this.getHoraLocalMonterrey();
    const turnosDePlanta = this.plantaSeleccionada
      ? this.turnosData.filter(t => t.idPlanta === this.plantaSeleccionada)
      : this.turnosData;

    const turnoActual = turnosDePlanta.find(t => {
      const inicio = this.parseHora(t.horaInicio);
      const fin = this.parseHora(t.horaFin);
      if (inicio > fin) {
        return hora >= inicio || hora < fin;
      }
      return hora >= inicio && hora < fin;
    });
    this.turnoSeleccionado = turnoActual?.nombre || (turnosDePlanta[0]?.nombre ?? '');
  }

  // ── Shift lock logic ──────────────────────────────────

  private iniciarVerificacionBloqueo() {
    this.verificarBloqueo();
    this.lockInterval = setInterval(() => this.verificarBloqueo(), 1000);
  }

  /**
   * Page-level lock based on the selected date+turno shift end.
   * With chronological turno definition, the shift end is unambiguous:
   *   day shift  → same day at horaFin
   *   night shift → next day at horaFin
   */
  private verificarBloqueo() {
    if (!this.aplicaBloqueoTemporal) {
      this.turnoBlockeado = false;
      this.tiempoRestante = '';
      return;
    }

    const turnoConfig = this.turnosData.find(t => t.nombre === this.turnoSeleccionado);
    if (!turnoConfig || !this.fechaSeleccionada) {
      this.turnoBlockeado = false;
      this.tiempoRestante = '';
      return;
    }

    const { end: finTurno } = this.getShiftRange(this.fechaSeleccionada, turnoConfig);
    const ahora = this.getNowMonterrey();
    const limiteEdicion = new Date(finTurno.getTime() + 30 * 60 * 1000);

    if (ahora > limiteEdicion) {
      this.turnoBlockeado = true;
      this.tiempoRestante = '';
    } else if (ahora > finTurno) {
      this.turnoBlockeado = false;
      const diff = limiteEdicion.getTime() - ahora.getTime();
      const min = Math.floor(diff / 60000);
      const seg = Math.floor((diff % 60000) / 1000);
      this.tiempoRestante = `${min}:${seg.toString().padStart(2, '0')}`;
    } else {
      this.turnoBlockeado = false;
      this.tiempoRestante = '';
    }
  }

  /**
   * Per-record lock check. Uses the record's horaInicio to determine
   * which shift instance it belongs to, then checks the 30-min window.
   */
  isRegistroEditable(registro: EvtRegistroParosJustificadoDTO): boolean {
    if (!this.aplicaBloqueoTemporal) return true;
    if (!this.turnosData.length) return true;

    const turnoConfig = this.turnosData.find(t => t.nombre === this.turnoSeleccionado);
    if (!turnoConfig || !this.fechaSeleccionada) return true;

    const { end: finTurno } = this.getShiftRange(this.fechaSeleccionada, turnoConfig);
    const ahora = this.getNowMonterrey();
    const limiteEdicion = new Date(finTurno.getTime() + 30 * 60 * 1000);

    return ahora <= limiteEdicion;
  }

  // ── Data loading ──────────────────────────────────────

  cargarRegistros() {
    this.loading = true;
    this.evtRegistroParosJustificadosService.obtenerRegistrosParosJustificados().subscribe({
      next: (response: ApiResponse<EvtRegistroParosJustificadoDTO[]>) => {
        if (response.statusCode === 200 && response.data) {
          this.todosLosRegistros = response.data.map(r => ({
            ...r,
            fechaRegistroDate: r.fechaRegistro ? new Date(r.fechaRegistro + 'T00:00:00') : null
          }));
          this.filtrarRegistros();
        } else {
          this.todosLosRegistros = [];
          this.registrosFiltrados = [];
          this.calcularResumen();
        }
        this.loading = false;
      },
      error: () => {
        this.toastService.showError('Error', 'Error al cargar los registros');
        this.todosLosRegistros = [];
        this.registrosFiltrados = [];
        this.calcularResumen();
        this.loading = false;
      }
    });
  }

  cargarLineasYEstados() {
    this.catLineasService.obtenerTodasLasLineas().subscribe({
      next: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.lineas = res.data.filter(l => l.estaActivo);
        }
      }
    });
    this.catPlantasService.obtenerTodasLasPlantas().subscribe({
      next: (res: ApiResponse<CatPlantaDTO[]>) => {
        if (res.statusCode === 200 && res.data) {
          this.plantas = res.data.filter((p: CatPlantaDTO) => p.estaActivo);
        }
      }
    });
    this.catEstadosParosService.obtenerTodosLosEstadosParo().subscribe({
      next: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.estadosParo = res.data.filter(e => e.estaActivo);
        }
      }
    });
  }

  // ── Filtering ──────────────────────────────────────────

  /**
   * Filters records using a chronological time-range approach:
   *   "Turno X del día Y" → records whose horaInicio falls within
   *   [Y horaInicio, Y(+1) horaFin), also matching the selected plant.
   */
  filtrarRegistros() {
    const turnoConfig = this.turnosData.find(t => t.nombre === this.turnoSeleccionado);

    if (!turnoConfig || !this.fechaSeleccionada) {
      this.registrosFiltrados = this.todosLosRegistros.filter(r => {
        const matchPlanta = !this.plantaSeleccionada || r.idPlanta === this.plantaSeleccionada;
        const matchFecha = r.fechaRegistro === this.fechaSeleccionada;
        return matchPlanta && matchFecha;
      });
      this.calcularResumen();
      return;
    }

    const { start: shiftStart, end: shiftEnd } = this.getShiftRange(this.fechaSeleccionada, turnoConfig);

    this.registrosFiltrados = this.todosLosRegistros.filter(r => {
      if (this.plantaSeleccionada && r.idPlanta !== this.plantaSeleccionada) return false;
      if (!r.horaInicio) return false;

      const recordStart = new Date(r.horaInicio);
      return recordStart >= shiftStart && recordStart < shiftEnd;
    });

    this.calcularResumen();
  }

  onCambioFiltro() {
    this.filtrarRegistros();
    this.verificarBloqueo();
  }

  onCambioPlanta() {
    this.detectarTurnoActual();
    this.filtrarRegistros();
    this.verificarBloqueo();
  }

  // ── Summary ───────────────────────────────────────────

  /** Paro con al menos causa raíz o subcausa informada (texto no vacío). */
  private tieneCausaRaizOSubcausa(r: EvtRegistroParosJustificadoDTO): boolean {
    const causa = (r.causaRaiz ?? '').trim();
    const sub = (r.subCausa ?? '').trim();
    return causa.length > 0 || sub.length > 0;
  }

  private calcularResumen() {
    const activos = this.registrosFiltrados.filter(r => r.duracionMinutos != null && r.estaActivo);

    const minutosJustificados = activos
      .filter(r => this.tieneCausaRaizOSubcausa(r))
      .reduce((sum, r) => sum + (r.duracionMinutos || 0), 0);
    const minutosInjustificados = activos
      .filter(r => !this.tieneCausaRaizOSubcausa(r))
      .reduce((sum, r) => sum + (r.duracionMinutos || 0), 0);

    this.horasJustificadas = Math.round((minutosJustificados / 60) * 100) / 100;
    this.horasInjustificadas = Math.round((minutosInjustificados / 60) * 100) / 100;

    const turnoCfg = this.turnosData.find(t => t.nombre === this.turnoSeleccionado);
    this.duracionTurnoHorasResumen = turnoCfg ? this.getDuracionTurnoHoras(turnoCfg) : 12;

    type LineaAgg = { minTotal: number; minJust: number; minInjust: number };
    const mapLineas = new Map<string, LineaAgg>();
    for (const r of activos) {
      const nombre = r.lineaNombre || `Línea ${r.idLinea}`;
      const m = r.duracionMinutos || 0;
      const prev = mapLineas.get(nombre) ?? { minTotal: 0, minJust: 0, minInjust: 0 };
      prev.minTotal += m;
      if (this.tieneCausaRaizOSubcausa(r)) {
        prev.minJust += m;
      } else {
        prev.minInjust += m;
      }
      mapLineas.set(nombre, prev);
    }
    const toH = (min: number) => Math.round((min / 60) * 100) / 100;
    const durTurno = this.duracionTurnoHorasResumen;
    this.resumenPorLinea = Array.from(mapLineas.entries())
      .map(([linea, a]) => {
        const horas = toH(a.minTotal);
        return {
          linea,
          horas,
          horasJustificadas: toH(a.minJust),
          horasInjustificadas: toH(a.minInjust),
          turnoEfectivoHoras: Math.round((durTurno - horas) * 100) / 100
        };
      })
      .sort((a, b) => b.horas - a.horas);
  }

  // ── Edit dialog ────────────────────────────────────────

  abrirDialogEditar(registro: EvtRegistroParosJustificadoDTO) {
    if (!this.isRegistroEditable(registro)) {
      this.toastService.showWarn('Bloqueado', 'El periodo de edición para este registro ha finalizado');
      return;
    }
    this.selectedRegistro = { ...registro };
    this.showEditDialog = true;
  }

  cerrarDialogEditar() {
    this.showEditDialog = false;
    this.selectedRegistro = null;
  }

  onRegistroGuardado() {
    this.cerrarDialogEditar();
    this.cargarRegistros();
  }

  // ── Division (split downtime) ─────────────────────────

  abrirDivisionDialog(registro: EvtRegistroParosJustificadoDTO) {
    if (!this.isRegistroEditable(registro)) {
      this.toastService.showWarn('Bloqueado', 'El periodo de edición para este registro ha finalizado');
      return;
    }
    if (registro.duracionMinutos == null || registro.duracionMinutos <= 0) {
      this.toastService.showWarn('Sin duración', 'Este paro no tiene duración definida para dividir');
      return;
    }
    this.registroParaDividir = { ...registro };
    this.divisiones = [
      { duracionMinutos: 0, causaRaiz: '', subCausa: null, comentarios: null }
    ];
    this.showDivisionDialog = true;
  }

  agregarDivision() {
    this.divisiones.push({ duracionMinutos: 0, causaRaiz: '', subCausa: null, comentarios: null });
  }

  eliminarDivision(index: number) {
    if (this.divisiones.length > 1) {
      this.divisiones.splice(index, 1);
    }
  }

  cerrarDivisionDialog() {
    this.showDivisionDialog = false;
    this.registroParaDividir = null;
    this.divisiones = [];
  }

  guardarDivisiones() {
    if (!this.registroParaDividir) return;

    const sinCausa = this.divisiones.some(d => !d.causaRaiz?.trim());
    if (sinCausa) {
      this.toastService.showWarn('Validación', 'Todas las divisiones deben tener una causa raíz');
      return;
    }

    const sinDuracion = this.divisiones.some(d => !d.duracionMinutos || d.duracionMinutos <= 0);
    if (sinDuracion) {
      this.toastService.showWarn('Validación', 'Todas las divisiones deben tener duración mayor a 0');
      return;
    }

    const totalAsignado = this.minutosAsignados;
    const totalOriginal = this.registroParaDividir.duracionMinutos || 0;
    if (totalAsignado !== totalOriginal) {
      this.toastService.showWarn(
        'Validación',
        `Los minutos asignados (${totalAsignado}) deben ser igual a la duración total (${totalOriginal} min)`
      );
      return;
    }

    const user = this.authService.getUserData();
    const usuario = user?.email || user?.username || 'Sistema';
    const ahora = new Date();
    const fechaHora = ahora.toLocaleString('es-MX', { timeZone: 'America/Monterrey', dateStyle: 'short', timeStyle: 'short' });
    const totalDiv = this.divisiones.length;

    const dto: DividirRegistroParoDTO = {
      idRegistroParo: this.registroParaDividir.idRegistroParo,
      divisiones: this.divisiones.map((d, i) => ({
        duracionMinutos: d.duracionMinutos,
        causaRaiz: d.causaRaiz.trim(),
        subCausa: d.subCausa?.trim() || null,
        comentarios: `División ${i + 1}/${totalDiv} del paro #${this.registroParaDividir!.idRegistroParo} (${d.duracionMinutos} min). Registrado por ${usuario} el ${fechaHora}`
      })),
      usuarioRegistra: usuario
    };

    this.loadingDivision = true;
    this.evtRegistroParosJustificadosService.dividirRegistroParo(dto).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.toastService.showSuccess('Éxito', response.message || 'Paro dividido correctamente');
          this.cerrarDivisionDialog();
          this.cargarRegistros();
        } else {
          this.toastService.showError('Error', response.message || 'Error al dividir el paro');
        }
        this.loadingDivision = false;
      },
      error: () => {
        this.toastService.showError('Error', 'Error al dividir el paro');
        this.loadingDivision = false;
      }
    });
  }

  // ── Manual paro ────────────────────────────────────────

  abrirDialogParoManual() {
    if (this.turnoBlockeado) {
      this.toastService.showWarn('Turno bloqueado', 'El periodo de edición para este turno ha finalizado');
      return;
    }
    const mty = this.getNowMonterrey();
    const horaLocal = `${String(mty.getHours()).padStart(2, '0')}:${String(mty.getMinutes()).padStart(2, '0')}`;
    this.manualForm = {
      lineaPlantaSeleccionada: null,
      fechaRegistro: this.fechaSeleccionada || this.getFechaLocalMonterrey(),
      horaInicioTime: horaLocal,
      horaFinTime: '',
      idEstadoParo: 1,
      causaRaiz: '',
      subCausa: '',
      comentarios: ''
    };
    this.showDialogManual = true;
  }

  cerrarDialogManual() {
    this.showDialogManual = false;
  }

  getPlantaNombreById(idPlanta: number): string {
    const planta = this.plantas.find(p => p.idPlanta === idPlanta);
    return planta?.nombre ?? '';
  }

  guardarParoManual() {
    if (!this.manualForm.lineaPlantaSeleccionada) {
      this.toastService.showWarn('Validación', 'Seleccione la línea y planta del paro');
      return;
    }
    if (!this.manualForm.fechaRegistro || !this.manualForm.horaInicioTime) {
      this.toastService.showWarn('Validación', 'Fecha y hora de inicio son requeridos');
      return;
    }

    const user = this.authService.getUserData();
    const usuarioRegistra = user?.email || user?.username || 'Sistema';

    const horaInicioStr = this.manualForm.horaInicioTime.length === 5
      ? `${this.manualForm.horaInicioTime}:00`
      : this.manualForm.horaInicioTime;
    const horaFinStr = this.manualForm.horaFinTime
      ? (this.manualForm.horaFinTime.length === 5 ? `${this.manualForm.horaFinTime}:00` : this.manualForm.horaFinTime)
      : null;

    const { idLinea, idPlanta } = this.manualForm.lineaPlantaSeleccionada;
    const dto: CrearRegistroParoManualDTO = {
      idLinea,
      idPlanta,
      fechaRegistro: this.manualForm.fechaRegistro,
      horaInicio: `${this.manualForm.fechaRegistro}T${horaInicioStr}`,
      horaFin: horaFinStr ? `${this.manualForm.fechaRegistro}T${horaFinStr}` : null,
      idEstadoParo: this.manualForm.idEstadoParo ?? 1,
      idEvento: null,
      causaRaiz: this.manualForm.causaRaiz?.trim() || null,
      subCausa: this.manualForm.subCausa?.trim() || null,
      comentarios: this.manualForm.comentarios?.trim() || null,
      usuarioRegistra
    };

    this.loadingManual = true;
    this.evtRegistroParosJustificadosService.crearRegistroParoManual(dto).subscribe({
      next: (response: ApiResponse<EvtRegistroParosJustificadoDTO>) => {
        if (response.statusCode === 200) {
          this.toastService.showSuccess('Éxito', response.message);
          this.cerrarDialogManual();
          this.cargarRegistros();
        } else {
          this.toastService.showError('Error', response.message || 'Error al registrar el paro manual');
        }
        this.loadingManual = false;
      },
      error: () => {
        this.toastService.showError('Error', 'Error al registrar el paro manual');
        this.loadingManual = false;
      }
    });
  }

  // ── Activate / Deactivate ─────────────────────────────

  cambiarEstado(registro: EvtRegistroParosJustificadoDTO) {
    const nuevoEstado = !registro.estaActivo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    this.confirmationService.confirm({
      //message: `¿Está seguro que desea ${accion} este registro?`,
      message: `¿Está seguro que desea eliminar este registro?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.processing = true;
        const user = this.authService.getUserData();
        const dto: ActivarDesactivarRegistroParoJustificadoDTO = {
          idRegistroParo: registro.idRegistroParo,
          estaActivo: nuevoEstado,
          usuarioUltimaMod: user?.email || user?.username || 'Sistema'
        };

        this.evtRegistroParosJustificadosService.activarDesactivarRegistroParoJustificado(dto).subscribe({
          next: (response: ApiResponse<EvtRegistroParosJustificadoDTO>) => {
            if (response.statusCode === 200) {
              this.toastService.showSuccess('Éxito', response.message);
              this.cargarRegistros();
            } else {
              this.toastService.showError('Error', response.message || 'Error al cambiar el estado');
            }
            this.processing = false;
          },
          error: () => {
            this.toastService.showError('Error', 'Error al cambiar el estado');
            this.processing = false;
          }
        });
      }
    });
  }

  // ── Table helpers ─────────────────────────────────────

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getUniqueLinea(): { label: string; value: string }[] {
    const values = [...new Set(this.registrosFiltrados.map(r => r.lineaNombre).filter(Boolean))];
    return values.map(v => ({ label: v!, value: v! }));
  }

  getUniquePlanta(): { label: string; value: string }[] {
    const values = [...new Set(this.registrosFiltrados.map(r => r.plantaNombre).filter(Boolean))];
    return values.map(v => ({ label: v!, value: v! }));
  }

  getUniqueEstadoParo(): { label: string; value: string }[] {
    const values = [...new Set(this.registrosFiltrados.map(r => r.estadoParoNombre).filter(Boolean))];
    return values.map(v => ({ label: v!, value: v! }));
  }

  getUniqueUsuario(): { label: string; value: string }[] {
    const values = [...new Set(this.registrosFiltrados.map(r => r.usuarioUltimaMod || r.usuarioRegistra).filter(Boolean))];
    return values.map(v => ({ label: v!, value: v! }));
  }
}
