document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('formCadastroObra');
    const dataInicioInput = document.getElementById('data-inicio');
    const dataTerminoInput = document.getElementById('data-termino');
    const submitButton = form.querySelector('button[type="submit"]');
    const errorMessage = document.createElement('span');
    errorMessage.style.color = 'red';
    errorMessage.style.display = 'block';

    if (!form) {
        console.error("Erro: Formulário com ID 'formCadastroObra' não encontrado!");
        return;
    }

    if (dataTerminoInput) {
        dataTerminoInput.insertAdjacentElement('afterend', errorMessage);
    } else {
        console.error("Erro: Campo de data final com ID 'data-termino' não encontrado!");
    }

    if (dataInicioInput) {
        dataInicioInput.addEventListener('input', function () {
            if (this.value) {
                dataTerminoInput.removeAttribute('disabled');
            } else {
                dataTerminoInput.setAttribute('disabled', '');
            }
        });
    } else {
        console.error("Erro: Campo de data inicial com ID 'data-inicio' não encontrado!");
    }

    if (dataTerminoInput) {
        dataTerminoInput.addEventListener('change', function () {
            validarDataFinal();
        });
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Validação do campo de data final
        if (!validarDataFinal()) {
            return;
        }

        // Validação do campo de orçamento
        let orcamento = document.getElementById('Orcamento').value;
        if (!orcamento) {
            alert('O campo de orçamento é obrigatório!');
            return;  // Impede o envio do formulário se o campo estiver vazio
        }

        // Passo 1: Remover os pontos de milhar (.) 
        orcamento = orcamento.replace(/\./g, '');

        // Passo 2: Substituir a vírgula por ponto (para garantir o formato decimal correto)
        orcamento = orcamento.replace(',', '.');

        // Passo 3: Garantir que o valor seja um número válido
        if (isNaN(orcamento)) {
            alert('O valor do orçamento é inválido!');
            return;
        }

        // Agora orcamento está no formato correto para enviar para o backend
        const formData = new FormData(form);
        formData.append('orcamento', orcamento); // Certifique-se de adicionar o orcamento formatado


        // Coletar os dados do formulário
        const imagemInput = document.getElementById('imagem');

        // Validação das imagens
        if (imagemInput && imagemInput.files.length > 0) {
            for (const file of imagemInput.files) {
                formData.append('imagem', file);
            }
        } else {
            alert('Por favor, selecione pelo menos uma imagem!');
            return;
        }

        // Envio para o servidor
        try {
            const response = await fetch('http://localhost:5500/adicionar-obra', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Dados da resposta:', data);

            if (data.success) {
                alert('Obra cadastrada com sucesso!');
                if (data.redirect) {
                    console.log(`Redirecionando para ${data.redirect}`);
                    window.location.assign(data.redirect);  // Redirecionamento após sucesso
                }
            } else {
                alert('Erro ao cadastrar obra.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar a obra. Verifique a conexão com o servidor.');
        }
    });

    function validarDataFinal() {
        const dataInicio = new Date(dataInicioInput.value);
        const dataTermino = new Date(dataTerminoInput.value);

        if (dataTermino < dataInicio) {
            errorMessage.textContent = 'A data final não pode ser anterior à data inicial. Mude por favor.';
            submitButton.disabled = true;
            return false;
        } else {
            errorMessage.textContent = '';
            submitButton.disabled = false;
            return true;
        }
    }
});
