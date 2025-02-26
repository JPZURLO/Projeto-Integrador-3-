document.addEventListener("DOMContentLoaded", function () {
    // Toggle submenu OBRAS
    document.querySelector(".has-submenu > a").addEventListener("click", function (event) {
        event.preventDefault();
        document.getElementById("submenu_obras").classList.toggle("show");
    });

    // Toggle submenu Usuário
    document.getElementById("user-name-link").addEventListener("click", function (event) {
        event.preventDefault();
        document.querySelector(".submenu2").classList.toggle("show");
    });

    // Fechar os submenus quando o logout for acionado
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            // Fechar qualquer submenu aberto
            document.getElementById("submenu_obras").classList.remove("show");
            document.querySelector(".submenu2").classList.remove("show");
        });
    }
});
