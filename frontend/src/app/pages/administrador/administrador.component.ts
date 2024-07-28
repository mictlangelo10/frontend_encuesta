import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EncuestaService } from '../../services/encuesta.service';
import { EntrenamientoService } from '../../services/kmeans.service';

interface Respuesta {
  [key: string]: number; // Define la estructura de una respuesta con propiedades clave-valor
}

interface Etiquetas {
  [key: string]: number; // Define la estructura de etiquetas con propiedades clave-valor
}

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css']
})
export class AdministradorComponent implements OnInit {

  etiquetas: Etiquetas = {};
  grafica_codo: any;
  grafica_datos_por_cluster: any;
  grafica_distribucion_centroides: any;
  preguntas: any = {};
  respuestas: Respuesta = {};
  respuestas_tabla: any = {};

  constructor(
    private router: Router,
    private encuestaService: EncuestaService,
    private kmeanService: EntrenamientoService
  ) {}

  ngOnInit(): void {
    const user = sessionStorage.getItem('user'); // Obtener el usuario del sessionStorage

    if (!user) {
      // Si el usuario no está autenticado, redirigir al inicio
      this.router.navigate(['/']); // Ajusta la ruta según tu configuración
    }

    this.hacerEntrenamiento();
    this.obtenerPreguntas();
    this.obtenerRespuestas();
  }

  hacerEntrenamiento(){
    this.kmeanService.postEntrenamiento().subscribe(res =>{
      this.grafica_codo = res.resultado.grafica_codo;
      this.grafica_datos_por_cluster = res.resultado.grafica_datos_por_cluster;
      this.grafica_distribucion_centroides = res.resultado.grafica_distribucion_centroides;
      this.etiquetas = res.resultado.etiquetas;
      console.log(this.etiquetas);

      // Después de obtener etiquetas, combinar con respuestas
      this.creacionTablaChida();
    });
  }

  obtenerPreguntas(){
    this.encuestaService.getPreguntas().subscribe(res =>{
      this.preguntas = res.preguntas;
      console.log(this.preguntas);
    });
  }

  obtenerRespuestas(){
    this.encuestaService.getRespuestas().subscribe(res =>{
      this.respuestas = res.respuestas;
      console.log(this.respuestas);
      
      // Después de obtener respuestas, combinar con etiquetas
      this.creacionTablaChida();
    });
  }

  creacionTablaChida() {
    // Asegúrate de que las respuestas y etiquetas se han obtenido
    if (Object.keys(this.respuestas).length > 0 && Object.keys(this.etiquetas).length > 0) {
      const respuestasArray = Object.values(this.respuestas) as any[];
      const etiquetasArray = Object.values(this.etiquetas) as number[];

      if (respuestasArray.length !== etiquetasArray.length) {
        throw new Error("El número de respuestas y etiquetas no coincide.");
      }

      // Combinar respuestas y etiquetas en el formato requerido
      this.respuestas_tabla = respuestasArray.map((respuesta, index) => {
        // Crear un nuevo objeto para cada respuesta con la etiqueta
        const respuestaConEtiqueta = {
          ...respuesta, // Spread operator para copiar las respuestas
          etiqueta: etiquetasArray[index] // Añadir la etiqueta
        };
        return respuestaConEtiqueta;
      });

      console.log(this.respuestas_tabla);
    }
  }
}
