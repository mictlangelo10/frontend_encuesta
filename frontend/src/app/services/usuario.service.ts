import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private baseUrl = 'https://back-flask2.onrender.com';

  constructor(private http: HttpClient) { }

   // Añadir un usuario
   postUsuario(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios`, data);
  }

  // Login
  postLogin(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }
}
