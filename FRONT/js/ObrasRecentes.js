let obras = [];
let index = 0;

function carregarObras() {
    fetch('http://localhost:5500/obras-recentes')
        .then(response => response.json())
        .then(data => {
            // Verifica se 'data.obras' é um array antes de tentar usar .map
            if (Array.isArray(data.obras)) {
                obras = data.obras.map(obra => {
                    console.log('Imagens da obra:', obra.Imagens); // Verificar o conteúdo de obra.Imagens
                    
                    // Certificar-se de que obra.Imagens é um array, se não, convertê-lo para array
                    const imagens = Array.isArray(obra.Imagens) ? obra.Imagens : [obra.Imagens];

                    // Concatenar corretamente a URL da imagem com a base
                    const imagensUrls = imagens.map(imagem => {
                        // Remove os caracteres extras e concatena corretamente
                        const imgUrl = `http://localhost:5500${imagem.replace(/["\[\]]/g, '')}`;
                        console.log('URL da Imagem:', imgUrl); // Debug para verificar a URL da imagem
                        return imgUrl;
                    });

                    return {
                        imgs: imagensUrls, // Armazenando as URLs de todas as imagens
                        desc: obra.DescricaoDaObra
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

    // Adiciona as obras no container
    for (let i = index; i < index + 3 && i < obras.length; i++) {
        let obraDiv = document.createElement("div");
        obraDiv.classList.add("obra");

        // Exibe todas as imagens da obra
        let imagensHTML = obras[i].imgs.map(imgSrc => {
            // Para cada imagem, cria um <img> e verifica se a URL está correta
            return `<img src="${imgSrc}" alt="Imagem da Obra" onError="this.onerror=null;this.src='http://localhost:5500/default_image.png';">`;
        }).join("");

        // Adiciona a descrição da obra
        obraDiv.innerHTML = `${imagensHTML}<p>${obras[i].desc}</p>`;
        container.appendChild(obraDiv);
    }

    // Habilita/desabilita os botões conforme o índice
    document.getElementById("prevBtn").disabled = index === 0;
    document.getElementById("nextBtn").disabled = index + 3 >= obras.length;
}

function mudarObras(direcao) {
    index += direcao * 3;
    // Evita que o índice ultrapasse os limites da lista de obras
    index = Math.max(0, Math.min(index, obras.length - 3));
    atualizarExibicao();
}

document.addEventListener('DOMContentLoaded', function () {
    carregarObras();
});
