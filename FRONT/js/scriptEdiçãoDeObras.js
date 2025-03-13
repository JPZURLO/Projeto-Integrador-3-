const urlParams = new URLSearchParams(window.location.search);
const obraId = urlParams.get('id'); // Corrigido para 'id'
console.log(obraId);

let obraSelecionada = null;

document.addEventListener('DOMContentLoaded', function () {
    if (obraId) {
        buscarObraPorId(obraId);
    }
    
    preencherOpcoesDeStatus();
});


function preencherOpcoesDeStatus() {
    fetch('http://localhost:5500/status')
        .then(response => response.json())
        .then(statusOptions => {
            const statusSelect = document.getElementById('status');
            if (!statusSelect) {
                console.error('Elemento statusSelect não encontrado');
                return;
            }

            const uniqueStatus = new Map();  // Defina uniqueStatus aqui

            statusOptions.forEach(status => {
                if (!uniqueStatus.has(status.Classificacao)) {
                    uniqueStatus.set(status.Classificacao, status.id);
                    let option = document.createElement("option");
                    option.value = status.id;
                    option.textContent = status.Classificacao;
                    statusSelect.appendChild(option);
                }
            });
        })
        .catch(error => console.error('Erro ao carregar os dados:', error));
}

function buscarObraPorId(obraId) {
    fetch(`http://localhost:5500/obras/${obraId}`)
        .then(response => response.json())
        .then(data => {
            obraSelecionada = data;
            preencherFormulario();
        })
        .catch(error => console.error('Erro ao buscar dados da obra:', error));
}

function preencherFormulario() {
    if (!obraSelecionada) {
        console.error('Nenhuma obra selecionada');
        return;
    }

    console.log('Preenchendo formulário com:', obraSelecionada);

    const idField = document.getElementById('id');
    const nameField = document.getElementById('nome-da-obra');
    const regiaoField = document.getElementById('regiao');
    const classificacaoField = document.getElementById('classificacao');
    const dataInicioField = document.getElementById('data-inicio');
    const dataTerminoField = document.getElementById('data-termino');
    const orcamentoField = document.getElementById('Orcamento');
    const engenheiroField = document.getElementById('engenheiro');
    const statusField = document.getElementById('status');
    const descricaoField = document.getElementById('descricao');

    if (idField) idField.value = obraSelecionada.Id;
    if (nameField) nameField.value = obraSelecionada.NomeDaObra;
    if (regiaoField) regiaoField.value = obraSelecionada.Regiao;
    if (classificacaoField) classificacaoField.value = obraSelecionada.ClassificacaoDaObra;
    if (dataInicioField) dataInicioField.valueAsDate = new Date(obraSelecionada.DataDeInicio);
    if (dataTerminoField) dataTerminoField.valueAsDate = new Date(obraSelecionada.DataDeEntrega);
    if (orcamentoField) orcamentoField.value = formatarOrcamento(obraSelecionada.Orcamento);
    if (engenheiroField) engenheiroField.value = obraSelecionada.EngResponsavel;
    if (statusField) statusField.value = obraSelecionada.Status;
    if (descricaoField) descricaoField.value = obraSelecionada.DescricaoDaObra;

    // Exibindo as imagens existentes
    exibirImagensExistentes(obraSelecionada.Imagens);
}

function formatarOrcamento(valor) {
    if (typeof valor === 'number') {
        let valorFormatado = valor.toFixed(2).replace('.', ',');
        return valorFormatado.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    } else if (typeof valor === 'string' && !isNaN(parseFloat(valor))) {
        let valorNumerico = parseFloat(valor);
        let valorFormatado = valorNumerico.toFixed(2).replace('.', ',');
        return valorFormatado.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return valor;
}

function confirmarRemocao(imagem, index) {
    const confirmacao = confirm("Você tem certeza que quer remover a imagem?");
    if (confirmacao) {
        // Remover a imagem da visualização
        const imagensExistentesDiv = document.getElementById('imagens-existentes');
        imagensExistentesDiv.children[index].remove(); // Remove a imagem do DOM

        // Adiciona a imagem ao array de imagens a serem removidas
        imagensParaRemover.push(imagem);

        // Opcional: Exibir uma mensagem de confirmação
        alert("Imagem removida da visualização. Ela será removida do banco de dados ao salvar.");
    }
}

function criarBotaoRemover(imagem, index) {
    const deleteButton = document.createElement('div');
    deleteButton.textContent = 'Remover';
    deleteButton.style.position = 'absolute';
    deleteButton.style.top = '0';
    deleteButton.style.right = '0';
    deleteButton.style.backgroundColor = 'red'; // Cor de fundo
    deleteButton.style.color = 'white'; // Cor do texto
    deleteButton.style.padding = '5px 10px'; // Espaçamento interno
    deleteButton.style.borderRadius = '5px'; // Bordas arredondadas
    deleteButton.style.cursor = 'pointer'; // Cursor de ponteiro
    deleteButton.style.fontSize = '14px'; // Tamanho da fonte

    // Adiciona evento para remover imagem
    deleteButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Impede que o clique no botão abra o modal
        confirmarRemocao(imagem, index);
    });

    return deleteButton;
}


function exibirImagensExistentes(imagens) {
    const imagensExistentesDiv = document.getElementById('imagens-existentes');
    imagensExistentesDiv.innerHTML = ''; // Limpa o conteúdo antes de adicionar imagens

    if (imagens && imagens.length > 0) {
        try {
            const imagensUrls = Array.isArray(imagens) ? imagens : (imagens ? JSON.parse(imagens) : []);

            imagensUrls.forEach((imagem, index) => {
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.display = 'inline-block';
                container.style.marginRight = '10px';

                const img = document.createElement('img');
                img.src = `http://localhost:5500${imagem}`;
                img.alt = 'Imagem da Obra';
                img.style.maxWidth = '100px';
                img.style.cursor = 'pointer';

                // Adiciona evento para abrir modal
                img.addEventListener('click', () => abrirModal(index));

                // Adiciona o botão de remover
                const deleteButton = criarBotaoRemover(imagem, index);
                container.appendChild(img);
                container.appendChild(deleteButton);
                imagensExistentesDiv.appendChild(container);
            });
        } catch (e) {
            console.error('Erro ao processar imagens:', e);
            imagensExistentesDiv.textContent = 'Erro ao carregar imagens.';
        }
    } else {
        imagensExistentesDiv.textContent = 'Nenhuma imagem encontrada.';
    }
}

let imagensParaRemover = [];

function confirmarRemocao(imagem, index) {
    const confirmacao = confirm("Você tem certeza que quer remover a imagem?");
    if (confirmacao) {
        // Remover a imagem da visualização
        const imagensExistentesDiv = document.getElementById('imagens-existentes');
        imagensExistentesDiv.children[index].remove(); // Remove a imagem do DOM

        // Adiciona a imagem ao array de imagens a serem removidas
        imagensParaRemover.push(imagem);

        // Opcional: Exibir uma mensagem de confirmação
        alert("Imagem removida da visualização. Ela será removida do banco de dados ao salvar.");
    }
}

let imagensUrls = []; // Armazena as URLs das imagens
let imagemAtual = 0;

function abrirModal(index) {
    imagensUrls = Array.from(document.querySelectorAll('#imagens-existentes img')).map(img => img.src);
    imagemAtual = index;
    document.getElementById('imagem-modal').src = imagensUrls[imagemAtual];
    document.getElementById('modal').style.display = 'block';

    document.getElementById('fechar-modal').onclick = function() {
        document.getElementById('modal').style.display = 'none';
    };

    document.getElementById('anterior').onclick = function() {
        imagemAtual = (imagemAtual > 0) ? imagemAtual - 1 : imagensUrls.length - 1;
        document.getElementById('imagem-modal').src = imagensUrls[imagemAtual];
    };

    document.getElementById('proximo').onclick = function() {
        imagemAtual = (imagemAtual < imagensUrls.length - 1) ? imagemAtual + 1 : 0;
        document.getElementById('imagem-modal').src = imagensUrls[imagemAtual];
    };
}

async function atualizarObra(obraId) {
    const formData = new FormData();

    // Adiciona os outros campos do formulário
    formData.append("NomeDaObra", document.getElementById("nome-da-obra").value);
    formData.append("DescricaoDaObra", document.getElementById("descricao").value);
    formData.append("DataDeInicio", document.getElementById("data-inicio").value);
    formData.append("DataDeEntrega", document.getElementById("data-termino").value);
    formData.append("Orcamento", parseFloat(document.getElementById("Orcamento").value.replace('.', '').replace(',', '.')));
    formData.append("EngResponsavel", document.getElementById("engenheiro").value);
    formData.append("Regiao", parseInt(document.getElementById("regiao").value));
    formData.append("Status", parseInt(document.getElementById("status").value));
    formData.append("ClassificacaoDaObra", parseInt(document.getElementById("classificacao").value));

    // Adiciona as imagens existentes como um campo JSON
    const imagensExistentes = obraSelecionada.Imagens || [];
    formData.append("Imagens", JSON.stringify(imagensExistentes)); // Certifique-se de que as imagens existentes estão em formato JSON

    // Adiciona as novas imagens como arquivos
    const novasImagensInput = document.getElementById("imagem");
    for (let i = 0; i < novasImagensInput.files.length; i++) {
        formData.append("novasImagens", novasImagensInput.files[i]);
    }

    // Adiciona as imagens a serem removidas
    formData.append("imagensParaRemover", JSON.stringify(imagensParaRemover));

    console.log("Dados preparados para envio:", formData);

    try {
        const response = await fetch(`http://localhost:5500/obras/${obraId}`, {
            method: 'PUT',
            body: formData
        });

        console.log("Resposta do servidor:", response.status, response.statusText);

        if (response.ok) {
            const responseData = await response.json();
            console.log('Resposta JSON do servidor:', responseData);
            alert('Obra atualizada com sucesso!');
            window.location.href = 'tela_pos_login.html';
        } else {
            const responseText = await response.text();
            console.error('Erro ao salvar a obra:', responseText);
            alert('Erro ao salvar a obra: ' + responseText);
        }
    } catch (error) {
        console.error('Erro ao enviar os dados para o servidor:', error);
    }

    console.log("Dados preparados para envio:", formData);

    try {
        const response = await fetch(`http://localhost:5500/obras/${obraId}`, {
            method: 'PUT',
            body: formData
        });

        console.log("Resposta do servidor:", response.status, response.statusText);

        if (response.ok) {
            const responseData = await response.json();
            console.log('Resposta JSON do servidor:', responseData);
            alert('Obra atualizada com sucesso!');
            window.location.href = 'tela_pos_login.html';
        } else {
            const responseText = await response.text();
            console.error('Erro ao salvar a obra:', responseText);
            alert('Erro ao salvar a obra: ' + responseText);
        }
    } catch (error) {
        console.error('Erro ao enviar os dados para o servidor:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formCadastroObra');
    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Evita o envio automático do formulário
            atualizarObra(obraId);
        });
    }
});