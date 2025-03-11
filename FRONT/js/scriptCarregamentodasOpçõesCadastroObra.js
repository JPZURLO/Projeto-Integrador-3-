document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("http://localhost:5500/cadastrar-obra");
        const data = await response.json();

        // Preencher opções da Região
        const regiaoSelect = document.getElementById("regiao");
        data.regioes.forEach(regiao => {
            let option = document.createElement("option");
            option.value = regiao.id;
            option.textContent = regiao.Nome_Regiao;
            regiaoSelect.appendChild(option);
        });

        // Preencher opções da Classificação da Obra
        const classificacaoSelect = document.getElementById("classificacao");
        data.classificacoes.forEach(classificacao => {
            let option = document.createElement("option");
            option.value = classificacao.id;
            option.textContent = classificacao.TipoDeObra;
            classificacaoSelect.appendChild(option);
        });

        // Preencher opções do Status da Obra
        const statusSelect = document.getElementById("status");
        if (!data.status || !Array.isArray(data.status)) {
            throw new Error("A propriedade 'status' está ausente ou não é um array.");
        }

        const uniqueStatus = new Map();  // Para garantir que os status são únicos

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


