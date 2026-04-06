import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take, map } from 'rxjs/operators';
import { EcsAutorizacionService } from './ecs-autorizacion.service';
import { AuthService } from '../../modules/admin/services/auth.service';
import { EcsPermisoActivo } from '../interfaces/ecs-autorizacion.interface';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  private permisosSubject = new BehaviorSubject<EcsPermisoActivo[]>([]);
  permisos$ = this.permisosSubject.asObservable();

  private cargadoSubject = new BehaviorSubject<boolean>(false);
  cargado$ = this.cargadoSubject.asObservable();

  private idUsuarioEcs: number | null = null;
  private cargando = false;

  constructor(
    private ecsAutorizacion: EcsAutorizacionService,
    private authService: AuthService
  ) {}

  cargarPermisos(): void {
    if (this.cargando || this.cargadoSubject.getValue()) return;

    const userData = this.authService.getUserData();
    if (!userData?.email) {
      this.cargadoSubject.next(true);
      return;
    }

    this.cargando = true;

    this.ecsAutorizacion.obtenerUsuarioPorCorreo(userData.email).subscribe({
      next: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.idUsuarioEcs = res.data.idUsuario;
          this.cargarPermisosDeUsuario(this.idUsuarioEcs);
        } else {
          console.warn('Usuario no encontrado en ECS:', userData.email);
          this.finalizarCarga([]);
        }
      },
      error: (err) => {
        console.error('Error al consultar usuario en ECS:', err);
        this.finalizarCarga([]);
      }
    });
  }

  private cargarPermisosDeUsuario(idUsuario: number): void {
    this.ecsAutorizacion.obtenerPermisosActivos(idUsuario).subscribe({
      next: (res) => {
        this.finalizarCarga(res.statusCode === 200 && res.data ? res.data : []);
      },
      error: (err) => {
        console.error('Error al cargar permisos desde ECS:', err);
        this.finalizarCarga([]);
      }
    });
  }

  private finalizarCarga(permisos: EcsPermisoActivo[]): void {
    this.permisosSubject.next(permisos);
    this.cargadoSubject.next(true);
    this.cargando = false;
  }

  recargarPermisos(): void {
    this.cargadoSubject.next(false);
    this.cargando = false;
    this.cargarPermisos();
  }

  esperarCarga(): Observable<boolean> {
    this.cargarPermisos();
    return this.cargado$.pipe(
      filter(cargado => cargado),
      take(1)
    );
  }

  tienePermiso(nombreModulo: string, nombreAccion: string): boolean {
    const permisos = this.permisosSubject.getValue();
    return permisos.some(
      p => p.nombreModulo.toUpperCase() === nombreModulo.toUpperCase()
        && p.nombreAccion.toUpperCase() === nombreAccion.toUpperCase()
    );
  }

  tienePermisoEnModulo(nombreModulo: string): boolean {
    const permisos = this.permisosSubject.getValue();
    return permisos.some(
      p => p.nombreModulo.toUpperCase() === nombreModulo.toUpperCase()
    );
  }

  tieneRol(nombreRol: string): boolean {
    const permisos = this.permisosSubject.getValue();
    return permisos.some(
      p => p.nombreRol.toUpperCase() === nombreRol.toUpperCase()
    );
  }

  getRolesUnicos(): string[] {
    const permisos = this.permisosSubject.getValue();
    return [...new Set(permisos.map(p => p.nombreRol))];
  }

  get estaCargado(): boolean {
    return this.cargadoSubject.getValue();
  }

  get getIdUsuarioEcs(): number | null {
    return this.idUsuarioEcs;
  }
}
