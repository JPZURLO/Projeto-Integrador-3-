document.addEventListener('DOMContentLoaded', () => {
    const tipoUsuario = localStorage.getItem('userType');
    const linkCadastrarObra = document.querySelector('#submenu_obras a[href="cadastrarObras.html"]');
    const linkAlterarObra = document.querySelector('#submenu_obras a[href="EdiçãoDeObras.html"]');

    console.log("Tipo de usuário logado:", tipoUsuario);

    if (tipoUsuario && tipoUsuario.toLowerCase() === 'usuário comum') {
        console.log("Ocultando menus de cadastro e alteração para Usuário Comum.");
        if (linkCadastrarObra) {
            linkCadastrarObra.style.display = 'none';
            if (linkCadastrarObra.parentNode && linkAlterarObra && linkAlterarObra.parentNode &&
                linkCadastrarObra.parentNode.parentNode === linkAlterarObra.parentNode.parentNode &&
                linkCadastrarObra.parentNode.parentNode.children.length <= 2) {
                linkCadastrarObra.parentNode.parentNode.style.display = 'none';
            } else if (linkCadastrarObra.parentNode) {
                linkCadastrarObra.parentNode.style.display = 'none';
            }
        }
        if (linkAlterarObra) {
            linkAlterarObra.style.display = 'none';
            if (linkAlterarObra.parentNode) {
                linkAlterarObra.parentNode.style.display = 'none';
            }
        }

        const obrasMenuItem = document.querySelector('.has-submenu > a#opcao_obra');
        const submenuObrasList = document.getElementById('submenu_obras');
        if (obrasMenuItem && submenuObrasList) {
            const linksVisiveis = Array.from(submenuObrasList.children).some(li => li.style.display !== 'none');
            if (!linksVisiveis) {
                obrasMenuItem.parentNode.style.display = 'none';
            }
        }

    } else {
        console.log("Exibindo menus de cadastro e alteração para outros tipos de usuário.");
        if (linkCadastrarObra && linkCadastrarObra.parentNode) {
            linkCadastrarObra.parentNode.style.display = 'block';
        }
        if (linkAlterarObra && linkAlterarObra.parentNode) {
            linkAlterarObra.parentNode.style.display = 'block';
        }
        const obrasMenuItem = document.querySelector('.has-submenu > a#opcao_obra');
        if (obrasMenuItem && obrasMenuItem.parentNode) {
            obrasMenuItem.parentNode.style.display = 'block';
        }
    }
});