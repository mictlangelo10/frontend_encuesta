from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from sklearn.cluster import KMeans
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from sklearn.metrics import silhouette_score, silhouette_samples

app = Flask(__name__)

CORS(app)

# Configuración de MySQL
app.config['MYSQL_HOST'] = 'sql5.freesqldatabase.com'
app.config['MYSQL_USER'] = 'sql5722384'
app.config['MYSQL_PASSWORD'] = 'LmPeGiVjv1'
app.config['MYSQL_DB'] = 'sql5722384'

mysql = MySQL(app)

# Datos
@app.route('/datos', methods=['GET'])
def obtener_datos():
    cur = mysql.connection.cursor()
    cur.execute('''SELECT * FROM usuario''')
    datos = cur.fetchall()
    cur.close()
    return jsonify(datos)

# Login
@app.route('/login', methods=['POST'])
def login():
    # Obtiene el username y password del cuerpo de la solicitud
    username = request.json.get('username')
    password = request.json.get('password')

    if not username or not password:
        return jsonify({'mensaje': 'Usuario y contraseña requeridos.', 'exito': False})

    try:
        cursor = mysql.connection.cursor()
        # Consulta para verificar el username y password
        sql = "SELECT nombre FROM usuario WHERE username = %s AND password = %s"
        cursor.execute(sql, (username, password))
        datos = cursor.fetchone()

        if datos:
            return jsonify({'nombre': datos[0], 'mensaje': 'Inicio de sesión exitoso.', 'exito': True})
        else:
            return jsonify({'mensaje': 'Credenciales incorrectas.', 'exito': False})
    except Exception as ex:
        return jsonify({'mensaje': 'Error en el servidor.', 'exito': False})
    
# Registrar usuario
@app.route('/usuarios', methods=['POST'])
def registrar_usuario():    
    try:
        cursor = mysql.connection.cursor()
        sql = """INSERT INTO usuario (username, password, nombre) 
                    VALUES (%s, %s, %s)"""
        cursor.execute(sql, (request.json['username'], request.json['password'], request.json['nombre']))
        mysql.connection.commit()
        return jsonify({'mensaje': "Usuario registrado.", 'exito': True})
    except Exception as ex:
        return jsonify({'mensaje': "Error", 'exito': False})

# Obtener preguntas
@app.route('/preguntas', methods=['GET'])
def obtener_preguntas():
    try:
        cursor = mysql.connection.cursor()
        sql = "SELECT id, descripcion FROM pregunta ORDER BY id ASC"
        cursor.execute(sql)
        datos = cursor.fetchall()
        preguntas = []
        for fila in datos:
            pregunta = {'id': fila[0], 'descripcion': fila[1]}
            preguntas.append(pregunta)
        return jsonify({'preguntas': preguntas, 'mensaje': "Preguntas listadas.", 'exito': True})
    except Exception as ex:
        return jsonify({'mensaje': "Error", 'exito': False})

# Registrar respuestas de encuesta
@app.route('/respuestas', methods=['POST'])
def registrar_respuestas():
    respuestas = request.json
    
    if not respuestas:
        return jsonify({'mensaje': "No se proporcionaron respuestas.", 'exito': False})
    
    # Validar que todas las respuestas sean numéricas
    if not all(value.isdigit() for value in respuestas.values()):
        return jsonify({'mensaje': "Todas las respuestas deben ser numéricas.", 'exito': False})
    
    try:
        cursor = mysql.connection.cursor()

        # Construir la consulta SQL
        columnas = ', '.join(f'`{key}`' for key in respuestas.keys())
        valores = ', '.join(['%s'] * len(respuestas))
        sql = f"""INSERT INTO respuesta ({columnas}) VALUES ({valores})"""
        
        # Ejecutar la consulta
        cursor.execute(sql, tuple(respuestas.values()))
        mysql.connection.commit()
        
        return jsonify({'mensaje': "Respuestas registradas.", 'exito': True})
    except Exception as ex:
        print(f"Error: {ex}")  # Imprimir error para depuración
        return jsonify({'mensaje': "Error al registrar respuestas.", 'exito': False})


# Obtener respuestas de encuesta
@app.route('/respuestas', methods=['GET'])
def obtener_respuestas():
    try:
        cursor = mysql.connection.cursor()
        sql = "SELECT * FROM respuesta"
        cursor.execute(sql)
        datos = cursor.fetchall()
        respuestas = []
        for fila in datos:
            respuesta = {f"{i + 1}": fila[i + 1] for i in range(len(fila) - 1)}
            respuestas.append(respuesta)
        return jsonify({'respuestas': respuestas, 'mensaje': "Respuestas obtenidas.", 'exito': True})
    except Exception as ex:
        return jsonify({'mensaje': "Error", 'exito': False})


# Obtener respuestas de alguno en específico
@app.route('/respuestas/<int:resp_id>', methods=['GET'])
def obtener_respuestas_personales(resp_id):
    try:
        cursor = mysql.connection.cursor()
        sql = "SELECT `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `13`, `14`, `15` FROM respuesta WHERE id = %s"
        cursor.execute(sql, (resp_id,))
        datos = cursor.fetchone()
        if datos:
            respuestas = dict(enumerate(datos, start=1))
            return jsonify({'respuestas': respuestas, 'mensaje': "Respuestas encontradas.", 'exito': True})
        else:
            return jsonify({'mensaje': "No se encontraron respuestas para este usuario.", 'exito': False})
    except Exception as ex:
        return jsonify({'mensaje': "Error", 'exito': False})



# Entrenamiento de esa madre con el modelo k-means, considerar la consulta: SELECT `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `13`, `14`, `15` FROM respuesta; para obtener los datos
def generar_distribucion_y_centroides_graph(datos, centroides, etiquetas): # Funciona muito bem
    # Convertir los datos y centroides a DataFrames
    df_datos = pd.DataFrame(datos, columns=[f'Característica {i+1}' for i in range(len(datos[0]))])
    df_centroides = pd.DataFrame(centroides, columns=[f'Característica {i+1}' for i in range(len(centroides[0]))])
    
    # Asignar etiquetas a los clusters
    etiquetas_clusters = ['Satisfecho', 'Insatisfecho', 'Medio']
    df_centroides['Etiqueta'] = etiquetas_clusters
    
    # Añadir etiquetas de clústeres al DataFrame de datos
    df_datos['Etiqueta'] = etiquetas

    plt.figure(figsize=(12, 8))
    
    # Graficar los datos de los clústeres
    sns.scatterplot(data=df_datos, x=df_datos.columns[0], y=df_datos.columns[1], hue='Etiqueta', palette='tab10', alpha=0.6, s=50, legend='full')
    
    # Graficar los centroides
    sns.scatterplot(data=df_centroides, x=df_centroides.columns[0], y=df_centroides.columns[1], color='red', marker='X', s=100, legend='full')
    
    plt.title('Distribución de Clústeres y Centroides')
    plt.xlabel('Satisfacción del Trabajo')
    plt.ylabel('Ambiente Laboral')
    plt.legend(title='Etiqueta')
    
    # Guardar la gráfica en formato base64
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    graph_base64 = base64.b64encode(img.getvalue()).decode()
    
    plt.close()
    return graph_base64

def generar_distribucion_datos_por_cluster(etiquetas): #Funciona muito bem
    # Definir etiquetas para los clusters
    etiquetas_clusters = {0: 'Satisfecho', 1: 'Insatisfecho', 2: 'Medio'}
    
    # Reemplazar números de clústeres por etiquetas
    etiquetas_etiquetadas = [etiquetas_clusters.get(label, 'Desconocido') for label in etiquetas]
    
    # Contar la cantidad de datos en cada clúster
    cluster_counts = pd.Series(etiquetas_etiquetadas).value_counts()
        
    # Crear la gráfica
    plt.figure(figsize=(10, 6))
    ax = sns.barplot(x=cluster_counts.index, y=cluster_counts.values, palette='tab10')

    # Etiquetar cada barra con la cantidad exacta
    for p in ax.patches:
        ax.annotate(f'{p.get_height()}', (p.get_x() + p.get_width() / 2., p.get_height()),
                    ha='center', va='center', xytext=(0, 10),
                    textcoords='offset points')

    plt.title('Cantidad de datos por nivel de satisfacción')
    plt.xlabel('Niveles de satisfacción')
    plt.ylabel('Número de datos')
    
    # Guardar la gráfica en un buffer en memoria
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    graph_base64 = base64.b64encode(img.getvalue()).decode()
    
    plt.close()
    return graph_base64

def generar_grafica_codo(datos): # Jala muito bem
    # Determinar el rango de números de clústeres para probar
    rangos_clusters = range(1, 11)
    inercia = []
    
    for k in rangos_clusters:
        kmeans = KMeans(n_clusters=k, random_state=0).fit(datos)
        inercia.append(kmeans.inertia_)
    
    plt.figure(figsize=(10, 6))
    plt.plot(rangos_clusters, inercia, marker='o')
    plt.title('Gráfico del Codo')
    plt.xlabel('Número de Clústeres')
    plt.ylabel('Inercia')
    plt.xticks(rangos_clusters)
    
    # Guardar la gráfica en formato base64
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    graph_base64 = base64.b64encode(img.getvalue()).decode()
    
    plt.close()
    return graph_base64

@app.route('/entrenar_kmeans', methods=['POST'])
def entrenar_kmeans():
    try:
        num_clusters = request.json.get('num_clusters', 3)  # Valor por defecto 3 si no se proporciona
        
        cursor = mysql.connection.cursor()
        sql = "SELECT `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `13`, `14`, `15` FROM respuesta"
        cursor.execute(sql)
        datos = cursor.fetchall()
        cursor.close()

        # Convertir datos a un formato adecuado para el algoritmo k-means
        datos_np = np.array(datos)
        
        # Entrenar el modelo k-means
        kmeans = KMeans(n_clusters=num_clusters, random_state=0).fit(datos_np)
        
        # Obtener los centroides y etiquetas
        centroides = kmeans.cluster_centers_.tolist()
        etiquetas = kmeans.labels_.tolist()
        
        # Generar gráficas en base64
        grafica_clusters_centroides = generar_distribucion_y_centroides_graph(datos, centroides, etiquetas)
        grafica_datos_por_cluster = generar_distribucion_datos_por_cluster(etiquetas)
        grafica_codo = generar_grafica_codo(datos_np)
        
        # Preparar los datos para enviar como respuesta
        respuesta = {
            'centroides': centroides,
            'etiquetas': etiquetas,
            'grafica_distribucion_centroides': grafica_clusters_centroides,
            'grafica_datos_por_cluster': grafica_datos_por_cluster,
            'grafica_codo': grafica_codo,
        }
        
        return jsonify({'resultado': respuesta, 'mensaje': "Entrenamiento exitoso.", 'exito': True})
    
    except Exception as ex:
        print(f"Error: {ex}")
        return jsonify({'mensaje': "Error al entrenar el modelo.", 'exito': False})


if __name__ == '__main__':
    app.run(debug=True)
