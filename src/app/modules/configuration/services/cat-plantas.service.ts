import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CatPlantaDTO, ActivarDesactivarPlantaDTO } from '../interfaces/cat-planta-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class CatPlantasService {

  private endpoint = 'CatPlantas';

  constructor(private httpClientService: HttpClientService) { }

  obtenerTodasLasPlantas(): Observable<ApiResponse<CatPlantaDTO[]>> {
    return this.httpClientService.get<ApiResponse<CatPlantaDTO[]>>(`${this.endpoint}/ObtenerTodasLasPlantas`);
  }

  crearPlanta(planta: CatPlantaDTO): Observable<ApiResponse<CatPlantaDTO>> {
    return this.httpClientService.post<ApiResponse<CatPlantaDTO>>(`${this.endpoint}/CrearPlanta`, planta);
  }

  actualizarPlanta(planta: CatPlantaDTO): Observable<ApiResponse<CatPlantaDTO>> {
    return this.httpClientService.post<ApiResponse<CatPlantaDTO>>(`${this.endpoint}/ActualizarPlanta`, planta);
  }

  activarDesactivarPlanta(dto: ActivarDesactivarPlantaDTO): Observable<ApiResponse<CatPlantaDTO>> {
    return this.httpClientService.post<ApiResponse<CatPlantaDTO>>(`${this.endpoint}/ActivarDesactivarPlanta`, dto);
  }
}
