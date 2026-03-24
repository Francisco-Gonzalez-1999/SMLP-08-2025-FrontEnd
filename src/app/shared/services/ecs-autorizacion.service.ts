import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EcsHttpClientService } from './ecs-http-client.service';
import { EcsApiResponse, EcsPermisoActivo, EcsUsuario, EcsValidarAccesoRequest, EcsValidarAccesoResponse } from '../interfaces/ecs-autorizacion.interface';

@Injectable({
  providedIn: 'root'
})
export class EcsAutorizacionService {

  constructor(private ecsHttp: EcsHttpClientService) {}

  obtenerUsuarioPorCorreo(correo: string): Observable<EcsApiResponse<EcsUsuario>> {
    return this.ecsHttp.get<EcsApiResponse<EcsUsuario>>('IdnUsuarios/ObtenerUsuarioPorCorreo', { correo });
  }

  obtenerPermisosActivos(idUsuario: number): Observable<EcsApiResponse<EcsPermisoActivo[]>> {
    return this.ecsHttp.get<EcsApiResponse<EcsPermisoActivo[]>>(`Autorizacion/ObtenerPermisosActivos/${idUsuario}`);
  }

  validarAcceso(request: EcsValidarAccesoRequest): Observable<EcsApiResponse<EcsValidarAccesoResponse>> {
    return this.ecsHttp.post<EcsApiResponse<EcsValidarAccesoResponse>>('Autorizacion/ValidarAcceso', request);
  }
}
