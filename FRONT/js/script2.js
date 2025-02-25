document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const errorMessage = document.getElementById('error-message');

    // Cria o corpo da requisição de forma mais clara
    const requestBody = { email, senha };

    // Configura a requisição fetch
    const requestConfig = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    };

    fetch('http://localhost:5500/login', requestConfig)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Erro na requisição');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('✅ Login realizado:', data.message);
                alert('Login realizado com sucesso!');

                // Armazena os dados no localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('NomeCompleto', data.NomeCompleto);

                console.log('🔄 Redirecionando para tela_pos_login.html...');
                // Substitui a página para evitar voltar à tela de login
                window.location.replace('tela_pos_login.html');
            } else {
                errorMessage.textContent = data.message || 'Erro no login';
            }
        })
        .catch(error => {
            console.error('❌ Erro na requisição:', error);
            errorMessage.textContent = error.message || 'Erro desconhecido.';
        });
});
