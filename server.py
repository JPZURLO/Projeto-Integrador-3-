from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  # Importe o CORS aqui
import jwt
import mysql.connector
from datetime import datetime, timedelta
import os

app = Flask(__name__, static_folder='front-end')
CORS(app)  # Permite CORS para todas as origens

secretKey = 'suaChaveSecretaAqui'  # Substitua por uma chave secreta forte

# Configuração do banco de dados
db = mysql.connector.connect(
    host='localhost',
    user='root',
    password='De182246@',  # Substitua pela sua senha
    database='gestaopublicadigital'
)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('Email')
    senha = data.get('Senha')

    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM users WHERE Email = %s AND Senha = %s', (email, senha))
    user = cursor.fetchone()

    if user:
        token = jwt.encode({'id': user['id'], 'exp': datetime.utcnow() + timedelta(hours=1)}, secretKey, algorithm='HS256')
        return jsonify({'success': True, 'message': 'Login realizado com sucesso!', 'token': token, 'NomeCompleto': user['NomeCompleto']})
    else:
        return jsonify({'success': False, 'message': 'Credenciais inválidas.'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    # O token será removido do lado do cliente, então aqui apenas confirmamos a ação
    return jsonify({'success': True, 'message': 'Logout realizado com sucesso!'})

# Rodando o servidor Flask na porta 5500
if __name__ == '__main__':
    app.run(port=5500, debug=True)
