import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TurnosEcsService {
  private ecsApiUrl = environment.ecsApiUrl;

  constructor(private http: HttpClient) {}

  getTurnosActivos(): Observable<any> {
    return this.http.get<any>(`${this.ecsApiUrl}CatTurnos/Activos`);
  }

  getTurnosDelUsuario(correo: string): Observable<any> {
    return this.http.get<any>(`${this.ecsApiUrl}IdnUsuariosTurnos/ObtenerTurnosPorCorreo`, {
      params: { correo }
    });
  }
}
