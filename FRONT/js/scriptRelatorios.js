let obras = [];
let obrasExibidas = [];
let paginaAtual = 1;
const obrasPorPagina = 20; // Declara a variável no escopo global

// Adiciona um listener para o evento de clique no botão 'extrair-relatorio'
const botaoExtrairRelatorio = document.getElementById('extrair-relatorio');
if (botaoExtrairRelatorio) {
    botaoExtrairRelatorio.addEventListener('click', function() {
        const dataInicial = document.getElementById('data-inicial').value;
        const dataFinal = document.getElementById('data-final').value;
        const formato = document.getElementById('formato-relatorio').value;

        // Validação das datas
        if (!dataInicial || !dataFinal || new Date(dataInicial) > new Date(dataFinal)) {
            alert('Por favor, insira datas válidas.');
            return;
        }

        // Buscar as obras do servidor com filtro por data
        fetch(`http://localhost:5500/obras-consultar?dataInicial=${dataInicial}&dataFinal=${dataFinal}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro na requisição: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                obras = data.obras; // Armazena todas as obras
                exibirPagina(1); // Exibe a primeira página
                gerarPaginacao(); // Gera os botões de paginação

                if (formato === 'pdf') {
                    gerarRelatorioPDF(obras);
                } else if (formato === 'excel') {
                    gerarRelatorioExcel(obras);
                }
            })
            .catch(error => {
                console.error('Erro ao buscar as obras:', error);
                alert(`Ocorreu um erro ao buscar as obras: ${error.message}`);
            });
    });
} else {
    console.error("Elemento com ID 'extrair-relatorio' não encontrado!");
}

function exibirPagina(pagina) {
    paginaAtual = pagina;
    const inicio = (pagina - 1) * obrasPorPagina;
    const fim = inicio + obrasPorPagina;
    obrasExibidas = obras.slice(inicio, fim);
    exibirListaObras(obrasExibidas);
    gerarPaginacao();
}

function gerarPaginacao() {
    const totalPaginas = Math.ceil(obras.length / obrasPorPagina);
    const paginacaoDiv = document.getElementById('paginacao');
    if (paginacaoDiv) {
        paginacaoDiv.innerHTML = '';

        if (totalPaginas <= 1) return;

        const botaoAnterior = document.createElement('button');
        botaoAnterior.textContent = '<';
        botaoAnterior.disabled = paginaAtual === 1;
        botaoAnterior.addEventListener('click', () => exibirPagina(paginaAtual - 1));
        paginacaoDiv.appendChild(botaoAnterior);

        for (let i = 1; i <= totalPaginas; i++) {
            const botaoPagina = document.createElement('button');
            botaoPagina.textContent = i;
            botaoPagina.disabled = paginaAtual === i;
            botaoPagina.addEventListener('click', () => exibirPagina(i));
            paginacaoDiv.appendChild(botaoPagina);
        }

        const botaoProximo = document.createElement('button');
        botaoProximo.textContent = '>';
        botaoProximo.disabled = paginaAtual === totalPaginas;
        botaoProximo.addEventListener('click', () => exibirPagina(paginaAtual + 1));
        paginacaoDiv.appendChild(botaoProximo);
    } else {
        console.error("Elemento com ID 'paginacao' não encontrado!");
    }
}

// Suas funções gerarRelatorioPDF e gerarRelatorioExcel permanecem aqui

function gerarRelatorioPDF(obras) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text('Relatório de Obras', 10, 10);
    let y = 20;
    let obrasPorPaginaPDF = 2; // Exibe 2 obras por página no PDF
    let obrasProcessadas = 0;

    obras.forEach((obra, index) => {
        doc.text(`Obra ${index + 1}:`, 10, y);
        y += 10;
        doc.text(`Nome: ${obra.NomeDaObra}`, 20, y);
        y += 10;
        doc.text(`Região: ${obra.Regiao}`, 20, y);
        y += 10;
        doc.text(`Classificação: ${obra.ClassificacaoDaObra}`, 20, y);
        y += 10;
        doc.text(`Data de Início: ${obra.DataDeInicio}`, 20, y);
        y += 10;
        doc.text(`Data de Entrega: ${obra.DataDeEntrega}`, 20, y);
        y += 10;
        doc.text(`Orçamento: ${obra.Orcamento}`, 20, y);
        y += 10;
        doc.text(`Engenheiro Responsável: ${obra.EngResponsavel}`, 20, y);
        y += 10;
        doc.text(`Descrição: ${obra.DescricaoDaObra}`, 20, y);
        y += 10;
        doc.text(`Status: ${obra.Status}`, 20, y);
        y += 15;

        obrasProcessadas++;

        if (obrasProcessadas % obrasPorPaginaPDF === 0 && index < obras.length - 1) { // Verifica se processou 2 obras e se não é a última
            doc.addPage();
            y = 20;
        }
    });

    const pdfOutput = doc.output('bloburl');
    window.open(pdfOutput, '_blank');
}

function gerarRelatorioExcel(obras) {
    const ws = XLSX.utils.json_to_sheet(obras);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Obras');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio_obras.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function exibirListaObras(obras) {
    const listaObrasDiv = document.getElementById('lista-obras');
    if (listaObrasDiv) {
        listaObrasDiv.innerHTML = '<h2>Lista de Obras</h2>';

        const tabela = document.createElement('table');
        tabela.style.borderCollapse = 'collapse';
        tabela.style.width = '100%';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Nome', 'Região', 'Classificação', 'Início', 'Entrega', 'Orçamento', 'Engenheiro', 'Descrição', 'Status'];

        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.border = '1px solid black';
            th.style.padding = '8px';
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        tabela.appendChild(thead);

        const tbody = document.createElement('tbody');
        obras.forEach(obra => {
            const linha = document.createElement('tr');
            const dados = [
                obra.NomeDaObra,
                obra.Regiao,
                obra.ClassificacaoDaObra,
                obra.DataDeInicio,
                obra.DataDeEntrega,
                obra.Orcamento,
                obra.EngResponsavel,
                obra.DescricaoDaObra,
                obra.Status
            ];

            dados.forEach(dado => {
                const td = document.createElement('td');
                td.textContent = dado;
                td.style.border = '1px solid black';
                td.style.padding = '8px';
                linha.appendChild(td);
            });

            tbody.appendChild(linha);
        });

        tabela.appendChild(tbody);
        listaObrasDiv.appendChild(tabela);
    } else {
        console.error("Elemento com ID 'lista-obras' não encontrado!");
    }
}

const formRelatorio = document.getElementById('form-relatorio');
if (formRelatorio) {
    formRelatorio.addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o comportamento padrão de envio do formulário

        const dataInicial = document.getElementById('data-inicial').value;
        const dataFinal = document.getElementById('data-final').value;
        const formato = document.getElementById('formato-relatorio').value;

        if (!dataInicial || !dataFinal || new Date(dataInicial) > new Date(dataFinal)) {
            alert('Por favor, insira datas válidas.');
            return;
        }

        fetch(`http://localhost:5500/obras-consultar?dataInicial=${dataInicial}&dataFinal=${dataFinal}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro na requisição: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const obrasFiltradas = data.obras;

                if (obrasFiltradas.length === 0) {
                    alert('Nenhuma obra encontrada para o intervalo de datas selecionado.');
                    return;
                }

                if (formato === 'pdf') {
                    gerarRelatorioPDF(obrasFiltradas);
                } else if (formato === 'excel') {
                    gerarRelatorioExcel(obrasFiltradas);
                }

                exibirListaObras(obrasFiltradas); // Exibir a lista de obras
            })
            .catch(error => {
                console.error('Erro ao buscar as obras:', error);
                alert(`Ocorreu um erro ao buscar as obras: ${error.message}`);
            });
    });
} else {
    console.error("Elemento com ID 'form-relatorio' não encontrado!");
}

const botaoAnexarExcel = document.getElementById('anexar-excel');
if (botaoAnexarExcel) {
    botaoAnexarExcel.addEventListener('click', function() {
        const arquivoExcel = document.getElementById('arquivo-excel').files[0];
        if (!arquivoExcel) {
            alert('Por favor, selecione um arquivo Excel.');
            return;
        }

        const formData = new FormData();
        formData.append('arquivo', arquivoExcel); // Envia o arquivo com o nome "arquivo"

        fetch('http://localhost:5500/obras-excel', {
            method: 'POST',
            body: formData // Envia o formData em vez de JSON
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Obras anexadas com sucesso!');
            } else {
                alert(`Erro ao anexar obras: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Erro ao anexar obras:', error);
            alert(`Ocorreu um erro ao anexar obras: ${error.message}`);
        });
    });
} else {
    console.error("Elemento com ID 'anexar-excel' não encontrado!");
}

function enviarObrasParaServidor(obrasExcel) {
    fetch('http://localhost:5500/obras-excel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ obras: obrasExcel })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Obras anexadas com sucesso!');
            // Atualizar a lista de obras
            carregarObras(); // Certifique-se de que esta função está definida em seu código
        } else {
            alert(`Erro ao anexar obras: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Erro ao anexar obras:', error);
        alert(`Ocorreu um erro ao anexar obras: ${error.message}`);
    });
}

// Assumindo que você tem uma função carregarObras definida em outro lugar
// function carregarObras() {
//     // Sua lógica para carregar as obras do servidor e exibir na tela
//     console.log("Função carregarObras chamada");
// }