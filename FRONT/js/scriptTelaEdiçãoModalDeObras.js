let obras = [];

document.addEventListener("DOMContentLoaded", function () {
    carregarObras();
    carregarOpcoesFiltros(); // Chama apenas uma vez
    adicionarEventListeners();
});

function carregarObras() {
    fetch('http://localhost:5500/obras-consultar')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data.obras)) {
                obras = data.obras.map(obra => {
                    const imagens = obra.Imagens ? JSON.parse(obra.Imagens) : [];
                    return {
                        id: obra.Id,
                        imgs: imagens.map(imagem => `http://localhost:5500${imagem}`),
                        Status: obra.Status,
                        Regiao: obra.Regiao,
                        ClassificacaoDaObra: obra.ClassificacaoDaObra,
                        NomeDaObra: obra.NomeDaObra,
                        EngResponsavel: obra.EngResponsavel
                    };
                });
                aplicarFiltros();
            } else {
                console.error('Erro: "obras" não é um array ou não foi encontrado.');
            }
        })
        .catch(error => console.error('Erro ao carregar obras:', error));
}

let opcoesStatusAdicionadas = new Set(); // Conjunto para rastrear opções de status adicionadas

function carregarOpcoesFiltros() {
    console.log("carregarOpcoesFiltros chamada");
    fetch('http://localhost:5500/cadastrar-obra')
        .then(response => response.json())
        .then(data => {
            console.log("Dados da API:", data);
            opcoesStatusAdicionadas.clear(); // Limpa o conjunto antes de preencher
            preencherSelect('regiao', data.regioes, 'id', 'Nome_Regiao');
            preencherSelect('classificacao-obra', data.classificacoes, 'id', 'TipoDeObra');
        })
        .catch(error => console.error('Erro ao carregar opções de filtros:', error));
}

function preencherSelect(selectId, dados, valorKey, textoKey) {
    const select = document.getElementById(selectId);
    if (!select) return;
    console.log(`Preenchendo select ${selectId} com dados:`, dados);
    select.innerHTML = '<option value="">Todos</option>';
    dados.forEach(item => {
        console.log("Adicionando item:", item);
        if (selectId === 'status-obra') {
            if (opcoesStatusAdicionadas.has(item[valorKey])) {
                console.log(`Opção de status ${item[valorKey]} já adicionada.`);
                return; // Ignora duplicatas
            }
            opcoesStatusAdicionadas.add(item[valorKey]);
        }
        const option = document.createElement('option');
        option.value = item[valorKey];
        option.textContent = item[textoKey];
        console.log("Opção criada:", option);
        select.appendChild(option);
    });
    console.log(`Select ${selectId} preenchido.`);
}

function adicionarEventListeners() {
    const elementos = [
        'status-obra',
        'regiao',
        'classificacao-obra',
        'nome-obra'
    ];
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('input', aplicarFiltros);
            elemento.addEventListener('change', aplicarFiltros);
        } else {
            console.warn(`Elemento ${id} não encontrado.`);
        }
    });
}

function aplicarFiltros() {
    const status = document.getElementById('status-obra').value;
    const regiao = document.getElementById('regiao').value;
    const classificacao = document.getElementById('classificacao-obra').value;
    const nomeObra = document.getElementById('nome-obra').value.toLowerCase();

    const obrasFiltradas = obras.filter(obra => {
        return (
            (!status || obra.Status === parseInt(status)) && // Converte para número
            (!regiao || obra.Regiao === parseInt(regiao)) && // Converte para número
            (!classificacao || obra.ClassificacaoDaObra === parseInt(classificacao)) && // Converte para número
            (!nomeObra || obra.NomeDaObra.toLowerCase().includes(nomeObra)) 
            
        );
    });
    atualizarExibicao(obrasFiltradas);
}

function atualizarExibicao(obrasParaExibir) {
    let container = document.getElementById("obras-container");
    if (!container) return;
    container.innerHTML = "";
    obrasParaExibir.forEach(obra => {
        const obraDiv = document.createElement("div");
        obraDiv.classList.add("obra-container");
        obraDiv.innerHTML = `
            <div class="carousel-container">
                <img src="${obra.imgs.length > 0 ? obra.imgs[0] : 'default.jpg'}" alt="Imagem da Obra">
            </div>
            <button class="consultar-obra" data-obra-id="${obra.id}">Consultar</button>
        `;
        container.appendChild(obraDiv);
    });
}

document.addEventListener("click", function(event) {
    if (event.target.classList.contains("consultar-obra")) {
        const obraId = event.target.getAttribute("data-obra-id");
        if (obraId) {
            window.location.href = `http://127.0.0.1:5501/FRONT/html/telaConsultaDeObras.html?id=${obraId}`;
        }
    }
});

function iniciarCarrossel(carouselContainer, imagensUrls) {
    let imagemAtual = 0;
    const imagemExibida = carouselContainer.querySelector("img");
    imagemExibida.src = imagensUrls[0];

    setInterval(() => {
        imagemAtual = (imagemAtual + 1) % imagensUrls.length;
        imagemExibida.src = imagensUrls[imagemAtual];
    }, 5000);
}

document.addEventListener("click", function(event) {
    if (event.target.classList.contains("editar-obra")) {
        const obraId = event.target.getAttribute("data-obra-id"); // Obtém o ID do atributo data
        if (obraId) {
            redirecionarParaEdicao(obraId);
        }
    }
});

function redirecionarParaEdicao(obraId) {
    window.location.href = `http://127.0.0.1:5501/FRONT/html/telaEdicaoDeObras.html?id=${obraId}`;
}

document.addEventListener("DOMContentLoaded", function () {
    carregarObras();
});