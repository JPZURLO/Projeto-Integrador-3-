from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import jwt
import mysql.connector
from datetime import datetime, timedelta
import os
import traceback
import json  # Adicione esta linha




app = Flask(__name__, static_folder='front-end')
CORS(app, resources={r"/*": {"origins": "*"}}, methods=["GET", "POST", "PUT", "DELETE"])

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

import hashlib

def gerar_hash_imagem(imagem):
    hash_md5 = hashlib.md5(imagem).hexdigest()
    return hash_md5

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

import hashlib


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
        orcamento_utilizado = request.form.get('orcamento')  # Corrigido para 'orcamento'
        descricao = request.form.get('Descricao')
        engenheiro_responsavel = request.form.get('EngResponsavel')

        # Transformação do orçamento
        orcamento_utilizado = orcamento_utilizado.replace('.', '')  # Remover os pontos
        orcamento_utilizado = orcamento_utilizado.replace(',', '.')  # Substituir vírgula por ponto

        # Garantir que o valor do orçamento seja um número válido
        try:
            orcamento_utilizado = float(orcamento_utilizado)
        except ValueError:
            raise ValueError("O valor do orçamento é inválido!")
        
        print("Valores dos campos:")
        print(f"Nome da obra: {nome_da_obra}")
        print(f"Região: {regiao_nome}")
        print(f"Classificação: {classificacao_nome}")
        print(f"Status: {status_nome}")
        print(f"Data de início: {data_inicio}")
        print(f"Data de término: {data_termino}")
        print(f"Orcamento utilizado: {orcamento_utilizado}")
        print(f"Descrição: {descricao}")
        print(f"Engenheiro responsável: {engenheiro_responsavel}")

        imagens = request.files.getlist('imagem')
        imagem_paths = []
        imagens_hash = set()

        for imagem in imagens:
            if imagem:
                imagem_content = imagem.read()
                imagem_hash = gerar_hash_imagem([imagem_content])
                imagem.stream.seek(0)

                if imagem_hash not in imagens_hash:
                    imagens_hash.add(imagem_hash)
                    filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{imagem.filename}"
                    imagem_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    imagem.save(imagem_path)
                    imagem_paths.append(f"/uploads/{filename}")
        
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

        import json
        cursor.execute("""
            INSERT INTO obras (NomeDaObra, Regiao, ClassificacaoDaObra, Status, DataDeInicio, DataDeEntrega, Orcamento, EngResponsavel, DescricaoDaObra, Imagens)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (nome_da_obra, regiao_id, classificacao_id, status_id, data_inicio, data_termino, orcamento_utilizado, engenheiro_responsavel, descricao, json.dumps(imagem_paths)))

        
        db.commit()
        cursor.close()
        db.close()

        return jsonify({
            'success': True,
            'message': 'Obra cadastrada com sucesso!',
        }), 201
    except Exception as e:
        print("Erro ao adicionar obra:", str(e))
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    
def obter_status_do_banco():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, Classificacao FROM statusdaobra")  # Correção aqui
        status_options = cursor.fetchall()
        cursor.close()
        conn.close()
        return status_options
    except Exception as e:
        print("Erro ao obter status do banco de dados:", e)
        return []
    
@app.route('/status', methods=['GET'])
def get_status():
    try:
        status_options = obter_status_do_banco()
        return jsonify(status_options), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/obras-recentes', methods=['GET'])
def obras_recentes():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, DescricaoDaObra, Imagens
            FROM obras
            ORDER BY id DESC
            LIMIT 6
        """)
        obras = cursor.fetchall()

        cursor.close()
        db.close()

        # Modificando a resposta para retornar as obras
        return jsonify({
            'obras': obras
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/obras-editar', methods=['GET'])
def obras_editar():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        print("Executando a consulta SQL...")  # Adicionado print()
        cursor.execute("""
            SELECT Id, Imagens
            FROM obras
            ORDER BY Id DESC
        """)
        obras = cursor.fetchall()

        print("Dados recuperados do banco de dados:")  # Adicionado print()
        print(obras)  # Adicionado print()

        cursor.close()
        db.close()

        print("Dados que serão enviados na resposta da API:")  # Adicionado print()
        print(obras)  # Adicionado print()

        return jsonify({
            'obras': obras
        })
    except Exception as e:
        print("Erro:", e)  # Adicionado print()
        return jsonify({'error': str(e)}), 500

    
@app.route('/uploads/<filename>')
def get_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


#  Rota de logout (simples confirmação)
@app.route('/logout', methods=['POST'])
def logout():
    return jsonify({'success': True, 'message': 'Logout realizado com sucesso!'})

@app.route('/tela_pos_login')
def tela_pos_login():
    return send_from_directory(os.path.join(app.static_folder, 'html'), 'tela_pos_login.html')

@app.route('/obras/<int:obra_id>', methods=['GET'])
def get_obra(obra_id):
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # Modifique a consulta para retornar todos os campos
        cursor.execute("SELECT * FROM obras WHERE Id = %s", (obra_id,))
        obra = cursor.fetchone()

        cursor.close()
        db.close()

        if obra:
            return jsonify(obra)
        else:
            return jsonify({"error": "Obra não encontrada"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/obras/<int:obra_id>', methods=['PUT'])
def atualizar_obra(obra_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Obter dados do FormData
        nome_da_obra = request.form.get('NomeDaObra')
        regiao = request.form.get('Regiao')
        classificacao_da_obra = request.form.get('ClassificacaoDaObra')
        data_de_inicio = request.form.get('DataDeInicio')
        data_de_entrega = request.form.get('DataDeEntrega')
        orcamento = request.form.get('Orcamento')
        eng_responsavel = request.form.get('EngResponsavel')
        status = request.form.get('Status')
        descricao_da_obra = request.form.get('DescricaoDaObra')

        # Obter imagens existentes do banco de dados
        cursor.execute("SELECT Imagens FROM obras WHERE Id = %s", (obra_id,))
        resultado = cursor.fetchone()
        imagens_existentes = json.loads(resultado[0]) if resultado and resultado[0] else []

        # Obter novas imagens
        novas_imagens = request.files.getlist('novasImagens')
        novas_imagens_paths = []
        imagens_hash = set()


        for imagem in novas_imagens:
            if imagem:
                imagem_content = imagem.read()  # Lê o conteúdo da imagem
                imagem_hash = gerar_hash_imagem(imagem_content)  # Calcula o hash do conteúdo

                if imagem_hash not in imagens_hash:
                    imagens_hash.add(imagem_hash)
                    filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{imagem.filename}"
                    imagem_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    imagem.seek(0)  # Reseta o ponteiro do arquivo para o início
                    imagem.save(imagem_path)  # Salva a imagem
                    novas_imagens_paths.append(f"/uploads/{filename}")

       # Combinar imagens existentes e novas (removendo duplicatas)
        todas_imagens = list(set(imagens_existentes + novas_imagens_paths))

        # Obter imagens a serem removidas
        imagens_para_remover = json.loads(request.form.get('imagensParaRemover')) if request.form.get('imagensParaRemover') else []

        # Filtrar imagens existentes
        todas_imagens = [img for img in todas_imagens if img not in imagens_para_remover]

        # Atualizar o banco de dados
        sql = """UPDATE obras SET NomeDaObra=%s, Regiao=%s, ClassificacaoDaObra=%s,
                 DataDeInicio=%s, DataDeEntrega=%s, Orcamento=%s, EngResponsavel=%s,
                 Status=%s, DescricaoDaObra=%s, Imagens=%s WHERE Id=%s"""

        valores = (
            nome_da_obra,
            regiao,
            classificacao_da_obra,
            data_de_inicio,
            data_de_entrega,
            orcamento,
            eng_responsavel,
            status,
            descricao_da_obra,
            json.dumps(todas_imagens),
            obra_id
        )

        cursor.execute(sql, valores)
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'mensagem': 'Obra atualizada com sucesso!'}), 200

    except Exception as e:
        print("Erro ao atualizar obra:", e)
        return jsonify({'erro': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5500)

#  Iniciar servidor
if __name__ == '__main__':
    app.run(port=5500, debug=True)
