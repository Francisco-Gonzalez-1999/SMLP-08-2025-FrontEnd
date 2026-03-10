import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, pipe } from 'rxjs';
import { catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

    // Método genérico para hacer peticiones GET
    get<T>(endpoint: string, params?: any): Observable<T> {
      // console.log(`${this.baseUrl}${endpoint}`)
      return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params })
        .pipe(catchError(this.handleError));
    }

    // Método genérico para hacer peticiones GET Files
    getFile<T>(endpoint: string, params?: any): Observable<T> {
      return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params, responseType: 'blob' as 'json' })
        .pipe(catchError(this.handleError));
    }

    // Método genérico para hacer peticiones GET por Id
    getById<T>(endpoint: string, id?:any): Observable<T> {
      return this.http.get<T>(`${this.baseUrl}${endpoint}/${id}`)
        .pipe(catchError(this.handleError));
    }

    // Método genérico para hacer peticiones POST
    post<T>(endpoint: string, body?: any, options?: any): Observable<T> {
      return (this.http.post<T>(`${this.baseUrl}${endpoint}`, body, options) as Observable<T>)
        .pipe(catchError(this.handleError));
    }

    // Método genérico para hacer peticiones PUT
    put<T>(endpoint: string, body: any, id?:number): Observable<T> {
      return this.http.put<T>(`${this.baseUrl}${endpoint}/${id}`, body)
        .pipe(catchError(this.handleError));
    }

    putArr<T>(endpoint: string, body: any): Observable<T> {
      return this.http.put<T>(`${this.baseUrl}${endpoint}`, body)
        .pipe(catchError(this.handleError));
    }

    delete<T>(endpoint: string, id: number): Observable<T> {
      return this.http.delete<T>(`${this.baseUrl}${endpoint}/${id}`)
        .pipe(catchError(this.handleError));
    }

    // Método genérico para manejar errores
    private handleError(error: any): Observable<never> {
      console.error('Error en la petición HTTP', error);
      throw error;
    }
}
