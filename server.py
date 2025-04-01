from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import jwt
import mysql.connector
from datetime import datetime, timedelta
import os
import traceback
import json  # Adicione esta linha
from openpyxl import load_workbook
from werkzeug.utils import secure_filename  # Adicione esta linha
app = Flask(__name__, static_folder='FRONT/html', static_url_path='/FRONT/html')
CORS(app, resources={r"/*": {"origins": ["*", "http://localhost:5501"]}}, methods=["GET", "POST", "PUT", "DELETE"])

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

@app.route('/obras-dados')
def get_obras_dados():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT COUNT(*) as total FROM obras")
        total_obras = cursor.fetchone()['total']

        cursor.execute("""
            SELECT c.TipoDeObra, COUNT(*) as quantidade
            FROM obras o
            JOIN classificacaodasobras c ON o.ClassificacaoDaObra = c.Id
            GROUP BY c.TipoDeObra
        """)
        obras_por_tipo = cursor.fetchall()

        cursor.execute("""
            SELECT r.Nome_Regiao, COUNT(*) as quantidade
            FROM obras o
            JOIN regioesbrasil r ON o.Regiao = r.Id
            GROUP BY r.Nome_Regiao
        """)
        obras_por_regiao = cursor.fetchall()

        cursor.execute("""
            SELECT r.Nome_Regiao, c.TipoDeObra, COUNT(*) as quantidade
            FROM obras o
            JOIN regioesbrasil r ON o.Regiao = r.Id
            JOIN classificacaodasobras c ON o.ClassificacaoDaObra = c.Id
            GROUP BY r.Nome_Regiao, c.TipoDeObra
        """)
        total_por_regiao_tipo = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            'totalObras': total_obras,
            'obrasPorTipo': obras_por_tipo,
            'obrasPorRegiao': obras_por_regiao,
            'totalPorRegiaoTipo': total_por_regiao_tipo
        })
    except Exception as e:
        print(f"Erro ao buscar dados: {e}")
        return jsonify({'error': 'Erro ao buscar dados'}), 500


def get_db_connection():
    return mysql.connector.connect(**db_config)

import hashlib

def gerar_hash_imagem(imagens):
    hashes = []
    for imagem_content in imagens:
        hash_md5 = hashlib.md5(imagem_content).hexdigest()
        hashes.append(hash_md5)
    return hashes

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

imagens_hash = set()  # Inicializa o conjunto fora da função

@app.route('/adicionar-obra', methods=['POST'])
def adicionar_obra():
    print("Início da função adicionar_obra")
    try:
        print("Dentro do bloco try")
        print("Dados recebidos do formulário:")
        print(request.form)

        nome_da_obra = request.form.get('NomeDaObra')
        regiao_nome = request.form.get('Regiao')
        classificacao_nome = request.form.get('ClassificacaoDaObra')
        status_nome = request.form.get('Status')
        data_inicio = request.form.get('DataDeInicio')  # Correção aqui
        data_termino = request.form.get('DataDeEntrega')  # Correção aqui
        orcamento_utilizado = request.form.get('orcamento')
        descricao = request.form.get('Descricao')
        engenheiro_responsavel = request.form.get('EngResponsavel')

        # Transformação do orçamento
        orcamento_utilizado = orcamento_utilizado.replace('.', '')
        orcamento_utilizado = orcamento_utilizado.replace(',', '.')

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
        imagens_hash_existente = set() # Vamos usar um novo conjunto para verificar duplicidades nesta requisição

        for imagem in imagens:
            if imagem:
                filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{imagem.filename}"
                imagem_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                imagem.save(imagem_path)
                imagem_paths.append(f"/uploads/{filename}")

        if imagens_hash_existente:
            return jsonify({'error': 'Uma ou mais imagens já foram cadastradas anteriormente.'}), 400

        data_inicio_obj = None
        if data_inicio:
            try:
                data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de data de início inválido'}), 400

        data_termino_obj = None
        if data_termino:
            try:
                data_termino_obj = datetime.strptime(data_termino, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de data de término inválido'}), 400

        if data_inicio_obj and data_termino_obj and data_termino_obj < data_inicio_obj:
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
        """, (nome_da_obra, regiao_id, classificacao_id, status_id, data_inicio_obj, data_termino_obj, orcamento_utilizado, engenheiro_responsavel, descricao, json.dumps(imagem_paths)))

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


        novas_imagens_paths = []


        imagens = request.files.getlist('imagem')
        imagem_paths = []
        print(f"Número de arquivos enviados: {len(imagens)}")

        for imagem in imagens:
            print(f"Processando arquivo: {imagem.filename}")
            if imagem:
                filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{imagem.filename}"
                imagem_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                imagem.save(imagem_path)
                imagem_paths.append(f"/uploads/{filename}")

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

@app.route('/obras-consultar', methods=['GET'])
def obras_consultar():
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

from datetime import datetime, timedelta

@app.route('/obras-excel', methods=['POST'])
def obras_excel():
    try:
        if 'arquivo' not in request.files:
            return jsonify({'success': False, 'message': 'Nenhum arquivo enviado'})

        arquivo_excel = request.files['arquivo']
        if arquivo_excel.filename == '':
            return jsonify({'success': False, 'message': 'Nenhum arquivo selecionado'})

        if arquivo_excel:
            workbook = load_workbook(arquivo_excel)
            sheet = workbook.active
            obras = []
            headers = [cell.value for cell in sheet[1]]

            for row in sheet.iter_rows(min_row=2):
                obra = {}
                for i, cell in enumerate(row):
                    obra[headers[i]] = cell.value
                obras.append(obra)

            db = get_db_connection()
            cursor = db.cursor()

            for obra in obras:
                nome_da_obra = obra.get('NomeDaObra')
                regiao_nome = obra.get('Regiao')
                classificacaoDaObra_nome = obra.get('ClassificacaoDaObra')
                status_nome = obra.get('Status')
                data_inicio = obra.get('DataDeInicio')
                data_termino = obra.get('DataDeEntrega')
                orcamento_utilizado = obra.get('Orcamento')
                engenheiro_responsavel = obra.get('EngResponsavel')
                descricao = obra.get('DescricaoDaObra')
                imagens = obra.get('Imagens')

                # Processar imagens
                imagens = obra.get('Imagens')
                links_imagens = []
                if imagens:
                    imagens_lista = imagens.split(',')
                    for nome_imagem in imagens_lista:
                        nome_imagem = nome_imagem.strip()
                        caminho_imagem = os.path.join(os.path.dirname(arquivo_excel.filename), nome_imagem)
                        if os.path.exists(caminho_imagem):
                            nome_arquivo_unico = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{secure_filename(nome_imagem)}"
                            caminho_destino = os.path.join(app.config['UPLOAD_FOLDER'], nome_arquivo_unico)
                            os.rename(caminho_imagem, caminho_destino)
                            link_imagem = f"/uploads/{nome_arquivo_unico}"
                            links_imagens.append(link_imagem)
                            print(f"Imagem processada: {link_imagem}") # Adicione esta linha
                        else:
                            print(f"Imagem não encontrada: {nome_imagem}") # Adicione esta linha
                imagens = str(links_imagens)
                print(f"Links das imagens: {imagens}") # Adicione esta linha

                # Buscar ID da região
                cursor.execute("SELECT id FROM regioesbrasil WHERE Nome_Regiao = %s", (regiao_nome,))
                regiao_id = cursor.fetchone()
                if regiao_id:
                    regiao_id = regiao_id[0]
                else:
                    return jsonify({'success': False, 'message': f'Região "{regiao_nome}" não encontrada'})
                cursor.fetchall()
                cursor.close()
                cursor = db.cursor()

                # Buscar ID da classificação
                cursor.execute("SELECT id FROM classificacaodasobras WHERE TipoDeObra = %s", (classificacaoDaObra_nome,))
                classificacao_id = cursor.fetchone()
                if classificacao_id:
                    classificacao_id = classificacao_id[0]
                else:
                    return jsonify({'success': False, 'message': f'Classificação "{classificacaoDaObra_nome}" não encontrada'})
                cursor.fetchall()
                cursor.close()
                cursor = db.cursor()

                # Buscar ID do status
                cursor.execute("SELECT id FROM statusdaobra WHERE Classificacao = %s", (status_nome,))
                status_id = cursor.fetchone()
                if status_id:
                    status_id = status_id[0]
                else:
                    return jsonify({'success': False, 'message': f'Status "{status_nome}" não encontrado'})
                cursor.fetchall()
                cursor.close()
                cursor = db.cursor()

                # Converter números de série para objetos datetime
                if isinstance(data_inicio, int):
                    data_inicio = datetime(1899, 12, 30) + timedelta(days=data_inicio)
                if isinstance(data_termino, int):
                    data_termino = datetime(1899, 12, 30) + timedelta(days=data_termino)

                # Usar objetos datetime diretamente
                data_inicio_obj = data_inicio.date()
                data_termino_obj = data_termino.date()

                cursor.execute("""
                    INSERT INTO obras (NomeDaObra, Regiao, ClassificacaoDaObra, Status, DataDeInicio, DataDeEntrega, Orcamento, EngResponsavel, DescricaoDaObra, Imagens)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (nome_da_obra, regiao_id, classificacao_id, status_id, data_inicio_obj, data_termino_obj, orcamento_utilizado, engenheiro_responsavel, descricao, imagens))

            db.commit()
            cursor.close()
            db.close()

            return jsonify({'success': True, 'message': 'Obras anexadas com sucesso!'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/download-modelo-excel')
def download_modelo():
    caminho_arquivo = os.path.join(app.root_path, 'FRONT', 'arquivos', 'PlanilhaExemplo.xlsx')
    if os.path.exists(caminho_arquivo):
        return send_file(caminho_arquivo, as_attachment=True, download_name='ModeloCadastroObras.xlsx')
    else:
        return "Arquivo não encontrado", 404

@app.route('/obras/verificar-cadastro', methods=['GET'])
def verificar_cadastro_obra():
    nome = request.args.get('nome')
    data_inicio = request.args.get('dataInicio')
    print(f"\n--- /obras/verificar-cadastro (GET) --- Nome: {nome}, Data Início: {data_inicio}")
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM obras WHERE NomeDaObra = %s AND DataDeInicio = %s", (nome, data_inicio))
        obra = cursor.fetchone()
        cursor.close()
        conn.close()
        if obra:
            print("Obra encontrada para verificação.")
            return jsonify({'obraExiste': True})
        else:
            print("Obra não encontrada para verificação.")
            return jsonify({'obraExiste': False})
    except Exception as e:
        print(f"Erro ao verificar cadastro da obra: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

#  Iniciar servidor
if __name__ == '__main__':
    app.run(port=5500, debug=True)