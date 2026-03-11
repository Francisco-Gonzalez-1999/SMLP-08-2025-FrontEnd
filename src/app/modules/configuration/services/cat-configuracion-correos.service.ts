import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CatConfiguracionCorreoDTO, ActivarDesactivarConfiguracionCorreoDTO } from '../interfaces/cat-configuracion-correo-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class CatConfiguracionCorreosService {

  private endpoint = 'CatConfiguracionCorreos';

  constructor(private httpClientService: HttpClientService) { }

  obtenerTodasLasConfiguracionesCorreo(): Observable<ApiResponse<CatConfiguracionCorreoDTO[]>> {
    return this.httpClientService.get<ApiResponse<CatConfiguracionCorreoDTO[]>>(`${this.endpoint}/ObtenerTodasLasConfiguracionesCorreo`);
  }

  crearConfiguracionCorreo(dto: CatConfiguracionCorreoDTO): Observable<ApiResponse<CatConfiguracionCorreoDTO>> {
    return this.httpClientService.post<ApiResponse<CatConfiguracionCorreoDTO>>(`${this.endpoint}/CrearConfiguracionCorreo`, dto);
  }

  actualizarConfiguracionCorreo(dto: CatConfiguracionCorreoDTO): Observable<ApiResponse<CatConfiguracionCorreoDTO>> {
    return this.httpClientService.post<ApiResponse<CatConfiguracionCorreoDTO>>(`${this.endpoint}/ActualizarConfiguracionCorreo`, dto);
  }

  activarDesactivarConfiguracionCorreo(dto: ActivarDesactivarConfiguracionCorreoDTO): Observable<ApiResponse<CatConfiguracionCorreoDTO>> {
    return this.httpClientService.post<ApiResponse<CatConfiguracionCorreoDTO>>(`${this.endpoint}/ActivarDesactivarConfiguracionCorreo`, dto);
  }
}
