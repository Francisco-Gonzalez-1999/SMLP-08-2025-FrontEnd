import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CatServidoresOpcuaDTO, ActivarDesactivarServidorOpcuaDTO } from '../interfaces/cat-servidores-opcua-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class CatServidoresOpcuaService {

  private endpoint = 'CatServidoresOpcua';

  constructor(private httpClientService: HttpClientService) { }

  // Obtener todos los Servidores OPC UA
  obtenerTodosLosServidoresOpcua(): Observable<ApiResponse<CatServidoresOpcuaDTO[]>> {
    return this.httpClientService.get<ApiResponse<CatServidoresOpcuaDTO[]>>(`${this.endpoint}/ObtenerTodosLosServidoresOpcua`);
  }

  // Crear un nuevo Servidor OPC UA
  crearServidorOpcua(servidor: CatServidoresOpcuaDTO): Observable<ApiResponse<CatServidoresOpcuaDTO>> {
    return this.httpClientService.post<ApiResponse<CatServidoresOpcuaDTO>>(`${this.endpoint}/CrearServidorOpcua`, servidor);
  }

  // Actualizar un Servidor OPC UA
  actualizarServidorOpcua(servidor: CatServidoresOpcuaDTO): Observable<ApiResponse<CatServidoresOpcuaDTO>> {
    return this.httpClientService.post<ApiResponse<CatServidoresOpcuaDTO>>(`${this.endpoint}/ActualizarServidorOpcua`, servidor);
  }

  // Activar/Desactivar un Servidor OPC UA
  activarDesactivarServidorOpcua(dto: ActivarDesactivarServidorOpcuaDTO): Observable<ApiResponse<CatServidoresOpcuaDTO>> {
    return this.httpClientService.post<ApiResponse<CatServidoresOpcuaDTO>>(`${this.endpoint}/ActivarDesactivarServidorOpcua`, dto);
  }
}
