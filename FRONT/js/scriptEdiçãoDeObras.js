const urlParams = new URLSearchParams(window.location.search);
const obraId = urlParams.get('id'); // Corrigido para 'id'
console.log(obraId);

let obraSelecionada = null;

document.addEventListener('DOMContentLoaded', function () {
    if (obraId) {
        buscarObraPorId(obraId);
    }
});

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
    const orcamentoField = document.getElementById('Orçamento');
    const engenheiroField = document.getElementById('engenheiro');
    const statusField = document.getElementById('status');
    const descricaoField = document.getElementById('descricao');

    if (idField) idField.value = obraSelecionada.Id;
    if (nameField) nameField.value = obraSelecionada.NomeDaObra;
    if (regiaoField) regiaoField.value = obraSelecionada.Regiao;
    if (classificacaoField) classificacaoField.value = obraSelecionada.ClassificacaoDaObra;
    if (dataInicioField) dataInicioField.valueAsDate = new Date(obraSelecionada.DataDeInicio);
    if (dataTerminoField) dataTerminoField.valueAsDate = new Date(obraSelecionada.DataDeEntrega);
    if (orcamentoField) orcamentoField.value = formatarOrcamento(parseFloat(obraSelecionada.Orçamento));
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
    }
    return valor;
}

// Função para exibir as imagens
function exibirImagensExistentes(imagens) {
    const imagensExistentesDiv = document.getElementById('imagens-existentes');
    imagensExistentesDiv.innerHTML = ''; // Limpa o conteúdo antes de adicionar imagens

    if (imagens && imagens.length > 0) {
        try {
            // Certifique-se de que imagens é uma string JSON e depois converta para um array
            const imagensUrls = Array.isArray(imagens) ? imagens : JSON.parse(imagens);

            imagensUrls.forEach(imagem => {
                const img = document.createElement('img');
                img.src = `http://localhost:5500${imagem}`;  // Corrigido o caminho da imagem
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

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formCadastroObra');
    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Evita o envio automático do formulário

            // Crie o FormData para pegar os dados do formulário, incluindo imagens
            const formData = new FormData(form);

            // Adicione o ID da obra para garantir que estamos editando a obra correta
            formData.append('id', obraId);

            // Verifique se há imagens sendo enviadas
            const imagemInput = document.getElementById('imagem');
            if (imagemInput && imagemInput.files.length > 0) {
                for (const file of imagemInput.files) {
                    formData.append('imagem', file);
                }
            }

            // Envie os dados modificados para o backend
            try {
                const response = await fetch(`http://localhost:5500/obras/${obraId}`, {
                    method: 'PUT', // Método de atualização (PUT)
                    body: formData,
                });

                if (response.ok) {
                    alert('Obra atualizada com sucesso!');
                    window.location.href = 'consultar.html'; // Redireciona após salvar
                } else {
                    alert('Erro ao salvar a obra');
                }
            } catch (error) {
                console.error('Erro ao enviar os dados para o servidor:', error);
                alert('Erro ao tentar atualizar a obra');
            }
        });
    }
});
