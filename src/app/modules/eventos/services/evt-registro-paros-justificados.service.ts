import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import {
  EvtRegistroParosJustificadoDTO,
  ActualizarRegistroParoJustificadoDTO,
  ActivarDesactivarRegistroParoJustificadoDTO,
  CrearRegistroParoManualDTO
} from '../interfaces/evt-registro-paros-justificado-dto.interface';
import { DividirRegistroParoDTO } from '../interfaces/division-paro.interface';

@Injectable({
  providedIn: 'root'
})
export class EvtRegistroParosJustificadosService {
  private endpoint = 'EvtRegistroParosJustificados';

  constructor(private httpClientService: HttpClientService) { }

  obtenerRegistrosParosJustificados(): Observable<ApiResponse<EvtRegistroParosJustificadoDTO[]>> {
    return this.httpClientService.get<ApiResponse<EvtRegistroParosJustificadoDTO[]>>(
      `${this.endpoint}/ObtenerRegistrosParosJustificados`
    );
  }

  actualizarRegistroParoJustificado(dto: ActualizarRegistroParoJustificadoDTO): Observable<ApiResponse<EvtRegistroParosJustificadoDTO>> {
    return this.httpClientService.post<ApiResponse<EvtRegistroParosJustificadoDTO>>(
      `${this.endpoint}/ActualizarRegistroParoJustificado`,
      dto
    );
  }

  activarDesactivarRegistroParoJustificado(dto: ActivarDesactivarRegistroParoJustificadoDTO): Observable<ApiResponse<EvtRegistroParosJustificadoDTO>> {
    return this.httpClientService.post<ApiResponse<EvtRegistroParosJustificadoDTO>>(
      `${this.endpoint}/ActivarDesactivarRegistroParoJustificado`,
      dto
    );
  }

  crearRegistroParoManual(dto: CrearRegistroParoManualDTO): Observable<ApiResponse<EvtRegistroParosJustificadoDTO>> {
    return this.httpClientService.post<ApiResponse<EvtRegistroParosJustificadoDTO>>(
      `${this.endpoint}/CrearRegistroParoManual`,
      dto
    );
  }

  dividirRegistroParo(dto: DividirRegistroParoDTO): Observable<ApiResponse<EvtRegistroParosJustificadoDTO[]>> {
    return this.httpClientService.post<ApiResponse<EvtRegistroParosJustificadoDTO[]>>(
      `${this.endpoint}/DividirRegistroParo`,
      dto
    );
  }
}
