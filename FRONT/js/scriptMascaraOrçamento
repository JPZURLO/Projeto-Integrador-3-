document.addEventListener('DOMContentLoaded', function () {
    const orcamentoInput = document.getElementById('Orçamento');

    if (orcamentoInput) {
        orcamentoInput.addEventListener('input', function () {
            let value = this.value;
            // Remover qualquer caracter não numérico (exceto ponto e vírgula)
            value = value.replace(/[^\d,]/g, '');
            
            // Substituir a vírgula por ponto para garantir o correto formato
            let parts = value.split(',');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Adicionando o ponto como separador de milhar
            this.value = parts.join(',');
        });
    }
});