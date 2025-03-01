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

    // Validação da data final no evento change
    if (dataTerminoInput) {
        dataTerminoInput.addEventListener('change', function () {
            validarDataFinal();
        });
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Validação de datas
        if (!validarDataFinal()) {
            return; // Interrompe a submissão se a data final for inválida
        }

        // Manipulação de arquivos de imagem
        const formData = new FormData(form);
        const imagemInput = document.getElementById('imagem');

        if (imagemInput && imagemInput.files.length > 0) {
            for (const file of imagemInput.files) {
                formData.append('imagem', file);
            }
        } else {
            alert('Por favor, selecione pelo menos uma imagem!');
            return;
        }

        try {
            const response = await fetch('http://localhost:5500/adicionar-obra', {
                method: 'POST',
                body: formData
            });

            console.log('Resposta do servidor:', response); // Adiciona log da resposta

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();

            console.log('Dados da resposta:', data); // Adiciona log dos dados

            if (data.success) {
                alert('Obra cadastrada com sucesso!');
                form.reset();
                window.location.href = './tela_pos_login.html';
            } else {
                alert('Erro ao cadastrar obra: ' + (data.error || 'Erro desconhecido.'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar a obra. Verifique a conexão com o servidor.');
        }
    }); // Bloco da função submit fechado aqui

    function validarDataFinal() {
        const dataInicio = new Date(dataInicioInput.value);
        const dataTermino = new Date(dataTerminoInput.value);

        if (dataTermino < dataInicio) {
            errorMessage.textContent = 'A data final não pode ser anterior à data inicial. Mude por favor.';
            submitButton.disabled = true;
            return false; // Indica que a data final é inválida
        } else {
            errorMessage.textContent = '';
            submitButton.disabled = false;
            return true; // Indica que a data final é válida
        }
    }

    function carregarObrasRecentes() {
        fetch('http://localhost:5500/obras-recentes')
            .then(response => response.json())
            .then(data => {
                const obrasRecentesDiv = document.getElementById('obrasRecentes');
                obrasRecentesDiv.innerHTML = '';

                data.obras.forEach(obra => {
                    const obraDiv = document.createElement('div');
                    obraDiv.classList.add('obra-item');

                    const imagem = document.createElement('img');
                    imagem.alt = 'Imagem da obra';

                    fetch(`http://localhost:5500/imagem/${obra.id}`)
                        .then(response => response.json())
                        .then(data => {
                            imagem.src = `http://localhost:5500/${data.imagem}`;
                        })
                        .catch(error => console.error('Erro ao carregar imagem:', error));

                    const descricao = document.createElement('p');
                    descricao.textContent = obra.DescricaoDaObra;

                    obraDiv.appendChild(imagem);
                    obraDiv.appendChild(descricao);
                    obrasRecentesDiv.appendChild(obraDiv);
                });
            })
            .catch(error => console.error('Erro ao carregar obras recentes:', error));
    }

    carregarObrasRecentes();
});