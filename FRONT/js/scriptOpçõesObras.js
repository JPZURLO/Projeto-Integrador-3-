document.addEventListener("DOMContentLoaded", function () {
    const submenuToggle = document.querySelector(".has-submenu > a");
    
    submenuToggle.addEventListener("click", function (event) {
        event.preventDefault();
        const submenu = this.nextElementSibling;
        submenu.style.display = submenu.style.display === "block" ? "none" : "block";
    });
});
