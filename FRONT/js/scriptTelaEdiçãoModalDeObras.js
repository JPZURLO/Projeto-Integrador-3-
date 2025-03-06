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

                    // Modifique para acessar obra.Id com "I" maiúsculo
                    return {
                        id: obra.Id, // Corrigido
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

    for (let i = 0; i < obras.length; i++) {
        console.log(obras[i]);
        console.log(obras[i].id);
        const obraId = obras[i].id;
        const botaoEditar = `<button class="editar-obra" id="editar-obra-${obraId}">Editar</button>`;

        const obraDiv = document.createElement("div");
        obraDiv.classList.add("obra-container");
        obraDiv.innerHTML = `
            <img src="${obras[i].imgs[0]}" alt="Imagem da Obra" data-obra-id="${obraId}" onError="this.onerror=null;this.src='http://localhost:5500/default_image.png';">
            <span style="position: absolute; top: 10px; left: 10px; color: white; background-color: rgba(0, 0, 0, 0.5); padding: 5px;">${obraId}</span>
            ${botaoEditar}
        `;
        container.appendChild(obraDiv);
    }
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('editar-obra')) {
        const obraId = event.target.id.split('-')[2];
        if (obraId) {
            redirecionarParaEdicao(obraId);
        }
    }
});

function redirecionarParaEdicao(obraId) {
    window.location.href = `http://127.0.0.1:5501/FRONT/html/telaEdicaoDeObras.html?id=${obraId}`;
}

document.addEventListener('DOMContentLoaded', function () {
    carregarObras();
});