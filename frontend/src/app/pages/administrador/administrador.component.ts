import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EncuestaService } from '../../services/encuesta.service';
import { EntrenamientoService } from '../../services/kmeans.service';
import html2canvas from 'html2canvas';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

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
  descripcion: string =
    'El Gráfico del Codo ayuda a determinar el número óptimo de clusters, mostrando la inercia total en función del número de clusters. Es útil para evaluar el nivel de satisfacción laboral de los empleados al agrupar sus respuestas en diferentes clusters.'; // Descripción inicial

  currentPage: number = 0;
  itemsPerPage: number = 15;
  totalPages: number = 0;
  currentItems: any[] = [];
  isModalOpen: boolean = false;
  graficas = [
    { label: 'Gráfico del Codo', value: 'grafica_codo', checked: false },
    {
      label: 'Distribución de Datos por Cluster',
      value: 'grafica_datos_por_cluster',
      checked: false,
    },
    {
      label: 'Distribución de Centroides',
      value: 'grafica_distribucion_centroides',
      checked: false,
    },
  ];
  mostrarAlerta: boolean = false; // Controla la visibilidad de la alerta

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

    // Actualizar la descripción basada en el gráfico seleccionado
    switch (this.selectedGrafica) {
      case 'grafica_codo':
        this.descripcion =
          'El Gráfico del Codo ayuda a determinar el número óptimo de clusters, mostrando la inercia total en función del número de clusters. Es útil para evaluar el nivel de satisfacción laboral de los empleados al agrupar sus respuestas en diferentes clusters.';
        break;
      case 'grafica_datos_por_cluster':
        this.descripcion =
          'La Distribución de Datos por Cluster muestra cómo se agrupan los empleados en diferentes clusters basados en su satisfacción laboral, ayudando a identificar grupos con diferentes niveles de satisfacción.';
        break;
      case 'grafica_distribucion_centroides':
        this.descripcion =
          'La Distribución de Centroides visualiza los centros de cada cluster, indicando las características promedio de cada grupo de empleados en términos de satisfacción laboral.';
        break;
      default:
        this.descripcion = '';
        break;
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.clearSelections();
  }

  async generatePDF() {
    const selectedGraficas = this.graficas.filter((g) => g.checked);
    if (selectedGraficas.length === 0) {
      this.mostrarAlertaError(); // Mostrar la alerta si no se selecciona ninguna gráfica
      return;
    }

    const introduction = `La presente encuesta de satisfacción laboral tiene como objetivo conocer el nivel de satisfacción de los empleados en diversos aspectos relacionados con su trabajo y ambiente laboral. A continuación, se presentan las preguntas realizadas, junto con la ponderación de las respuestas y los resultados obtenidos en las gráficas de análisis.`;

    const questionsList = this.preguntas
      .map((pregunta: any, index: number) => {
        return `${index + 1}. ${pregunta.descripcion}`;
      })
      .join('\n');

    const ponderacionExplanation = `Las respuestas se han ponderado utilizando una escala del 1 al 5, donde:
      - 1: Muy insatisfecho
      - 2: Insatisfecho
      - 3: Neutro
      - 4: Satisfecho
      - 5: Muy satisfecho`;

    // Contar los niveles de satisfacción
    const countByEtiqueta = (etiqueta: number) => {
      return this.respuestas_tabla.filter(
        (item: any) => item.etiqueta === etiqueta
      ).length;
    };

    const satisfiedCount = countByEtiqueta(1);
    const neutralCount = countByEtiqueta(0);
    const unsatisfiedCount = countByEtiqueta(2);

    const satisfactionResults = `- Satisfechos: ${satisfiedCount} individuos.
      - Medio: ${neutralCount} individuos.
      - Insatisfechos: ${unsatisfiedCount} individuos.`;

    const content: any[] = [
      { text: 'Introducción', style: 'header', margin: [0, 0, 0, 10] },
      { text: introduction, style: 'body', margin: [0, 0, 0, 20] },
      {
        text: 'Preguntas Realizadas',
        style: 'subheader',
        margin: [0, 0, 0, 10],
      },
      { text: questionsList, style: 'body', margin: [0, 0, 0, 20] },
      {
        text: 'Ponderación de Respuestas',
        style: 'subheader',
        margin: [0, 0, 0, 10],
      },
      { text: ponderacionExplanation, style: 'body', margin: [0, 0, 0, 20] },
      {
        text: 'Resultados de Satisfacción',
        style: 'subheader',
        margin: [0, 0, 0, 10],
      },
      { text: satisfactionResults, style: 'body', margin: [0, 0, 0, 20] },
      { text: 'Resultado en Gráficas', style: 'header', margin: [0, 0, 0, 20] },
    ];

    for (const grafica of selectedGraficas) {
      const description = this.getGraficaDescripcion(grafica.value);
      let imgData: string | undefined;

      // Usar las imágenes base64 ya existentes
      switch (grafica.value) {
        case 'grafica_codo':
          imgData = this.grafica_codo;
          break;
        case 'grafica_datos_por_cluster':
          imgData = this.grafica_datos_por_cluster;
          break;
        case 'grafica_distribucion_centroides':
          imgData = this.grafica_distribucion_centroides;
          break;
      }

      if (imgData) {
        content.push(
          { text: grafica.label, style: 'subheader', margin: [0, 10, 0, 10] },
          { text: description, style: 'description', margin: [0, 0, 0, 10] },
          { image: imgData, width: 500, margin: [0, 0, 0, 20] }
        );
      }
    }

    const docDefinition = {
      content,
      styles: {
        header: { fontSize: 22, bold: true },
        subheader: { fontSize: 18, bold: true },
        body: { fontSize: 12, lineHeight: 1.3 },
        description: { fontSize: 12 },
      },
    };

    pdfMake.createPdf(docDefinition).open();
    this.clearSelections();
    this.closeModal();
  }

  getGraficaDescripcion(value: string): string {
    switch (value) {
      case 'grafica_codo':
        return 'El Gráfico del Codo ayuda a determinar el número óptimo de clusters, mostrando la inercia total en función del número de clusters.';
      case 'grafica_datos_por_cluster':
        return 'La Distribución de Datos por Cluster muestra cómo se agrupan los empleados en diferentes clusters basados en su satisfacción laboral.';
      case 'grafica_distribucion_centroides':
        return 'La Distribución de Centroides visualiza los centros de cada cluster, indicando las características promedio de cada grupo de empleados en términos de satisfacción laboral.';
      default:
        return '';
    }
  }

  crearExcel() {
    // Muestra una alerta de confirmación antes de generar el Excel
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se generará un reporte en excel con la información de todos los registros, ¿Estás seguro de continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Procede a generar el Excel
        const EXCEL_TYPE =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        if (!this.respuestas_tabla || this.respuestas_tabla.length === 0) {
          console.error('No hay datos para exportar.');
          return;
        }

        // Extraer las preguntas y crear los encabezados
        const encabezados = this.preguntas.map(
          (pregunta: any) => pregunta.descripcion
        );
        encabezados.push('Etiqueta'); // Agregar la columna de etiqueta

        // Transformar respuestas_tabla en un formato adecuado para Excel
        const datosExcel = this.respuestas_tabla.map((item: any) => {
          // Extraer las respuestas y convertirlas en un formato de array
          const respuestas = this.preguntas.map(
            (pregunta: any) => item.respuestas[pregunta.id] || ''
          );

          // Crear una fila de datos con respuestas y la etiqueta
          return [...respuestas, this.getEtiquetaLabel(item.etiqueta)];
        });

        // Crear una hoja de trabajo
        const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
          encabezados,
          ...datosExcel,
        ]);

        // Establecer el ancho de todas las columnas en 50 píxeles
        worksheet['!cols'] = encabezados.map(() => ({ wpx: 75 }));

        // Crear un libro de trabajo y agregar la hoja de trabajo
        const workbook: XLSX.WorkBook = {
          Sheets: { Datos: worksheet },
          SheetNames: ['Datos'],
        };

        // Convertir el libro de trabajo a un archivo Excel
        const excelBuffer: any = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });

        // Crear un blob y descargar el archivo
        const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
        const url: string = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'datos_encuesta.xlsx';
        link.click();
      }
    });
  }

  getNivelSatisfaccion(etiqueta: number): string {
    const niveles = {
      0: 'Medio',
      1: 'Satisfecho',
      2: 'Insatisfecho',
    };
    return niveles[etiqueta] || 'Desconocido';
  }
  mostrarAlertaError() {
    this.mostrarAlerta = true; // Activar la alerta
  }

  cerrarAlerta() {
    this.mostrarAlerta = false; // Desactivar la alerta
  }

  // Método para limpiar las selecciones
  clearSelections() {
    this.graficas.forEach((grafica) => {
      grafica.checked = false;
    });
  }
}
