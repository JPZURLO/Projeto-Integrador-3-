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
    if (obraSelecionada) {
        console.log(obraSelecionada);
        document.getElementById('id').value = obraSelecionada.Id;
        document.getElementById('nome-da-obra').value = obraSelecionada.NomeDaObra;
        document.getElementById('regiao').value = obraSelecionada.Regiao;
        document.getElementById('classificacao').value = obraSelecionada.ClassificacaoDaObra;

        // Converter strings de data para objetos Date
        document.getElementById('data-inicio').valueAsDate = new Date(obraSelecionada.DataDeInicio);
        document.getElementById('data-termino').valueAsDate = new Date(obraSelecionada.DataDeEntrega);

        // Converter string de orçamento para número e formatar
        const orcamento = parseFloat(obraSelecionada.Orçamento);
        document.getElementById('Orçamento').value = formatarOrcamento(orcamento);

        document.getElementById('engenheiro').value = obraSelecionada.EngResponsavel;
        document.getElementById('status').value = obraSelecionada.Status;
        document.getElementById('descricao').value = obraSelecionada.DescricaoDaObra;
        exibirImagensExistentes(obraSelecionada.Imagens);
    
    }
}

function exibirImagensExistentes(imagens) {
    const imagensExistentesDiv = document.getElementById('imagens-existentes');
    imagensExistentesDiv.innerHTML = '';

    if (imagens && imagens.length > 0) {
        // Converter a string JSON em um array de URLs
        const imagensUrls = JSON.parse(imagens);

        imagensUrls.forEach(imagem => {
            const img = document.createElement('img');
            img.src = `http://localhost:5500${imagem.replace(/["\[\]]/g, '')}`;
            console.log(img.src);
            img.alt = 'Imagem da Obra';
            img.style.maxWidth = '100px';
            img.style.marginRight = '10px';
            imagensExistentesDiv.appendChild(img);
        });
    } else {
        imagensExistentesDiv.textContent = 'Nenhuma imagem encontrada.';
    }
}

function formatarOrcamento(valor) {
    if (typeof valor === 'number') {
        let valorFormatado = valor.toFixed(2).replace('.', ',');
        return valorFormatado.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return valor;
}