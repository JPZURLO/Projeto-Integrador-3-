let obras = [];

function carregarObras() {
    fetch('http://localhost:5500/obras-editar')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data.obras)) {
                obras = data.obras.map(obra => {
                    // Verifica se obra.Imagens é uma string JSON válida antes de converter
                    const imagens = obra.Imagens ? JSON.parse(obra.Imagens) : [];
                    const imagensUrls = imagens.map(imagem => `http://localhost:5500${imagem}`);
                    return { id: obra.Id, imgs: imagensUrls };
                });
                atualizarExibicao();
            } else {
                console.error('Erro: "obras" não é um array ou não foi encontrado.');
            }
        })
        .catch(error => console.error('Erro ao carregar obras recentes:', error));
}

function atualizarExibicao() {
    let container = document.getElementById("obras-container");
    container.innerHTML = "";

    obras.forEach(obra => {
        const obraId = obra.id;
        const botaoEditar = document.createElement("button");
        botaoEditar.classList.add("editar-obra");
        botaoEditar.id = `editar-obra-${obraId}`;
        botaoEditar.textContent = "Editar";

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

        // Criando identificador visual
        const obraIdLabel = document.createElement("span");
        obraIdLabel.style.position = "absolute";
        obraIdLabel.style.top = "10px";
        obraIdLabel.style.left = "10px";
        obraIdLabel.style.color = "white";
        obraIdLabel.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        obraIdLabel.style.padding = "5px";
        obraIdLabel.textContent = obraId;

        obraDiv.appendChild(carouselContainer);
        obraDiv.appendChild(obraIdLabel);
        obraDiv.appendChild(botaoEditar);
        container.appendChild(obraDiv);

        // Inicia o carrossel apenas se houver mais de uma imagem
        if (obra.imgs.length > 1) {
            iniciarCarrossel(carouselContainer, obra.imgs);
        }
    });
}

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
        const obraId = event.target.id.split("-")[2];
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
