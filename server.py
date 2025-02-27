from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import jwt
import mysql.connector
from datetime import datetime, timedelta
import os
import traceback


app = Flask(__name__, static_folder='front-end')
CORS(app, resources={r"/*": {"origins": "*"}})

secretKey = 'suaChaveSecretaAqui'  # Troque por uma chave mais forte

# Configuração do diretório de upload
app.config['UPLOAD_FOLDER'] = 'uploads' # Adicione esta linha

# Configuração do banco de dados
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': os.getenv('DB_PASSWORD', 'De182246@'),  # Melhor usar variável de ambiente
    'database': 'gestaopublicadigital'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

#  Rota de login
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('Email')
        senha = data.get('Senha')

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute('SELECT * FROM users WHERE Email = %s AND Senha = %s', (email, senha))
        user = cursor.fetchone()

        cursor.close()
        db.close()

        if user:
            token = jwt.encode({'id': user['id'], 'exp': datetime.utcnow() + timedelta(hours=1)}, secretKey, algorithm='HS256')
            return jsonify({'success': True, 'message': 'Login realizado com sucesso!', 'token': token, 'NomeCompleto': user['NomeCompleto']})
        else:
            return jsonify({'success': False, 'message': 'Credenciais inválidas.'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#  Rota para obter opções de cadastro da obra
@app.route('/cadastrar-obra', methods=['GET'])
def cadastrar_obra():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # Buscar regiões SEM duplicatas
        cursor.execute('SELECT DISTINCT id, Nome_Regiao FROM regioesbrasil')
        regioes = cursor.fetchall()

        # Buscar classificações de obra
        cursor.execute('SELECT DISTINCT id, TipoDeObra FROM classificacaodasobras')
        classificacoes = cursor.fetchall()

        # Buscar status da obra
        cursor.execute('SELECT DISTINCT id, Classificacao FROM statusdaobra')
        status = cursor.fetchall()

        cursor.close()
        db.close()

        return jsonify({
            'regioes': regioes,
            'classificacoes': classificacoes,
            'status': status
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/adicionar-obra', methods=['POST'])
def adicionar_obra():
    print("Início da função adicionar_obra")
    try:
        print("Dentro do bloco try")

        print("Dados recebidos do formulário:")
        print(request.form)

        nome_da_obra = request.form.get('NomeDaObra') # Corrigido
        regiao_nome = request.form.get('Regiao')
        classificacao_nome = request.form.get('ClassificacaoDaObra') # Corrigido
        status_nome = request.form.get('Status')
        data_inicio = request.form.get('DataDeInicio') # Corrigido
        data_termino = request.form.get('DataDeEntrega') # Corrigido
        orcamento_utilizado = request.form.get('Orçamento') # Corrigido
        descricao = request.form.get('Descricao')
        engenheiro_responsavel = request.form.get('EngResponsavel')

        print("Valores dos campos:")
        print(f"Nome da obra: {nome_da_obra}")
        print(f"Região: {regiao_nome}")
        print(f"Classificação: {classificacao_nome}")
        print(f"Status: {status_nome}")
        print(f"Data de início: {data_inicio}")
        print(f"Data de término: {data_termino}")
        print(f"Orçamento utilizado: {orcamento_utilizado}")
        print(f"Descrição: {descricao}")
        print(f"Engenheiro responsável: {engenheiro_responsavel}")

        imagem = request.files.get('Imagem')
        imagem_path = None

        if imagem:
            print("Imagem recebida.")
            filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{imagem.filename}"
            imagem_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            print(f"Caminho da imagem: {imagem_path}")
            imagem.save(imagem_path)
            imagem_path = imagem_path.replace("\\", "/")
            print(f"Caminho da imagem após substituição: {imagem_path}")
        else:
            print("Nenhuma imagem recebida.")

        if not nome_da_obra or not regiao_nome or not classificacao_nome or not status_nome or not data_inicio or not data_termino or not orcamento_utilizado or not engenheiro_responsavel:
            print("Campos obrigatórios não preenchidos.")
            return jsonify({'error': 'Campos obrigatórios não foram preenchidos.'}), 400
        
        data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
        data_termino_obj = datetime.strptime(data_termino, '%Y-%m-%d').date()

        if data_termino_obj < data_inicio_obj:
            return jsonify({'error': 'A data de término não pode ser anterior à data de início.'}), 400
        
        db = get_db_connection()
        cursor = db.cursor()

        print(f"Buscando ID da região: {regiao_nome}")
        cursor.execute("SELECT id FROM regioesbrasil WHERE id = %s", (regiao_nome,))
        regiao_id = cursor.fetchone()
        if not regiao_id:
            print(f"Região não encontrada: {regiao_nome}")
            return jsonify({'error': 'Região não encontrada'}), 400
        regiao_id = regiao_id[0]
        print(f"ID da região encontrado: {regiao_id}")

        print(f"Buscando ID da classificação: {classificacao_nome}")
        cursor.execute("SELECT id FROM classificacaodasobras WHERE id = %s", (classificacao_nome,))
        classificacao_id = cursor.fetchone()
        if not classificacao_id:
            print(f"Classificação não encontrada: {classificacao_nome}")
            return jsonify({'error': 'Classificação da obra não encontrada'}), 400
        classificacao_id = classificacao_id[0]
        print(f"ID da classificação encontrado: {classificacao_id}")

        print(f"Buscando ID do status: {status_nome}")
        cursor.execute("SELECT id FROM statusdaobra WHERE id = %s", (status_nome,))
        status_id = cursor.fetchone()
        if not status_id:
            print(f"Status não encontrado: {status_nome}")
            return jsonify({'error': 'Status não encontrado'}), 400
        status_id = status_id[0]
        print(f"ID do status encontrado: {status_id}")

        print("Inserindo obra no banco de dados.")
        cursor.execute("""
            INSERT INTO obras (NomeDaObra, Regiao, ClassificacaoDaObra, Status, DataDeInicio, DataDeEntrega, Orçamento, EngResponsavel, DescricaoDaObra, Imagens)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (nome_da_obra, regiao_id, classificacao_id, status_id, data_inicio, data_termino, orcamento_utilizado, engenheiro_responsavel, descricao, imagem_path)) # campos corrigidos

        db.commit()
        cursor.close()
        db.close()

        print("Obra cadastrada com sucesso.")
        print("Fim do bloco try")
        return jsonify({
            'success': True,
            'message': 'Obra cadastrada com sucesso!',
            'redirect': '/tela_pos_login.html'  # Adicionado o campo redirect
        }), 201
        
    except Exception as e:
        print("Dentro do bloco except")
        print(f"Erro ao adicionar obra: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
        print("Fim da função adicionar_obra")

#  Rota de logout (simples confirmação)
@app.route('/logout', methods=['POST'])
def logout():
    return jsonify({'success': True, 'message': 'Logout realizado com sucesso!'})

#  Iniciar servidor
if __name__ == '__main__':
    app.run(port=5500, debug=True)