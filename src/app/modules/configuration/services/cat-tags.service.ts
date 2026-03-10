import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../shared/services/http-client.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { CatTagDTO, ActivarDesactivarTagDTO } from '../interfaces/cat-tag-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class CatTagsService {

  private endpoint = 'CatTags';

  constructor(private httpClientService: HttpClientService) { }

  obtenerTodosLosTags(): Observable<ApiResponse<CatTagDTO[]>> {
    return this.httpClientService.get<ApiResponse<CatTagDTO[]>>(`${this.endpoint}/ObtenerTodosLosTags`);
  }

  crearTag(tag: CatTagDTO): Observable<ApiResponse<CatTagDTO>> {
    return this.httpClientService.post<ApiResponse<CatTagDTO>>(`${this.endpoint}/CrearTag`, tag);
  }

  actualizarTag(tag: CatTagDTO): Observable<ApiResponse<CatTagDTO>> {
    return this.httpClientService.post<ApiResponse<CatTagDTO>>(`${this.endpoint}/ActualizarTag`, tag);
  }

  activarDesactivarTag(dto: ActivarDesactivarTagDTO): Observable<ApiResponse<CatTagDTO>> {
    return this.httpClientService.post<ApiResponse<CatTagDTO>>(`${this.endpoint}/ActivarDesactivarTag`, dto);
  }
}
