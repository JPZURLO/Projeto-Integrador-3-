document.addEventListener('DOMContentLoaded', () => {
            const comentarioInput = document.getElementById('comentario-input');
            const comentarButton = document.getElementById('comentar-button');
            const comentariosLista = document.getElementById('comentarios-lista');
            const estrelaInputs = document.querySelectorAll('input[name="estrela"]');
            const nomeUsuarioSpan = document.getElementById('user-name'); // Span do nome do usuário
            let nomeUsuario = localStorage.getItem('nomeUsuario'); // Recupera o nome do localStorage
            let obraId = localStorage.getItem('obraId');

            nomeUsuarioSpan.textContent = nomeUsuario;

            let avaliacao = 0;

            estrelaInputs.forEach(input => {
                input.addEventListener('change', function () {
                    avaliacao = parseInt(this.value);
                    console.log(`Avaliação: ${avaliacao} estrelas`);
                });
            });

            comentarButton.addEventListener('click', () => {
                const comentarioText = comentarioInput.value;
                if (comentarioText.trim() !== "") {
                    // Aqui você enviaria o comentário e a avaliação para o servidor
                    console.log(`Comentário: ${comentarioText}, Avaliação: ${avaliacao}, ObraId: ${obraId}`);
                    salvarComentarioAvaliacao(obraId, nomeUsuario, comentarioText, avaliacao);

                    const novoComentario = document.createElement('div');
                    novoComentario.classList.add('comentario-item');
                    novoComentario.innerHTML = `<span class="usuario">${nomeUsuario}</span>
                                            <span class="data">${formatarData()}</span>
                                            <p>${comentarioText}</p>`;
                    comentariosLista.appendChild(novoComentario);
                    comentarioInput.value = '';
                    avaliacao = 0;
                    estrelaInputs.forEach(input => input.checked = false);
                } else {
                    alert('Por favor, digite um comentário antes de enviar.');
                }
            });

            function formatarData() {
                const data = new Date();
                const dia = String(data.getDate()).padStart(2, '0');
                const mes = String(data.getMonth() + 1).padStart(2, '0');
                const ano = data.getFullYear();
                const hora = String(data.getHours()).padStart(2, '0');
                const minuto = String(data.getMinutes()).padStart(2, '0');
                return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
            }

            function salvarComentarioAvaliacao(obraId, usuario, comentario, avaliacao) {
                const url = 'http://localhost:3000/salvar-comentario-avaliacao';
                const dados = {
                    obraId: obraId,
                    usuario: usuario,
                    comentario: comentario,
                    avaliacao: avaliacao
                };

                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Success:', data);
                        // Atualizar a exibição de comentários e avaliação, se necessário
                        carregarComentariosAvaliacao(obraId);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }

            function carregarComentariosAvaliacao(obraId) {
                const url = `http://localhost:3000/carregar-comentarios-avaliacoes?obraId=${obraId}`;

                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        console.log("Dados carregados:", data);
                        comentariosLista.innerHTML = '';
                        let totalAvaliacoes = 0;
                        let somaAvaliacoes = 0;

                        data.comentarios.forEach(item => {
                            const comentarioDiv = document.createElement('div');
                            comentarioDiv.classList.add('comentario-item');
                            comentarioDiv.innerHTML = `<span class="usuario">${item.usuario}</span>
                                                <span class="data">${item.data}</span>
                                                <p>${item.comentario}</p>`;
                            comentariosLista.appendChild(comentarioDiv);
                        });
                        if (data.avaliacoes && data.avaliacoes.length > 0) {
                            data.avaliacoes.forEach(avaliacaoObj => {
                                somaAvaliacoes += avaliacaoObj.avaliacao;
                                totalAvaliacoes++;
                            });
                            const mediaAvaliacao = totalAvaliacoes > 0 ? somaAvaliacoes / totalAvaliacoes : 0;
                            console.log(`Média das avaliações: ${mediaAvaliacao}`);

                            exibirMediaAvaliacao(mediaAvaliacao);
                        } else {
                            exibirMediaAvaliacao(0);
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao carregar comentários e avaliações:', error);
                    });
            }
            
            carregarComentariosAvaliacao(obraId);
});
    