// scriptUserInfo.js

document.addEventListener('DOMContentLoaded', function() {
    const userNameElement = document.getElementById('user-name');
    const storedName = localStorage.getItem('NomeCompleto');
  
    if (storedName) {
      userNameElement.textContent = storedName;
    } else {
      fetchUserName(); // Chama a função para buscar o nome, caso não esteja no localStorage.
    }
  
    function fetchUserName() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado');
        return;
      }
  
      fetch('http://localhost:5500/api/obterNomeCompleto', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.NomeCompleto) {
          userNameElement.textContent = data.NomeCompleto;
          localStorage.setItem('NomeCompleto', data.NomeCompleto); // Atualiza o localStorage
        }
      })
      .catch(error => {
        console.error('Erro ao buscar o nome completo do usuário:', error);
      });
    }
  });
  