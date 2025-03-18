let obras = [];
let index = 0;

function carregarObras() {
    fetch('http://localhost:5500/obras-recentes')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data.obras)) {
                obras = data.obras.map(obra => {
                    console.log(obra.Imagens); // Verifique o conteúdo das imagens
                    const imagens = obra.Imagens ? JSON.parse(obra.Imagens) : [];
                    const imagensUrls = imagens.map(imagem => {
                        return `http://localhost:5500${imagem.replace(/["\[\]]/g, '')}`;
                    });
                    return {
                        imgs: imagensUrls,
                        desc: obra.DescricaoDaObra || 'Descrição não disponível'
                    };
                });
                atualizarExibicao();
            } else {
                console.error('Erro: "obras" não é um array ou não foi encontrado.');
            }
        })
        .catch(error => console.error('Erro ao carregar obras recentes:', error));
}

function atualizarExibicao() {
    let container = document.getElementById("obrasRecentes");
    container.innerHTML = "";

    for (let i = index; i < index + 3 && i < obras.length; i++) {
        let obraDiv = document.createElement("div");
        obraDiv.classList.add("obra");

        // Cria um container para o carrossel
        let carouselContainer = document.createElement("div");
        carouselContainer.classList.add("carousel-container");

        // Adiciona as imagens ao carrossel
        obras[i].imgs.forEach(imgSrc => {
            let img = document.createElement("img");
            img.src = imgSrc;
            img.alt = "Imagem da Obra";
            img.classList.add("imagem-carrossel");
            carouselContainer.appendChild(img);
        });

        // Adiciona a descrição da obra
        let descricao = document.createElement("p");
        descricao.textContent = obras[i].desc;

        obraDiv.appendChild(carouselContainer);
        obraDiv.appendChild(descricao);
        container.appendChild(obraDiv);

        // Inicia o carrossel para esta obra
        iniciarCarrossel(carouselContainer);
    }

    // Habilita/desabilita os botões conforme o índice
    document.getElementById("prevBtn").disabled = index === 0;
    document.getElementById("nextBtn").disabled = index + 3 >= obras.length;
}

function iniciarCarrossel(carouselContainer) {
    let imagens = carouselContainer.querySelectorAll(".imagem-carrossel");
    let indiceAtual = 0;

    // Exibe a primeira imagem
    imagens[indiceAtual].classList.add("imagem-ativa");

    setInterval(() => {
        // Remove a classe da imagem atual
        imagens[indiceAtual].classList.remove("imagem-ativa");

        // Atualiza o índice
        indiceAtual = (indiceAtual + 1) % imagens.length;

        // Adiciona a classe à próxima imagem
        imagens[indiceAtual].classList.add("imagem-ativa");
    }, 10000); // 5000 milissegundos = 5 segundos
}

document.addEventListener('DOMContentLoaded', function () {
    carregarObras();

    // Adiciona eventos aos botões de navegação
    document.getElementById("prevBtn").addEventListener("click", () => mudarObras(-1));
    document.getElementById("nextBtn").addEventListener("click", () => mudarObras(1));
});

function mudarObras(direcao) {
    index += direcao * 3;
    index = Math.max(0, Math.min(index, obras.length - 3));
    atualizarExibicao();
}