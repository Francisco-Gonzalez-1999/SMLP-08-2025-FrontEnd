import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CatPlcDTO, ActivarDesactivarPlcDTO } from '../interfaces/cat-plc-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class CatPlcsService {

  private endpoint = 'CatPLCs';

  constructor(private httpClientService: HttpClientService) { }

  // Obtener todos los PLCs
  obtenerTodosLosPLCs(): Observable<ApiResponse<CatPlcDTO[]>> {
    return this.httpClientService.get<ApiResponse<CatPlcDTO[]>>(`${this.endpoint}/ObtenerTodosLosPLCs`);
  }

  // Crear un nuevo PLC
  crearPLC(plc: CatPlcDTO): Observable<ApiResponse<CatPlcDTO>> {
    return this.httpClientService.post<ApiResponse<CatPlcDTO>>(`${this.endpoint}/CrearPLC`, plc);
  }

  // Actualizar un PLC
  actualizarPLC(plc: CatPlcDTO): Observable<ApiResponse<CatPlcDTO>> {
    return this.httpClientService.post<ApiResponse<CatPlcDTO>>(`${this.endpoint}/ActualizarPLC`, plc);
  }

  // Activar/Desactivar un PLC
  activarDesactivarPLC(dto: ActivarDesactivarPlcDTO): Observable<ApiResponse<CatPlcDTO>> {
    return this.httpClientService.post<ApiResponse<CatPlcDTO>>(`${this.endpoint}/ActivarDesactivarPLC`, dto);
  }
}
