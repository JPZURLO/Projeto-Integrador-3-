document.addEventListener("DOMContentLoaded", function () {
    const submenuToggle = document.getElementById("opcao_obra");
    const submenu = document.getElementById("submenu_obras");

    submenuToggle.addEventListener("click", function (event) {
        event.preventDefault();
        submenu.style.display = submenu.style.display === "none" ? "block" : "none";
    });

    // Fechar o submenu ao clicar fora
    document.addEventListener("click", function (event) {
        if (!submenuToggle.contains(event.target) && !submenu.contains(event.target)) {
            submenu.style.display = "none";
        }
    });
});
function logout() {
    // Aqui você pode adicionar a lógica de logout, como limpar o token de autenticação ou redirecionar para a página de login.
    alert('Você foi desconectado!');
    // Exemplo de redirecionamento para a página de login
    window.location.href = '/login'; // Redireciona para a página de login
}