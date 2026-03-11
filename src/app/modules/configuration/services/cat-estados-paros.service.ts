import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CatEstadosParoDTO, ActivarDesactivarEstadoParoDTO } from '../interfaces/cat-estados-paro-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class CatEstadosParosService {

  private endpoint = 'CatEstadosParos';

  constructor(private httpClientService: HttpClientService) { }

  obtenerTodosLosEstadosParo(): Observable<ApiResponse<CatEstadosParoDTO[]>> {
    return this.httpClientService.get<ApiResponse<CatEstadosParoDTO[]>>(`${this.endpoint}/ObtenerTodosLosEstadosParo`);
  }

  crearEstadoParo(dto: CatEstadosParoDTO): Observable<ApiResponse<CatEstadosParoDTO>> {
    return this.httpClientService.post<ApiResponse<CatEstadosParoDTO>>(`${this.endpoint}/CrearEstadoParo`, dto);
  }

  actualizarEstadoParo(dto: CatEstadosParoDTO): Observable<ApiResponse<CatEstadosParoDTO>> {
    return this.httpClientService.post<ApiResponse<CatEstadosParoDTO>>(`${this.endpoint}/ActualizarEstadoParo`, dto);
  }

  activarDesactivarEstadoParo(dto: ActivarDesactivarEstadoParoDTO): Observable<ApiResponse<CatEstadosParoDTO>> {
    return this.httpClientService.post<ApiResponse<CatEstadosParoDTO>>(`${this.endpoint}/ActivarDesactivarEstadoParo`, dto);
  }
}
