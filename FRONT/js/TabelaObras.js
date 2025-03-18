async function carregarDados() {
    try {
        const response = await fetch('http://localhost:5500/obras-dados');
        const data = await response.json();

        document.getElementById('total-obras').textContent = data.totalObras;

        const obrasPorTipo = data.obrasPorTipo.reduce((acc, obra) => {
            acc[obra.TipoDeObra] = obra.quantidade;
            return acc;
        }, {});

        document.getElementById('residencial-total').textContent = obrasPorTipo.Residencial || 0;
        document.getElementById('comercial-total').textContent = obrasPorTipo.Comercial || 0;
        document.getElementById('industrial-total').textContent = obrasPorTipo.Industrial || 0;

        const obrasPorRegiao = data.obrasPorRegiao.reduce((acc, regiao) => {
            acc[regiao.Nome_Regiao] = regiao.quantidade;
            return acc;
        }, {});

        const totalPorRegiaoTipo = data.totalPorRegiaoTipo;

        const preencherRegiao = (regiao, total, residencial, comercial, industrial) => {
            document.getElementById(regiao + '-total').textContent = total || 0;
            document.getElementById(regiao + '-residencial').textContent = residencial || 0;
            document.getElementById(regiao + '-comercial').textContent = comercial || 0;
            document.getElementById(regiao + '-industrial').textContent = industrial || 0;
        };

        totalPorRegiaoTipo.forEach(item => {
            const regiao = item.Nome_Regiao.toLowerCase().replace(' ', '-');
            const tipo = item.TipoDeObra;
            const quantidade = item.quantidade;

            if (tipo === 'Residencial') {
                preencherRegiao(regiao, obrasPorRegiao[item.Nome_Regiao], quantidade, null, null);
            } else if (tipo === 'Comercial') {
                preencherRegiao(regiao, obrasPorRegiao[item.Nome_Regiao], document.getElementById(regiao + '-residencial').textContent, quantidade, null);
            } else if (tipo === 'Industrial') {
                preencherRegiao(regiao, obrasPorRegiao[item.Nome_Regiao], document.getElementById(regiao + '-residencial').textContent, document.getElementById(regiao + '-comercial').textContent, quantidade);
            }
        });

        document.getElementById('residencial-total-regiao').textContent = obrasPorTipo.Residencial || 0;
        document.getElementById('comercial-total-regiao').textContent = obrasPorTipo.Comercial || 0;
        document.getElementById('industrial-total-regiao').textContent = obrasPorTipo.Industrial || 0;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

document.addEventListener('DOMContentLoaded', carregarDados);