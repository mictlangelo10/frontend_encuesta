import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntrenamientoService {

  private baseUrl = 'https://back-flask2.onrender.com';

  constructor(private http: HttpClient) { }

  data: any = {
    "num_clusters": 3
  }

  // Hacer el entrenamiento
  postEntrenamiento(): Observable<any> {
    return this.http.post(`${this.baseUrl}/entrenar_kmeans`, this.data);
  }
}
