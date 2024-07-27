from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

# Configuración de MySQL
app.config['MYSQL_HOST'] = 'sql5.freesqldatabase.com'
app.config['MYSQL_USER'] = 'sql5722384'
app.config['MYSQL_PASSWORD'] = 'LmPeGiVjv1'
app.config['MYSQL_DB'] = 'sql5722384'

mysql = MySQL(app)

@app.route('/datos', methods=['GET'])
def obtener_datos():
    cur = mysql.connection.cursor()
    cur.execute('''SELECT * FROM usuario''')
    datos = cur.fetchall()
    cur.close()
    return jsonify(datos)

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

if __name__ == '__main__':
    app.run(debug=True)
