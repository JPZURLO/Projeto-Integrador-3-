document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Carregar os filtros do banco de dados (dados fictícios, substitua com a chamada real para o backend)
        const response = await fetch("http://localhost:5500/cadastrar-obra");
        const data = await response.json();

        // Preencher opções dinamicamente
        const regiaoSelect = document.getElementById("regiao");
        data.regioes.forEach(regiao => {
            let option = document.createElement("option");
            option.value = regiao.id;
            option.textContent = regiao.Nome_Regiao;
            regiaoSelect.appendChild(option);
        });

        const classificacaoSelect = document.getElementById("classificacao-obra");
        data.classificacoes.forEach(classificacao => {
            let option = document.createElement("option");
            option.value = classificacao.id;
            option.textContent = classificacao.TipoDeObra;
            classificacaoSelect.appendChild(option);
        });

        const statusSelect = document.getElementById("status-obra");
        statusSelect.innerHTML = "";
        const uniqueStatus = new Map();
        data.status.forEach(status => {
            if (!uniqueStatus.has(status.Classificacao)) {
                uniqueStatus.set(status.Classificacao, status.id);
                let option = document.createElement("option");
                option.value = status.id;
                option.textContent = status.Classificacao;
                statusSelect.appendChild(option);
            }
        });

    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
    }
});

