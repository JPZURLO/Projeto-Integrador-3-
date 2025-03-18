let obras = [];

function carregarObras() {
    fetch('http://localhost:5500/obras-consultar')
        .then(response => response.json())
        .then(data => {
            console.log('Dados das obras:', data); // Verifique a estrutura dos dados
            if (Array.isArray(data.obras)) {
                obras = data.obras.map(obra => {
                    const imagens = obra.Imagens ? JSON.parse(obra.Imagens) : [];
                    const imagensUrls = imagens.map(imagem => `http://localhost:5500${imagem}`);
                    return { 
                        id: obra.Id, 
                        imgs: imagensUrls,
                        Status: obra.Status, // Certifique-se de que essas propriedades existem
                        Regiao: obra.Regiao,
                        ClassificacaoDaObra: obra.ClassificacaoDaObra,
                        NomeDaObra: obra.NomeDaObra
                    };
                });
                atualizarExibicao();
            } else {
                console.error('Erro: "obras" não é um array ou não foi encontrado.');
            }
        })
        .catch(error => console.error('Erro ao carregar obras:', error));
}

function atualizarExibicao() {
    let container = document.getElementById("obras-container");
    container.innerHTML = "";

    obras.forEach(obra => {
        const obraId = obra.id;
        const botaoConsultar = document.createElement("button");
        botaoConsultar.classList.add("consultar-obra");
        botaoConsultar.id = `consultar-obra-${obraId}`;
        botaoConsultar.textContent = "Consultar";
        botaoConsultar.setAttribute("data-obra-id", obraId); // Armazena o ID em um atributo data

        const obraDiv = document.createElement("div");
        obraDiv.classList.add("obra-container");

        // Contêiner do carrossel
        const carouselContainer = document.createElement("div");
        carouselContainer.classList.add("carousel-container");

        // Imagem inicial
        const imagemExibida = document.createElement("img");
        imagemExibida.src = obra.imgs.length > 0 ? obra.imgs[0] : 'default.jpg';
        imagemExibida.alt = "Imagem da Obra";
        carouselContainer.appendChild(imagemExibida);

        obraDiv.appendChild(carouselContainer);
        obraDiv.appendChild(botaoConsultar);
        container.appendChild(obraDiv);

        // Inicia o carrossel apenas se houver mais de uma imagem
        if (obra.imgs.length > 1) {
            iniciarCarrossel(carouselContainer, obra.imgs);
        }
    });
}



document.addEventListener("click", function(event) {
    if (event.target.classList.contains("consultar-obra")) {
        const obraId = event.target.getAttribute("data-obra-id"); // Obtém o ID do atributo data
        if (obraId) {
            redirecionarParaConsulta(obraId);
        }
    }
});

function redirecionarParaConsulta(obraId) {
    window.location.href = `http://127.0.0.1:5501/FRONT/html/telaConsultaDeObras.html?id=${obraId}`; // Altere o caminho aqui
}



async function carregarFiltros() {
    try {
        const response = await fetch('http://localhost:3000/cadastrar-obra');
        const data = await response.json();
        
        const statusSelect = document.getElementById('status-filter');
        const regiaoSelect = document.getElementById('regiao-filter');
        const classificacaoSelect = document.getElementById('classificacao-filter');
        
        // Conjuntos para evitar duplicação de opções
        const statusIds = new Set();
        const regiaoIds = new Set();
        const classificacaoIds = new Set();
        
        statusSelect.innerHTML = '<option value="">Todos</option>';
        data.status.forEach(status => {
            if (!statusIds.has(status.id)) {
                const option = document.createElement('option');
                option.value = status.id;
                option.textContent = status.Classificacao;
                statusSelect.appendChild(option);
                statusIds.add(status.id);
            }
        });

        regiaoSelect.innerHTML = '<option value="">Todas</option>';
        data.regiao.forEach(regiao => {
            if (!regiaoIds.has(regiao.id)) {
                const option = document.createElement('option');
                option.value = regiao.id;
                option.textContent = regiao.Nome_Regiao;
                regiaoSelect.appendChild(option);
                regiaoIds.add(regiao.id);
            }
        });

        classificacaoSelect.innerHTML = '<option value="">Todas</option>';
        data.classificacao.forEach(classificacao => {
            if (!classificacaoIds.has(classificacao.id)) {
                const option = document.createElement('option');
                option.value = classificacao.id;
                option.textContent = classificacao.TipoDeObra;
                classificacaoSelect.appendChild(option);
                classificacaoIds.add(classificacao.id);
            }
        });
    } catch (error) {
        console.error('Erro ao carregar filtros:', error);
    }
}

function aplicarFiltros() {
    const status = document.getElementById('status-obra').value; // ID do status selecionado
    const regiao = document.getElementById('regiao').value; // ID da região selecionada
    const classificacao = document.getElementById('classificacao-obra').value; // ID da classificação selecionada
    const nomeObra = document.getElementById('nome-obra').value.toLowerCase();
    const engenheiro = document.getElementById('engenheiro-responsavel').value.toLowerCase();

    const obrasFiltradas = obras.filter(obra => {
        // Verifique se as propriedades existem antes de compará-las
        if (status && obra.Status && obra.Status !== status) return false; // Compara com o ID do status
        if (regiao && obra.Regiao && obra.Regiao !== regiao) return false; // Compara com o ID da região
        if (classificacao && obra.ClassificacaoDaObra && obra.ClassificacaoDaObra !== classificacao) return false; // Compara com o ID da classificação
        if (nomeObra && obra.NomeDaObra && !obra.NomeDaObra.toLowerCase().includes(nomeObra)) return false;
        if (engenheiro && obra.EngResponsavel && !obra.EngResponsavel.toLowerCase().includes(engenheiro)) return false;
        return true;
    });

    atualizarExibicao(obrasFiltradas);
}



// Adiciona os listeners de eventos para os filtros
document.getElementById('engenheiro-responsavel').addEventListener('input', aplicarFiltros);
document.getElementById('status-obra').addEventListener('change', aplicarFiltros);
document.getElementById('regiao').addEventListener('change', aplicarFiltros);
document.getElementById('classificacao-obra').addEventListener('change', aplicarFiltros);
document.getElementById('orcamento').addEventListener('input', aplicarFiltros);
document.getElementById('nome-obra').addEventListener('input', aplicarFiltros);

document.addEventListener("DOMContentLoaded", function () {
    carregarObras();
    carregarOpcoesFiltros(); // Chame apenas uma vez
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