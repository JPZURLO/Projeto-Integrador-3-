// Função de login
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Coleta os dados do formulário
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Enviar os dados para o servidor de login
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});

// Função de registro
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Coleta os dados do formulário
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Enviar os dados para o servidor de registro
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});


// Função para alternar a visibilidade da senha
document.getElementById('showPassword').addEventListener('change', function() {
    const passwordField = document.getElementById('password');
    if (this.checked) {
        passwordField.type = 'text'; // Exibe a senha
    } else {
        passwordField.type = 'password'; // Oculta a senha
    }
});
