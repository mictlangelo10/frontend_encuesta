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
  styleUrls: ['./administrador.component.css'],
})
export class AdministradorComponent implements OnInit {
  etiquetas: Etiquetas = {};
  grafica_codo: any; // Trae base 64 y muestra cuantos clusteres se meten al algoritmo
  grafica_datos_por_cluster: any; // Indica insatisfecho, satisfecho y medio
  grafica_distribucion_centroides: any; // Indica
  preguntas: any = {};
  respuestas: Respuesta = {};
  respuestas_tabla: any = {};
  selectedGrafica: string = 'grafica_codo';

  currentPage: number = 0;
  itemsPerPage: number = 15;
  totalPages: number = 0;
  currentItems: any[] = [];

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

  hacerEntrenamiento() {
    this.kmeanService.postEntrenamiento().subscribe((res) => {
      this.grafica_codo = `data:image/png;base64,${res.resultado.grafica_codo}`;
      this.grafica_datos_por_cluster = `data:image/png;base64,${res.resultado.grafica_datos_por_cluster}`;
      this.grafica_distribucion_centroides = `data:image/png;base64,${res.resultado.grafica_distribucion_centroides}`;
      this.etiquetas = res.resultado.etiquetas;
      console.log('Etiquetas', this.etiquetas);

      // Después de obtener etiquetas, combinar con respuestas
      this.creacionTablaChida();
    });
  }

  obtenerPreguntas() {
    this.encuestaService.getPreguntas().subscribe((res) => {
      this.preguntas = res.preguntas;
      console.log('Preguntas', this.preguntas);
    });
  }

  obtenerRespuestas() {
    this.encuestaService.getRespuestas().subscribe((res) => {
      this.respuestas = res.respuestas;

      // Después de obtener respuestas, combinar con etiquetas
      this.creacionTablaChida();
    });
  }

  creacionTablaChida() {
    if (
      Object.keys(this.respuestas).length > 0 &&
      Object.keys(this.etiquetas).length > 0
    ) {
      const respuestasArray = Object.values(this.respuestas) as any[];
      const etiquetasArray = Object.values(this.etiquetas) as number[];

      if (respuestasArray.length !== etiquetasArray.length) {
        throw new Error('El número de respuestas y etiquetas no coincide.');
      }

      this.respuestas_tabla = respuestasArray.map((respuesta, index) => {
        return {
          respuestas: respuesta,
          etiqueta: etiquetasArray[index],
          ponderacion: this.ponderarRespuestas(respuesta),
        };
      });

      this.totalPages = this.respuestas_tabla.length; // Cada página es un cuestionario completo
      this.actualizarPagina();
    }
  }

  actualizarPagina() {
    const startIndex = this.currentPage;
    this.currentItems = [this.respuestas_tabla[startIndex]]; // Mostrar un cuestionario completo por página
  }

  ponderarRespuestas(respuestas: any) {
    const ponderaciones = {
      1: 'Muy insatisfecho',
      2: 'Insatisfecho',
      3: 'Neutra',
      4: 'Satisfecho',
      5: 'Muy satisfecho',
    };

    let ponderacion = {};
    for (let key in respuestas) {
      if (respuestas.hasOwnProperty(key)) {
        ponderacion[key] = ponderaciones[respuestas[key]] || 'N/A';
      }
    }
    return ponderacion;
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.actualizarPagina();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.actualizarPagina();
    }
  }

  getEtiquetaLabel(etiqueta: number): string {
    const etiquetas = {
      0: 'Medio',
      1: 'Satisfecho',
      2: 'Insatisfecho',
    };
    return etiquetas[etiqueta] || 'Desconocido';
  }

  onGraficaChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedGrafica = target.value;
  }
}
