document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formCadastroObra');
    const dataDeInicioInput = document.getElementById('data-inicio');
    const dataDeEntregaInput = document.getElementById('data-termino');
    const submitButton = form.querySelector('button[type="submit"]');
    const errorMessage = document.createElement('span');
    errorMessage.style.color = 'red';
    errorMessage.style.display = 'block';

    if (!form) {
        console.error("Erro: Formulário com ID 'formCadastroObra' não encontrado!");
        return;
    }

    const dataTerminoInput = document.getElementById('data-termino'); // Correção do ID aqui
    if (dataTerminoInput) {
        dataTerminoInput.insertAdjacentElement('afterend', errorMessage);
    } else {
        console.error("Erro: Campo de data final com ID 'DataDeEntrega' não encontrado!");
    }

    if (dataDeInicioInput) {
        dataDeInicioInput.addEventListener('input', function () {
            if (this.value) {
                dataTerminoInput.removeAttribute('disabled');
            } else {
                dataTerminoInput.setAttribute('disabled', '');
            }
        });
    } else {
        console.error("Erro: Campo de data inicial com ID 'DataDeInicio' não encontrado!");
    }

    if (dataTerminoInput) {
        dataTerminoInput.addEventListener('change', function () {
            validarDataFinal();
        });
    }

    function validarDataFinal() {
        const dataInicio = new Date(dataDeInicioInput.value);
        const dataTermino = new Date(dataDeEntregaInput.value);

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
            return;
        }

        orcamento = orcamento.replace(/\./g, '').replace(',', '.');
        if (isNaN(orcamento)) {
            alert('O valor do orçamento é inválido!');
            return;
        }

        const formData = new FormData(form); // Inicializa o FormData com o formulário
        formData.set('orcamento', orcamento); // Use set para substituir o valor do formulário pelo formatado

        const imagemInput = document.getElementById('imagem');
        if (!imagemInput) {
            console.error("Erro: Campo de imagem com ID 'imagem' não encontrado!");
            alert('Erro: Campo de imagem não encontrado no formulário.');
            return;
        }

        if (imagemInput.files.length > 0) {
            formData.append('Imagem', imagemInput.files[0]);
        } else {
            alert('Por favor, selecione uma imagem!');
            return;
        }

        try {
            console.log('Enviando requisição...');
            const response = await fetch('http://localhost:5500/adicionar-obra', {
                method: 'POST',
                body: formData
            });
            console.log('Resposta recebida (objeto Response):', response);
    
            if (!response.ok) {
                console.log('Erro na resposta HTTP:', response.status);
                const errorText = await response.text(); // Tenta obter o corpo da resposta de erro
                console.log('Corpo da resposta de erro:', errorText);
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }
    
            console.log('Tentando parsear JSON...');
            const data = await response.json();
            console.log('JSON parseado:', data);
    
            if (data.success) {
                console.log('Sucesso:', data);
                alert(`Obra cadastrada com sucesso! ID: ${data.obra_id}`);
                form.reset();
            } else {
                console.log('Erro no backend:', data);
                alert('Erro ao cadastrar obra.');
                console.log("Resposta de erro recebida:", data);
            }
    
        } catch (error) {
            console.error('Erro no bloco catch:', error);
            alert('Obra cadastrada com sucesso');
        } finally {
            console.log('Bloco finally executado (independentemente do resultado).');
        }
    });
    
});

// Mantenha apenas um bloco para o listener do anexar-excel
document.getElementById('anexar-excel').addEventListener('click', function() {
    const arquivoExcel = document.getElementById('arquivo-excel').files[0];
    if (!arquivoExcel) {
        alert('Por favor, selecione um arquivo Excel.');
        return;
    }

    const formData = new FormData();
    formData.append('arquivo', arquivoExcel);

    fetch('http://localhost:5500/obras-excel', {
        method: 'POST',
        body: formData
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

