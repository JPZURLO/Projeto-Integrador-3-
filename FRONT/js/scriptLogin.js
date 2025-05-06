document.addEventListener('DOMContentLoaded', () => {
    try {
        const botaoLogin = document.getElementById('botao-login');
        const loginForm = document.getElementById('login-form');
        const estaLogado = localStorage.getItem('logado') === 'true';
        const caminho = window.location.pathname;

        console.log("Página atual:", caminho);
        console.log("Usuário logado:", estaLogado);

        // Função de redirecionamento mais segura
        function redirecionarSeNecessario() {
            const estaNaLogin = caminho.includes('login.html');
            const estaNaPosLogin = caminho.includes('tela_pos_login.html');

            if (estaLogado && estaNaLogin) {
                console.log("Redirecionando da página de login para a pós-login...");
                window.location.href = '/FRONT/html/tela_pos_login.html';
            }

            if (!estaLogado && estaNaPosLogin) {
                console.log("Usuário não autenticado tentando acessar tela protegida. Redirecionando...");
                window.location.href = '/FRONT/html/login.html';
            }
        }

        redirecionarSeNecessario();

        function atualizarBotaoLogin(nomeUsuario, imagemUsuario) {
            if (!botaoLogin) return;

            botaoLogin.innerHTML = `
                <a href="#">
                    <img src="${imagemUsuario || 'default.png'}" alt="Foto do usuário">
                    <span>${nomeUsuario}</span>
                    <i class="fas fa-cog"></i>
                </a>
            `;

            const iconeOpcoes = botaoLogin.querySelector('.fa-cog');
            const modalOpcoes = document.getElementById('modal-opcoes');

            if (iconeOpcoes && modalOpcoes) {
                iconeOpcoes.addEventListener('click', () => {
                    modalOpcoes.style.display = 'block';
                });
            }

        }

        if (estaLogado && botaoLogin) {
            atualizarBotaoLogin(
                localStorage.getItem('nomeUsuario'),
                localStorage.getItem('imagemUsuario')
            );
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (event) => {
                event.preventDefault();

                const email = document.getElementById('email')?.value;
                const senha = document.getElementById('senha')?.value;

                if (!email || !senha) {
                    console.error("Email ou senha não preenchidos.");
                    return;
                }

                console.log("Tentando logar com:", email);

                fetch('http://127.0.0.1:5500/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Email: email, Senha: senha }),
                    mode: 'cors'
                })
                    .then(async response => {
                        const contentType = response.headers.get("content-type");
                        if (!response.ok) {
                            const error = contentType?.includes("application/json")
                                ? await response.json()
                                : await response.text();
                            throw new Error(error.message || error);
                        }

                        if (!contentType?.includes("application/json")) {
                            throw new Error('Resposta não é JSON');
                        }

                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            localStorage.setItem('logado', 'true');
                            localStorage.setItem('token', data.token);
                            localStorage.setItem('userType', data.TipoDeUsuario);
                            localStorage.setItem('imagemUsuario', 'default.png');
                            localStorage.removeItem('NomeCompleto'); // Adicione esta linha para limpar o nome completo

                            console.log("Login bem-sucedido, redirecionando...");
                            window.location.href = '/FRONT/html/tela_pos_login.html';
                        } else {
                            alert(data.message || "Login falhou.");
                        }
                    })
                    .catch(err => {
                        console.error("Erro no login:", err);
                        alert("Erro ao tentar logar. Verifique o console.");
                    });
            });
        }

        // Redireciona ao clicar no botão login se estiver em outra página
        if (botaoLogin && !loginForm) {
            botaoLogin.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    } catch (e) {
        console.error("Erro ao carregar scriptLogin.js:", e);
        alert("Erro crítico na página. Veja o console.");
    }
});
