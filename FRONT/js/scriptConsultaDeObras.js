const urlParams = new URLSearchParams(window.location.search);
const obraId = urlParams.get('id');
console.log(obraId);

let obraSelecionada = null;

document.addEventListener('DOMContentLoaded', function () {
    if (obraId) {
        buscarObraPorId(obraId);
    }
    preencherOpcoesDeStatus();

    document.getElementById('voltar-consulta').addEventListener('click', function() {
        window.location.href = 'Modalconsultar.html';
    });
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

            const uniqueStatus = new Map();

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
    imagensExistentesDiv.innerHTML = '';

    if (imagens && imagens.length > 0) {
        try {
            const imagensUrls = Array.isArray(imagens) ? imagens : (imagens ? JSON.parse(imagens) : []);

            imagensUrls.forEach((imagem, index) => {
                const img = document.createElement('img');
                img.src = `http://localhost:5500${imagem}`;
                img.alt = 'Imagem da Obra';
                img.style.maxWidth = '100px';
                img.style.marginRight = '10px';
                img.style.cursor = 'pointer';

                img.addEventListener('click', () => abrirModal(index));

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

let imagensUrls = [];
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