import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CatEventoDTO, ActivarDesactivarEventoDTO } from '../interfaces/cat-evento-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class CatEventosService {

  private endpoint = 'CatEventos';

  constructor(private httpClientService: HttpClientService) { }

  obtenerTodosLosEventos(): Observable<ApiResponse<CatEventoDTO[]>> {
    return this.httpClientService.get<ApiResponse<CatEventoDTO[]>>(`${this.endpoint}/ObtenerTodosLosEventos`);
  }

  crearEvento(dto: CatEventoDTO): Observable<ApiResponse<CatEventoDTO>> {
    return this.httpClientService.post<ApiResponse<CatEventoDTO>>(`${this.endpoint}/CrearEvento`, dto);
  }

  actualizarEvento(dto: CatEventoDTO): Observable<ApiResponse<CatEventoDTO>> {
    return this.httpClientService.post<ApiResponse<CatEventoDTO>>(`${this.endpoint}/ActualizarEvento`, dto);
  }

  activarDesactivarEvento(dto: ActivarDesactivarEventoDTO): Observable<ApiResponse<CatEventoDTO>> {
    return this.httpClientService.post<ApiResponse<CatEventoDTO>>(`${this.endpoint}/ActivarDesactivarEvento`, dto);
  }
}
