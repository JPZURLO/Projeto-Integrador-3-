let obras = [];
let index = 0;

function carregarObras() {
    fetch('http://localhost:5500/obras-editar')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data.obras)) {
                obras = data.obras.map(obra => {
                    console.log('Imagens da obra:', obra.Imagens);
                    
                    const imagens = Array.isArray(obra.Imagens) ? obra.Imagens : [obra.Imagens];

                    const imagensUrls = imagens.map(imagem => {
                        const imgUrl = `http://localhost:5500${imagem.replace(/["\[\]]/g, '')}`;
                        console.log('URL da Imagem:', imgUrl);
                        return imgUrl;
                    });

                    return {
                        id: obra.id, // Adiciona o ID da obra para redirecionamento
                        imgs: imagensUrls
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
    let container = document.getElementById("obras-container");
    container.innerHTML = "";

    for (let i = index; i < index + 3 && i < obras.length; i++) {
        let obraDiv = document.createElement("div");
        obraDiv.classList.add("obra");

        let imagensHTML = obras[i].imgs.map(imgSrc => {
            return `<img src="${imgSrc}" alt="Imagem da Obra" onError="this.onerror=null;this.src='http://localhost:5500/default_image.png';">`;
        }).join("");

        // Adiciona o botão de editar sobre a imagem
        let botaoEditar = `<span class="editar-obra" onclick="redirecionarParaEdicao(${obras[i].id})">Editar</span>`;

        obraDiv.innerHTML = botaoEditar + imagensHTML;
        container.appendChild(obraDiv);
    }
}

function redirecionarParaEdicao(obraId) {
    window.location.href = `EdiçãoDeObras.html?id=${obraId}`;
}

document.addEventListener('DOMContentLoaded', function () {
    carregarObras();
});
