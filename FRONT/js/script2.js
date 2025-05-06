document.addEventListener('DOMContentLoaded', () => {
    const botaoLogin = document.getElementById('botao-login');
    const loginForm = document.getElementById('login-form'); // Adicione o ID do seu formulário de login
  
    // Função para atualizar o botão de usuário (mantida)
    function atualizarBotaoLogin(nomeUsuario, imagemUsuario) {
        if (botaoLogin) {
            botaoLogin.innerHTML = `
                <a href="#">
                    <img src="${imagemUsuario}" alt="Foto do usuário">
                    <span>${nomeUsuario}</span>
                    <i class="fas fa-cog"></i>
                </a>
            `;
  
            // Modal (mantido)
            const iconeOpcoes = botaoLogin.querySelector('.fa-cog');
            const modalOpcoes = document.getElementById('modal-opcoes');
            if (iconeOpcoes && modalOpcoes) {
                iconeOpcoes.addEventListener('click', () => {
                    modalOpcoes.style.display = 'block';
                });
            }
  
            // Logout (mantido - adicione a remoção do userType)
            const botaoLogout = document.getElementById('botao-logout');
            if (botaoLogout) {
                botaoLogout.addEventListener('click', () => {
                    localStorage.removeItem('logado');
                    localStorage.removeItem('nomeUsuario');
                    localStorage.removeItem('imagemUsuario');
                    localStorage.removeItem('userType'); // Remova o tipo de usuário também
                    window.location.href = 'index.html';
                });
            }
        } else {
            console.error("Botão com ID 'botao-login' não encontrado!");
        }
    }
  
    // Verifica se o usuário já está logado (mantido)
    if (localStorage.getItem('logado') === 'true') {
        const nomeUsuario = localStorage.getItem('nomeUsuario');
        const imagemUsuario = localStorage.getItem('imagemUsuario');
        atualizarBotaoLogin(nomeUsuario, imagemUsuario);
        // Redirecionar diretamente para a tela pós-login se já estiver logado
        window.location.href = '/FRONT/html/tela_pos_login.html'; // Adapte o caminho
    }
  
    // Evento de submit do formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const emailInput = document.getElementById('email'); // Adapte o ID do seu input de email
            const senhaInput = document.getElementById('senha'); // Adapte o ID do seu input de senha
  
            if (emailInput && senhaInput) {
                const email = emailInput.value;
                const senha = senhaInput.value;
  
                fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ Email: email, Senha: senha })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('logado', 'true');
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('nomeUsuario', data.NomeCompleto);
                        localStorage.setItem('userType', data.TipoDeUsuario); // Armazena o tipo de usuário
                        // Se você tiver uma lógica para imagem do usuário, armazene aqui também
                        window.location.href = '/FRONT/html/tela_pos_login.html'; // Redireciona para a tela pós-login
                    } else {
                        alert(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro no login:', error);
                    alert('Erro ao realizar login.');
                });
            } else {
                console.error("Campos de email ou senha não encontrados no formulário.");
            }
        });
    } else {
        console.error("Formulário de login com ID 'login-form' não encontrado.");
    }
  
    // Evento de clique no botão de login (se precisar redirecionar para a página de login inicialmente)
    if (botaoLogin && !loginForm) { // Apenas se não houver um formulário na mesma página
        botaoLogin.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
  });