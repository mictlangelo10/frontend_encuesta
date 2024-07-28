import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EncuestaService {

  private baseUrl = 'https://back-flask2.onrender.com';

  constructor(private http: HttpClient) { }

  // Obtener una respuesta por ID
  getRespuesta(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/respuestas/${id}`);
  }

  // Obtener todas las respuestas
  getRespuestas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/respuestas`);
  }

  // Registrar una nueva respuesta
  postRespuesta(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/respuestas`, data);
  }

  // Obtener todas las preguntas
  getPreguntas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/preguntas`);
  }
}
