// scriptLogout.js

function logout() {
    // Limpa os dados de sessão, como o token e o nome do usuário
    localStorage.removeItem('token');
    localStorage.removeItem('NomeCompleto');
    
    // Substitui a entrada de navegação da página atual para login
    history.replaceState(null, null, "index.html"); // Substitui a página atual no histórico com a página de login
    
    // Redireciona para a página de login
    window.location.href = './index.html'; // Página de login
  }
// Impede o usuário de voltar à página anterior após o logout
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('token')) { // Se o token não existe, o usuário deve estar na tela de login
      history.pushState(null, null, location.href);  // Adiciona um novo histórico para a página de login
      window.onpopstate = function() {
        history.pushState(null, null, location.href); // Sempre empurra um novo estado para impedir o retorno
      };
    }
  });  