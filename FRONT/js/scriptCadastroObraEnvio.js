document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formCadastroObra');
    const dataDeInicioInput = document.getElementById('data-inicio');
    const dataDeEntregaInput = document.getElementById('data-termino');
    const submitButton = form.querySelector('button[type="submit"]');
    const errorMessage = document.createElement('span');
    errorMessage.style.color = 'red';
    errorMessage.style.display = 'block';

    const estadoSelect = document.getElementById('estado');
    const cidadeSelect = document.getElementById('cidade');

    if (!form) {
        console.error("Erro: Formulário com ID 'formCadastroObra' não encontrado!");
        return;
    }

    const dataTerminoInput = document.getElementById('data-termino'); // Correção do ID aqui
    if (dataTerminoInput) {
        dataTerminoInput.insertAdjacentElement('afterend', errorMessage);
    } else {
        console.error("Erro: Campo de data final com ID 'DataDeEntrega' não encontrado!");
    }

    if (dataDeInicioInput) {
        dataDeInicioInput.addEventListener('input', function () {
            if (this.value) {
                dataTerminoInput.removeAttribute('disabled');
            } else {
                dataTerminoInput.setAttribute('disabled', '');
            }
        });
    } else {
        console.error("Erro: Campo de data inicial com ID 'DataDeInicio' não encontrado!");
    }

    if (dataTerminoInput) {
        dataTerminoInput.addEventListener('change', function () {
            validarDataFinal();
        });
    }

    function validarDataFinal() {
        const dataInicio = new Date(dataDeInicioInput.value);
        const dataTermino = new Date(dataDeEntregaInput.value);

        if (dataTermino < dataInicio) {
            errorMessage.textContent = 'A data final não pode ser anterior à data inicial. Mude por favor.';
            submitButton.disabled = true;
            return false;
        } else {
            errorMessage.textContent = '';
            submitButton.disabled = false;
            return true;
        }
    }

    function carregarCidades(estadoId) {
        cidadeSelect.innerHTML = '<option value="">Carregando cidades...</option>';
        cidadeSelect.disabled = true;

        fetch(`/obter-cidades/${estadoId}`)
            .then(response => response.json())
            .then(data => {
                cidadeSelect.innerHTML = '<option value="">Selecione a Cidade</option>';
                data.cidades.forEach(cidade => { // Acessa data.cidades
                    const option = document.createElement('option');
                    option.value = cidade.id;
                    option.textContent = cidade.nome;
                    cidadeSelect.appendChild(option);
                });
                cidadeSelect.disabled = false;
            })
            .catch(error => {
                console.error('Erro ao carregar cidades:', error);
                cidadeSelect.innerHTML = '<option value="">Erro ao carregar</option>';
            });
    }

    // Carrega os estados e preenche o select
    fetch('/cadastrar-obra') // Sua rota para obter os dados do formulário
        .then(response => response.json())
        .then(data => {
            if (data.estados) {
                estadoSelect.innerHTML = '<option value="">Selecione o Estado</option>';
                data.estados.forEach(estado => {
                    const option = document.createElement('option');
                    option.value = estado.id;
                    option.textContent = estado.nome;
                    estadoSelect.appendChild(option);
                });
            } else {
                console.error("Erro: Estados não encontrados na resposta do servidor.");
            }
            // Carrega outros selects (regiao, classificacao, status)
            if (data.regioes) {
                const regiaoSelect = document.getElementById('regiao');
                regiaoSelect.innerHTML = '<option value="">Selecione a Região</option>';
                data.regioes.forEach(regiao => {
                    const option = document.createElement('option');
                    option.value = regiao.id;
                    option.textContent = regiao.Nome_Regiao;
                    regiaoSelect.appendChild(option);
                });
            }
            if (data.classificacoes) {
                const classificacaoSelect = document.getElementById('classificacao');
                classificacaoSelect.innerHTML = '<option value="">Selecione a Classificação</option>';
                data.classificacoes.forEach(classificacao => {
                    const option = document.createElement('option');
                    option.value = classificacao.id;
                    option.textContent = classificacao.TipoDeObra;
                    classificacaoSelect.appendChild(option);
                });
            }
            if (data.status_obra) { // Use status_obra
                const statusSelect = document.getElementById('status');
                statusSelect.innerHTML = '<option value="">Selecione o Status</option>';
                data.status_obra.forEach(status => { // Use status_obra
                    const option = document.createElement('option');
                    option.value = status.id;
                    option.textContent = status.Classificacao;
                    statusSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Erro ao carregar opções do formulário:', error);
            alert('Erro ao carregar opções do formulário. Por favor, recarregue a página.');
        });

    estadoSelect.addEventListener('change', function () {
        const estadoId = this.value;
        if (estadoId) {
            carregarCidades(estadoId);
        } else {
            cidadeSelect.innerHTML = '<option value="">Selecione a Cidade</option>';
            cidadeSelect.disabled = true;
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Validação do campo de data final
        if (!validarDataFinal()) {
            return;
        }

        // Validação do campo de orçamento
        let orcamento = document.getElementById('Orcamento').value;
        if (!orcamento) {
            alert('O campo de orçamento é obrigatório!');
            return;
        }

        orcamento = orcamento.replace(/\./g, '').replace(',', '.');
        if (isNaN(orcamento)) {
            alert('O valor do orçamento é inválido!');
            return;
        }

        const formData = new FormData(form);
        formData.set('orcamento', orcamento);

        const imagemInput = document.getElementById('imagem');
        if (imagemInput && imagemInput.files.length > 0) {
             for (let i = 0; i < imagemInput.files.length; i++) {
                formData.append('imagem', imagemInput.files[i]);
             }
        } else {
            alert('Por favor, selecione pelo menos uma imagem!');
            return; // Impede o envio se não houver imagens
        }

        try {
            console.log('Enviando requisição...');
            const response = await fetch('http://localhost:5500/adicionar-obra', {
                method: 'POST',
                body: formData
            });
            console.log('Resposta recebida (objeto Response):', response);

            if (!response.ok) {
                console.log('Erro na resposta HTTP:', response.status);
                const errorText = await response.text();
                console.log('Corpo da resposta de erro:', errorText);
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            console.log('Tentando parsear JSON...');
            const data = await response.json();
            console.log('JSON parseado:', data);

            if (data.success) {
                console.log('Sucesso:', data);
                alert(`Obra cadastrada com sucesso!`);
                form.reset();
                 // Limpa os selects de estado e cidade após o envio bem-sucedido
                estadoSelect.value = '';
                cidadeSelect.value = '';
                cidadeSelect.disabled = true;
            } else {
                console.log('Erro no backend:', data);
                alert('Erro ao cadastrar obra: ' + data.error); // Exibe a mensagem de erro do backend
                console.log("Resposta de erro recebida:", data);
            }

        } catch (error) {
            console.error('Erro no bloco catch:', error);
            alert('Erro ao cadastrar obra: ' + error.message); // Exibe a mensagem de erro da requisição
        } finally {
            console.log('Bloco finally executado (independentemente do resultado).');
        }
    });

    // Mantenha apenas um bloco para o listener do anexar-excel
    document.getElementById('anexar-excel').addEventListener('click', function () {
        const arquivoExcel = document.getElementById('arquivo-excel').files[0];
        if (!arquivoExcel) {
            alert('Por favor, selecione um arquivo Excel.');
            return;
        }

        const formData = new FormData();
        formData.append('arquivo', arquivoExcel);

        fetch('http://localhost:5500/obras-excel', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Obras anexadas com sucesso!');
                } else {
                    alert(`Erro ao anexar obras: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Erro ao anexar obras:', error);
                alert(`Ocorreu um erro ao anexar obras: ${error.message}`);
            });
    });
});
