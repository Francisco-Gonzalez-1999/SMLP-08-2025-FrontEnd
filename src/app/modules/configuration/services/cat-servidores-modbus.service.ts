import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CatServidoresModbusDTO, ActivarDesactivarServidorModbusDTO } from '../interfaces/cat-servidores-modbus-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class CatServidoresModbusService {

  private endpoint = 'CatServidoresModbus';

  constructor(private httpClientService: HttpClientService) { }

  // Obtener todos los Servidores Modbus
  obtenerTodosLosServidoresModbus(): Observable<ApiResponse<CatServidoresModbusDTO[]>> {
    return this.httpClientService.get<ApiResponse<CatServidoresModbusDTO[]>>(`${this.endpoint}/ObtenerTodosLosServidoresModbus`);
  }

  // Crear un nuevo Servidor Modbus
  crearServidorModbus(servidor: CatServidoresModbusDTO): Observable<ApiResponse<CatServidoresModbusDTO>> {
    return this.httpClientService.post<ApiResponse<CatServidoresModbusDTO>>(`${this.endpoint}/CrearServidorModbus`, servidor);
  }

  // Actualizar un Servidor Modbus
  actualizarServidorModbus(servidor: CatServidoresModbusDTO): Observable<ApiResponse<CatServidoresModbusDTO>> {
    return this.httpClientService.post<ApiResponse<CatServidoresModbusDTO>>(`${this.endpoint}/ActualizarServidorModbus`, servidor);
  }

  // Activar/Desactivar un Servidor Modbus
  activarDesactivarServidorModbus(dto: ActivarDesactivarServidorModbusDTO): Observable<ApiResponse<CatServidoresModbusDTO>> {
    return this.httpClientService.post<ApiResponse<CatServidoresModbusDTO>>(`${this.endpoint}/ActivarDesactivarServidorModbus`, dto);
  }
}
