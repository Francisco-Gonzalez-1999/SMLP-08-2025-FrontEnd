import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CatEsclavosModbuDTO, ActivarDesactivarEsclavoModbusDTO } from '../interfaces/cat-esclavos-modbus-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class CatEsclavosModbusService {

  private endpoint = 'CatEsclavosModbus';

  constructor(private httpClientService: HttpClientService) { }

  obtenerTodosLosEsclavosModbus(): Observable<ApiResponse<CatEsclavosModbuDTO[]>> {
    return this.httpClientService.get<ApiResponse<CatEsclavosModbuDTO[]>>(`${this.endpoint}/ObtenerTodosLosEsclavosModbus`);
  }

  crearEsclavoModbus(esclavo: CatEsclavosModbuDTO): Observable<ApiResponse<CatEsclavosModbuDTO>> {
    return this.httpClientService.post<ApiResponse<CatEsclavosModbuDTO>>(`${this.endpoint}/CrearEsclavoModbus`, esclavo);
  }

  actualizarEsclavoModbus(esclavo: CatEsclavosModbuDTO): Observable<ApiResponse<CatEsclavosModbuDTO>> {
    return this.httpClientService.post<ApiResponse<CatEsclavosModbuDTO>>(`${this.endpoint}/ActualizarEsclavoModbus`, esclavo);
  }

  activarDesactivarEsclavoModbus(dto: ActivarDesactivarEsclavoModbusDTO): Observable<ApiResponse<CatEsclavosModbuDTO>> {
    return this.httpClientService.post<ApiResponse<CatEsclavosModbuDTO>>(`${this.endpoint}/ActivarDesactivarEsclavoModbus`, dto);
  }
}
