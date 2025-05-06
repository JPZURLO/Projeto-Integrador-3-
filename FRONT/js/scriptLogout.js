function logout() {
    // Remove o token do localStorage ou sessionStorage
    localStorage.removeItem('token'); // Ou sessionStorage.removeItem('token');

    // Redireciona para a página de login
    window.location.href = '/FRONT/html/login.html';
}
const token = localStorage.getItem('token'); // Ou sessionStorage.getItem('token');

if (!token) {
    // Se não houver token, redireciona para a página de login
    window.location.href = '/FRONT/html/login.html';
} else {
    // Se houver token, configura o evento de "voltar" do navegador
    window.history.pushState(null, "", window.location.href);  // Adiciona um novo estado à pilha de navegação
    window.onpopstate = function() {
        // Quando o botão de "voltar" for pressionado, redireciona para a página de login
        window.location.href = '/FRONT/html/login.html';
    };
}