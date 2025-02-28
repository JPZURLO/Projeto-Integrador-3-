document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formCadastroObra');

    if (!form) {
        console.error("Erro: Formulário com ID 'formCadastroObra' não encontrado!");
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Criar um FormData para enviar arquivos e dados
        let formData = new FormData(form); // Captura automaticamente os campos do formulário

        // Adicionando a imagem ao FormData
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
            let response = await fetch('http://localhost:5500/adicionar-obra', {
                method: 'POST',
                body: formData // Enviar o FormData diretamente
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            let data = await response.json();
            console.log('Resposta:', data);
            
            if (data.success) {
                alert('Obra cadastrada com sucesso!');
                form.reset(); // Limpa o formulário após o envio
            } else {
                alert('Erro ao cadastrar obra: ' + (data.error || 'Erro desconhecido.'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar a obra. Verifique a conexão com o servidor.');
        }
    });
     // Validação da data
    form.addEventListener('submit', function(event) {
        const dataInicio = new Date(document.getElementById('DataDeInicio').value);
        const dataTermino = new Date(document.getElementById('DataDeEntrega').value);

        if (dataTermino < dataInicio) {
            alert('A data de término não pode ser anterior à data de início.');
            event.preventDefault(); // Impede o envio do formulário
        }
    });
});


