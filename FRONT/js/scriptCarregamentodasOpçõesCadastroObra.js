document.addEventListener("DOMContentLoaded", async function () {
    try {
        console.log("Início do script DOMContentLoaded");
        const token = localStorage.getItem('token');
        console.log("Token obtido:", token);
        const response = await fetch("http://localhost:5500/cadastrar-obra", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("Resposta da requisição para /cadastrar-obra:", response);

        if (!response.ok) {
            if (response.status === 401) {
                console.error("Não autorizado. Redirecionando para login.");
                window.location.href = '/FRONT/html/login.html'; // Ajuste o caminho conforme necessário
                return;
            } else {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log("Dados recebidos de /cadastrar-obra:", data);

        // Preencher opções da Região
        const regiaoSelect = document.getElementById("regiao");
        console.log("Elemento regiaoSelect:", regiaoSelect);
        if (regiaoSelect) {
            if (data.regioes) { //Verifica se data.regioes existe
                console.log("data.regioes:", data.regioes);
                data.regioes.forEach(regiao => {
                    let option = document.createElement("option");
                    option.value = regiao.id;
                    option.textContent = regiao.Nome_Regiao;
                    regiaoSelect.appendChild(option);
                });
            } else {
                console.error("Erro: data.regioes é undefined ou nulo.");
            }
        }

        // Preencher opções da Classificação da Obra
        const classificacaoSelect = document.getElementById("classificacao");
        console.log("Elemento classificacaoSelect:", classificacaoSelect);
        if (classificacaoSelect) {
            if (data.classificacoes) { //Verifica se data.classificacoes existe
                console.log("data.classificacoes:", data.classificacoes);
                data.classificacoes.forEach(classificacao => {
                    let option = document.createElement("option");
                    option.value = classificacao.id;
                    option.textContent = classificacao.TipoDeObra;
                    classificacaoSelect.appendChild(option);
                });
            } else {
                console.error("Erro: data.classificacoes é undefined ou nulo.");
            }
        }

        // Preencher opções do Status da Obra
        const statusSelect = document.getElementById("status");
        console.log("Elemento statusSelect:", statusSelect);
        if (statusSelect) {
            statusSelect.innerHTML = "";
            const uniqueStatus = new Map();
            if (data.status) {  //Verifica se data.status existe
                console.log("data.status:", data.status);
                data.status.forEach(status => {
                    if (!uniqueStatus.has(status.Classificacao)) {
                        uniqueStatus.set(status.Classificacao, status.id);
                        let option = document.createElement("option");
                        option.value = status.id;
                        option.textContent = status.Classificacao;
                        statusSelect.appendChild(option);
                    }
                });
            } else {
                console.error("Erro: data.status é undefined ou nulo.");
            }
        }

        // Preencher opções dos Estados
        const estadoSelect = document.getElementById("estado");
        console.log("Elemento estadoSelect:", estadoSelect);
        if (estadoSelect) {
            if (data.estados) { //Verifica se data.estados existe
                console.log("data.estados:", data.estados);
                data.estados.forEach(estado => {
                    let option = document.createElement("option");
                    option.value = estado.id;
                    option.textContent = estado.nome;
                    estadoSelect.appendChild(option);
                });
            } else {
                console.error("Erro: data.estados é undefined ou nulo.");
            }

            // Inicialmente desabilita o campo de cidade
            const cidadeSelect = document.getElementById("cidade");
            console.log("Elemento cidadeSelect:", cidadeSelect);
            if (cidadeSelect) {
                cidadeSelect.disabled = true;
                cidadeSelect.innerHTML = '<option value="">Selecione o estado</option>';

                // Adicionar listener para carregar cidades ao mudar o estado
                estadoSelect.addEventListener('change', async function () {
                    console.log("Evento de change do estadoSelect disparado. Valor selecionado:", this.value);
                    const estadoId = this.value;
                    if (estadoId) {
                        cidadeSelect.disabled = false;
                        cidadeSelect.innerHTML = '<option value="">Carregando cidades...</option>';
                        try {
                            const responseCidades = await fetch(`http://localhost:5500/obter-cidades/${estadoId}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            console.log("Resposta da requisição para /obter-cidades/:estadoId", responseCidades)
                            if (!responseCidades.ok) {
                                throw new Error(`Erro ao carregar cidades: ${responseCidades.status}`);
                            }
                            const dataCidades = await responseCidades.json();
                            console.log("Dados recebidos de /obter-cidades/:estadoId", dataCidades)
                            cidadeSelect.innerHTML = '<option value="">Selecione a cidade</option>';
                            if (dataCidades.cidades) { //Verifica se dataCidades.cidades existe
                                dataCidades.cidades.forEach(cidade => {
                                    let optionCidade = document.createElement("option");
                                    optionCidade.value = cidade.id;
                                    optionCidade.textContent = cidade.nome;
                                    cidadeSelect.appendChild(optionCidade);
                                });
                            } else {
                                console.error("Erro: dataCidades.cidades é undefined ou nulo.");
                            }
                        } catch (error) {
                            console.error("Erro ao carregar cidades:", error);
                            cidadeSelect.innerHTML = '<option value="">Erro ao carregar cidades</option>';
                        }
                    } else {
                        cidadeSelect.disabled = true;
                        cidadeSelect.innerHTML = '<option value="">Selecione o estado</option>';
                    }
                });
            }
        }

    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
    }
});
