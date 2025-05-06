
document.addEventListener('DOMContentLoaded', function() {
            const userNameSpan = document.getElementById('user-name');
            const obrasMenu = document.getElementById('menu-obras');
            const submenuObras = document.getElementById('submenu_obras');
            const obraOptions = submenuObras.querySelectorAll('.obra-option');

            // Simulação do tipo de usuário (você precisará obter isso do seu backend)
            const userType = localStorage.getItem('userType'); // Ex: 'administrador', 'comum'

            function updateUserInterface(userType) {
                if (userType === 'administrador' || userType === 'engenheiro' || userType === 'gestor') {
                    obraOptions.forEach(option => option.style.display = 'block');
                } else if (userType === 'comum') {
                    obraOptions.forEach((option, index) => {
                        if (option.textContent.trim() === 'Consultar') {
                            option.style.display = 'block';
                        } else {
                            option.style.display = 'none';
                        }
                    });
                } else {
                    // Caso o tipo de usuário não seja reconhecido, esconde todas as opções
                    obraOptions.forEach(option => option.style.display = 'none');
                }
            }

            // Exibe o nome do usuário (você já tem essa lógica em scriptUserInfo.js)
            const storedUserName = localStorage.getItem('userName');
            if (storedUserName) {
                userNameSpan.textContent = storedUserName;
            }

            // Atualiza a interface com base no tipo de usuário
            if (userType) {
                updateUserInterface(userType);
            } else {
                // Se o tipo de usuário não estiver definido, você pode definir um padrão ou buscar do servidor
                console.warn('Tipo de usuário não definido. Mostrando opções padrão.');
                updateUserInterface('comum'); // Define 'comum' como padrão
            }
        });

        function logout() {
            // Limpar informações do usuário (incluindo o tipo de usuário, se armazenado localmente)
            localStorage.removeItem('userName');
            localStorage.removeItem('userType');
            // Redirecionar para a página de login
            window.location.href = '../login.html';
        }
