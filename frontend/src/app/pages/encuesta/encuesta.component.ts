import { Component, OnInit } from '@angular/core';
import { Pregunta } from '../../models/pregunta-respuesta';
import { EncuestaService } from '../../services/encuesta.service';

@Component({
  selector: 'app-encuesta',
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.css',
})
export class EncuestaComponent{
  preguntas: Pregunta[] = [
    {
      id: 1,
      texto: '¿Cuán satisfecho te sientes con tu trabajo en general?',
      opciones: [
        { id: 1, texto: 'Muy Insatisfecho' },
        { id: 2, texto: 'Insatisfecho' },
        { id: 3, texto: 'Neutral' },
        { id: 4, texto: 'Satisfecho' },
        { id: 5, texto: 'Muy Satisfecho' },
      ],
    },
    {
      id: 2,
      texto: '¿Cómo calificas tu satisfacción con tu salario actual?',
      opciones: [
        { id: 1, texto: 'Muy Insatisfecho' },
        { id: 2, texto: 'Insatisfecho' },
        { id: 3, texto: 'Neutral' },
        { id: 4, texto: 'Satisfecho' },
        { id: 5, texto: 'Muy Satisfecho' },
      ],
    },
    {
      id: 3,
      texto:
        '¿Cuánto valoras las oportunidades de desarrollo profesional en tu lugar de trabajo?',
      opciones: [
        { id: 1, texto: 'Muy Poco' },
        { id: 2, texto: 'Poco' },
        { id: 3, texto: 'Neutral' },
        { id: 4, texto: 'Mucho' },
        { id: 5, texto: 'Muchísimo' },
      ],
    },
    {
      id: 4,
      texto:
        '¿Cómo calificarías el equilibrio entre tu trabajo y tu vida personal?',
      opciones: [
        { id: 1, texto: 'Muy Insuficiente' },
        { id: 2, texto: 'Insuficiente' },
        { id: 3, texto: 'Neutral' },
        { id: 4, texto: 'Suficiente' },
        { id: 5, texto: 'Muy Suficiente' },
      ],
    },
    {
      id: 5,
      texto:
        '¿Sientes que recibes suficiente reconocimiento y aprecio por tu trabajo?',
      opciones: [
        { id: 1, texto: 'Nunca' },
        { id: 2, texto: 'Raramente' },
        { id: 3, texto: 'A veces' },
        { id: 4, texto: 'Frecuentemente' },
        { id: 5, texto: 'Siempre' },
      ],
    },
    {
      id: 6,
      texto: '¿Cómo describirías tu relación con tus compañeros de trabajo?',
      opciones: [
        { id: 1, texto: 'Muy Mala' },
        { id: 2, texto: 'Mala' },
        { id: 3, texto: 'Neutral' },
        { id: 4, texto: 'Buena' },
        { id: 5, texto: 'Excelente' },
      ],
    },
    {
      id: 7,
      texto:
        '¿Cómo calificas el ambiente físico en el que trabajas (ej. iluminación, ergonomía, limpieza)?',
      opciones: [
        { id: 1, texto: 'Muy Malo' },
        { id: 2, texto: 'Malo' },
        { id: 3, texto: 'Neutral' },
        { id: 4, texto: 'Bueno' },
        { id: 5, texto: 'Excelente' },
      ],
    },
    {
      id: 8,
      texto:
        '¿Cómo valoras la comunicación entre tú y la dirección de la empresa?',
      opciones: [
        { id: 1, texto: 'Muy Deficiente' },
        { id: 2, texto: 'Deficiente' },
        { id: 3, texto: 'Neutral' },
        { id: 4, texto: 'Adecuada' },
        { id: 5, texto: 'Muy Adecuada' },
      ],
    },
    {
      id: 9,
      texto:
        '¿Tienes acceso a los recursos y herramientas necesarios para realizar tu trabajo de manera efectiva?',
      opciones: [
        { id: 1, texto: 'Nunca' },
        { id: 2, texto: 'Raramente' },
        { id: 3, texto: 'A veces' },
        { id: 4, texto: 'Frecuentemente' },
        { id: 5, texto: 'Siempre' },
      ],
    },
    {
      id: 10,
      texto:
        '¿Cuán satisfecho estás con las oportunidades de crecimiento profesional en tu empresa?',
      opciones: [
        { id: 1, texto: 'Muy Insatisfecho' },
        { id: 2, texto: 'Insatisfecho' },
        { id: 3, texto: 'Neutral' },
        { id: 4, texto: 'Satisfecho' },
        { id: 5, texto: 'Muy Satisfecho' },
      ],
    },
    {
      id: 11,
      texto:
        '¿Consideras que eres tratado de manera justa en tu lugar de trabajo?',
      opciones: [
        { id: 1, texto: 'Muy Injustamente' },
        { id: 2, texto: 'Injustamente' },
        { id: 3, texto: 'Neutral' },
        { id: 4, texto: 'Justamente' },
        { id: 5, texto: 'Muy Justamente' },
      ],
    },
    {
      id: 12,
      texto: '¿Cómo percibes el clima organizacional de tu empresa?',
      opciones: [
        { id: 1, texto: 'Muy Desfavorable' },
        { id: 2, texto: 'Desfavorable' },
        { id: 3, texto: 'Neutral' },
        { id: 4, texto: 'Favorable' },
        { id: 5, texto: 'Muy Favorable' },
      ],
    },
    {
      id: 13,
      texto: '¿Cómo valoras los beneficios laborales que ofrece tu empresa?',
      opciones: [
        { id: 1, texto: 'Muy Malos' },
        { id: 2, texto: 'Malos' },
        { id: 3, texto: 'Neutral' },
        { id: 4, texto: 'Buenos' },
        { id: 5, texto: 'Muy Buenos' },
      ],
    },
    {
      id: 14,
      texto: '¿Cómo percibes la carga de trabajo en tu puesto?',
      opciones: [
        { id: 1, texto: 'Muy Excesiva' },
        { id: 2, texto: 'Excesiva' },
        { id: 3, texto: 'Adecuada' },
        { id: 4, texto: 'Ligera' },
        { id: 5, texto: 'Muy Ligera' },
      ],
    },
    {
      id: 15,
      texto: '¿Cómo valoras la flexibilidad laboral que tienes en tu empresa?',
      opciones: [
        { id: 1, texto: 'Muy Insuficiente' },
        { id: 2, texto: 'Insuficiente' },
        { id: 3, texto: 'Neutral' },
        { id: 4, texto: 'Suficiente' },
        { id: 5, texto: 'Muy Suficiente' },
      ],
    },
  ];

  preguntaActual: number = 0;
  opcionSeleccionada: number | null = null;
  progreso: number = 0;
  encuestaFinalizada: boolean = false;
  mostrarAlerta: boolean = false;
  respuestas: { [key: string]: string } = {}; //Almacenar las respuestas

  constructor(private encuestaService: EncuestaService){}

  seleccionarOpcion(opcionId: number) {
    this.opcionSeleccionada = opcionId;
    this.mostrarAlerta = false;
  }

  navegarSiguiente() {
    if (this.opcionSeleccionada === null) {
      this.mostrarAlerta = true; // Mostrar alerta si no se selecciona una opción
    } else if (this.preguntaActual < this.preguntas.length - 1) {
      this.respuestas[(this.preguntaActual + 1).toString()] = this.opcionSeleccionada.toString();
      this.preguntaActual++;
      this.opcionSeleccionada = null;
      this.actualizarProgreso();
    } else {
      this.respuestas[(this.preguntaActual + 1).toString()] = this.opcionSeleccionada.toString();
      this.finalizarEncuesta();
    }

  }

  navegarAtras() {
    if (this.preguntaActual > 0) {
      this.preguntaActual--;
      this.opcionSeleccionada = null;
      this.actualizarProgreso();
    }
  }

  actualizarProgreso() {
    this.progreso = Math.floor(
      (this.preguntaActual / this.preguntas.length) * 100
    );
  }

  finalizarEncuesta() {
    this.encuestaFinalizada = true;
    this.encuestaService.postRespuesta(this.respuestas).subscribe(
      response => {
        console.log('Respuestas registradas con éxito:', response);
      },
      error => {
        console.error('Error al registrar respuestas:', error);
      }
    );
  }

  cerrarAlerta() {
    this.mostrarAlerta = false;
  }
}
