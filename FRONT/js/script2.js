document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;  // Verifique se 'email' está correto
    const senha = document.getElementById('password').value;  // Verifique se 'password' está correto
    const errorMessage = document.getElementById('error-message');

    // Cria o corpo da requisição corretamente
    const requestBody = { email, senha };  // Certifique-se de que 'senha' está com a mesma capitalização

    const requestConfig = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    };

    fetch('http://localhost:5500/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Email: email, Senha: senha })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }
        return response.json();  // Tenta fazer o parsing da resposta JSON
    })
    
    .then(data => {
        if (data.success) {
            console.log('✅ Login realizado:', data.message);
            alert('Login realizado com sucesso!');

            // Armazena os dados no localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('NomeCompleto', data.NomeCompleto);

            console.log('🔄 Redirecionando para login_cliente.html...');
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