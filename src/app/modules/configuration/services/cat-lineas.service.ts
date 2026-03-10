import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CatLineaDTO, ActivarDesactivarLineaDTO } from '../interfaces/cat-linea-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class CatLineasService {

  private endpoint = 'CatLineas';

  constructor(private httpClientService: HttpClientService) { }

  obtenerTodasLasLineas(): Observable<ApiResponse<CatLineaDTO[]>> {
    return this.httpClientService.get<ApiResponse<CatLineaDTO[]>>(`${this.endpoint}/ObtenerTodasLasLineas`);
  }

  crearLinea(linea: CatLineaDTO): Observable<ApiResponse<CatLineaDTO>> {
    return this.httpClientService.post<ApiResponse<CatLineaDTO>>(`${this.endpoint}/CrearLinea`, linea);
  }

  actualizarLinea(linea: CatLineaDTO): Observable<ApiResponse<CatLineaDTO>> {
    return this.httpClientService.post<ApiResponse<CatLineaDTO>>(`${this.endpoint}/ActualizarLinea`, linea);
  }

  activarDesactivarLinea(dto: ActivarDesactivarLineaDTO): Observable<ApiResponse<CatLineaDTO>> {
    return this.httpClientService.post<ApiResponse<CatLineaDTO>>(`${this.endpoint}/ActivarDesactivarLinea`, dto);
  }
}
