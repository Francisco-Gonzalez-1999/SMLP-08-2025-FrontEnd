import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { LecEstadoLineasActualDTO } from '../interfaces/lec-estado-lineas-actual-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class LecEstadoLineasActualService {
  private endpoint = 'LecEstadoLineasActual';

  constructor(private httpClientService: HttpClientService) { }

  obtenerEstadosLineasActuales(): Observable<ApiResponse<LecEstadoLineasActualDTO[]>> {
    return this.httpClientService.get<ApiResponse<LecEstadoLineasActualDTO[]>>(`${this.endpoint}/ObtenerEstadosLineasActuales`);
  }
}
