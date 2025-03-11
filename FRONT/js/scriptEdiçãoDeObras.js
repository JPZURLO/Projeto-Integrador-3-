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
    if (orcamentoField) orcamentoField.value = formatarOrcamento(obraSelecionada.Orcamento);  // Certifique-se de que `obraSelecionada.Orcamento` é um número válido
    if (engenheiroField) engenheiroField.value = obraSelecionada.EngResponsavel;
    if (statusField) statusField.value = obraSelecionada.Status;
    if (descricaoField) descricaoField.value = obraSelecionada.DescricaoDaObra;

    // Exibindo as imagens
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

function exibirImagensExistentes(imagens) {
    const imagensExistentesDiv = document.getElementById('imagens-existentes');
    imagensExistentesDiv.innerHTML = ''; // Limpa o conteúdo antes de adicionar imagens

    if (imagens && imagens.length > 0) {
        try {
            const imagensUrls = Array.isArray(imagens) ? imagens : (imagens ? JSON.parse(imagens) : []);

            imagensUrls.forEach(imagem => {
                const img = document.createElement('img');
                img.src = `http://localhost:5500${imagem}`;
                img.alt = 'Imagem da Obra';
                img.style.maxWidth = '100px';
                img.style.marginRight = '10px';
                imagensExistentesDiv.appendChild(img);
            });
        } catch (e) {
            console.error('Erro ao processar imagens:', e);
            imagensExistentesDiv.textContent = 'Erro ao carregar imagens.';
        }
    } else {
        imagensExistentesDiv.textContent = 'Nenhuma imagem encontrada.';
    }
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
    formData.append("Imagens", obraSelecionada.Imagens);

    // Adiciona as novas imagens como arquivos
    const novasImagensInput = document.getElementById("imagem");
    for (let i = 0; i < novasImagensInput.files.length; i++) {
        formData.append("novasImagens", novasImagensInput.files[i]);
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
            window.location.href = 'consultar.html';
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
        
            const dados = {
                NomeDaObra: document.getElementById("nome-da-obra").value,
                DescricaoDaObra: document.getElementById("descricao").value,
                DataDeInicio: document.getElementById("data-inicio").value,
                DataDeEntrega: document.getElementById("data-termino").value,
                ClassificacaoDaObra: parseInt(document.getElementById("classificacao").value), // Adicione este campo,
                Orcamento: parseFloat(document.getElementById("Orcamento").value.replace('.', '').replace(',', '.')),
                EngResponsavel: document.getElementById("engenheiro").value,
                Regiao: parseInt(document.getElementById("regiao").value),
                Status: parseInt(document.getElementById("status").value)
            };
        
            console.log("Dados enviados:", JSON.stringify(dados));
        
            try {
                const response = await fetch(`http://localhost:5500/obras/${obraId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                });
        
                if (response.ok) {
                    alert('Obra atualizada com sucesso!');
                    window.location.href = 'tela_pos_login.html'; // Redireciona após salvar
                } else {
                    alert('Erro ao salvar a obra');
                }
            } catch (error) {
                console.error('Erro ao enviar os dados para o servidor:', error);
            }
        });
    }
});
