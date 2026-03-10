import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CatTagsGrupoDTO, CatTagsGrupoConRelacionesDTO, ActivarDesactivarTagGrupoDTO } from '../interfaces/cat-tags-grupo-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class CatTagsGruposService {

  private endpoint = 'CatTagsGrupos';

  constructor(private httpClientService: HttpClientService) { }

  obtenerTodosLosTagsGrupos(): Observable<ApiResponse<CatTagsGrupoConRelacionesDTO[]>> {
    return this.httpClientService.get<ApiResponse<CatTagsGrupoConRelacionesDTO[]>>(`${this.endpoint}/ObtenerTodosLosTagsGrupos`);
  }

  crearTagGrupo(tagGrupo: CatTagsGrupoDTO): Observable<ApiResponse<CatTagsGrupoDTO>> {
    return this.httpClientService.post<ApiResponse<CatTagsGrupoDTO>>(`${this.endpoint}/CrearTagGrupo`, tagGrupo);
  }

  actualizarTagGrupo(tagGrupo: CatTagsGrupoDTO): Observable<ApiResponse<CatTagsGrupoDTO>> {
    return this.httpClientService.post<ApiResponse<CatTagsGrupoDTO>>(`${this.endpoint}/ActualizarTagGrupo`, tagGrupo);
  }

  activarDesactivarTagGrupo(dto: ActivarDesactivarTagGrupoDTO): Observable<ApiResponse<CatTagsGrupoDTO>> {
    return this.httpClientService.post<ApiResponse<CatTagsGrupoDTO>>(`${this.endpoint}/ActivarDesactivarTagGrupo`, dto);
  }
}
