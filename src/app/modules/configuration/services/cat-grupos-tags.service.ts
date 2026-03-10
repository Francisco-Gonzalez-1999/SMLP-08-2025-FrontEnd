import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CatGruposTagDTO, ActivarDesactivarGrupoTagDTO } from '../interfaces/cat-grupos-tag-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class CatGruposTagsService {

  private endpoint = 'CatGruposTags';

  constructor(private httpClientService: HttpClientService) { }

  obtenerTodosLosGruposTags(): Observable<ApiResponse<CatGruposTagDTO[]>> {
    return this.httpClientService.get<ApiResponse<CatGruposTagDTO[]>>(`${this.endpoint}/ObtenerTodosLosGruposTags`);
  }

  crearGrupoTag(grupoTag: CatGruposTagDTO): Observable<ApiResponse<CatGruposTagDTO>> {
    return this.httpClientService.post<ApiResponse<CatGruposTagDTO>>(`${this.endpoint}/CrearGrupoTag`, grupoTag);
  }

  actualizarGrupoTag(grupoTag: CatGruposTagDTO): Observable<ApiResponse<CatGruposTagDTO>> {
    return this.httpClientService.post<ApiResponse<CatGruposTagDTO>>(`${this.endpoint}/ActualizarGrupoTag`, grupoTag);
  }

  activarDesactivarGrupoTag(dto: ActivarDesactivarGrupoTagDTO): Observable<ApiResponse<CatGruposTagDTO>> {
    return this.httpClientService.post<ApiResponse<CatGruposTagDTO>>(`${this.endpoint}/ActivarDesactivarGrupoTag`, dto);
  }
}
